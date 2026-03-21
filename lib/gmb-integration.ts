/**
 * Google My Business (GMB) Integration
 * Syncs dispensary data with GMB listings
 */

import { google } from 'googleapis';
import { prisma } from './prisma';
import { log } from './logger';

const GMB_API_VERSION = 'v4';

interface GMBLocation {
  name: string;
  storeCode: string;
  locationName: string;
  primaryPhone: string;
  address: {
    regionCode: string;
    postalCode: string;
    administrativeArea: string;
    locality: string;
    addressLines: string[];
  };
  latlng: {
    latitude: number;
    longitude: number;
  };
  websiteUrl: string;
  regularHours: {
    periods: {
      openDay: string;
      openTime: string;
      closeDay: string;
      closeTime: string;
    }[];
  };
  primaryCategory: {
    displayName: string;
    categoryId: string;
  };
  profile: {
    description: string;
  };
  photos: {
    photos: {
      name: string;
      mediaFormat: string;
      locationAssociation: {
        category: string;
      };
    }[];
  };
}

export class GMBIntegration {
  private auth: any;
  private mybusiness: any;
  private accountName: string;

  constructor() {
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GMB_CLIENT_EMAIL,
        private_key: process.env.GMB_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: [
        'https://www.googleapis.com/auth/business.manage',
        'https://www.googleapis.com/auth/plus.business.manage',
      ],
    });

    this.mybusiness = (google as any).mybusiness({
      version: GMB_API_VERSION,
      auth: this.auth,
    });

    this.accountName = process.env.GMB_ACCOUNT_NAME || '';
  }

  /**
   * Fetch all locations from GMB
   */
  async fetchAllLocations(): Promise<GMBLocation[]> {
    try {
      const response = await this.mybusiness.accounts.locations.list({
        parent: this.accountName,
        pageSize: 100,
      });

      return response.data.locations || [];
    } catch (error: unknown) {
      log.admin.error('Error fetching GMB locations:', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Sync GMB location to database
   */
  async syncLocationToDB(gmbLocation: GMBLocation): Promise<void> {
    const slug = this.generateSlug(gmbLocation.locationName, gmbLocation.address.locality);

    const dispensaryData = {
      name: gmbLocation.locationName,
      slug,
      description: gmbLocation.profile?.description || '',
      address: gmbLocation.address.addressLines?.[0] || '',
      city: gmbLocation.address.locality,
      province: this.mapRegionToProvince(gmbLocation.address.administrativeArea),
      postalCode: gmbLocation.address.postalCode,
      latitude: gmbLocation.latlng?.latitude,
      longitude: gmbLocation.latlng?.longitude,
      phone: gmbLocation.primaryPhone,
      website: gmbLocation.websiteUrl,
      isLicensed: true,
      dataQualityScore: 85, // High score for GMB-synced businesses
      gmbLocationId: gmbLocation.name, // Store GMB ID for future syncs
      lastGmbSync: new Date(),
    };

    // Upsert dispensary
    const dispensary = await prisma.dispensary.upsert({
      where: { slug },
      update: dispensaryData,
      create: dispensaryData,
    });

    // Sync business hours
    if (gmbLocation.regularHours?.periods) {
      await this.syncBusinessHours(dispensary.id, gmbLocation.regularHours.periods);
    }

    // Sync photos
    if (gmbLocation.photos?.photos) {
      await this.syncPhotos(dispensary.id, gmbLocation.photos.photos);
    }

    log.admin.info(`✅ Synced: ${dispensaryData.name}`);
  }

  /**
   * Sync all GMB locations to database
   */
  async syncAllLocations(): Promise<{ success: number; failed: number }> {
    const locations = await this.fetchAllLocations();
    let success = 0;
    let failed = 0;

    for (const location of locations) {
      try {
        await this.syncLocationToDB(location);
        success++;
      } catch (error: unknown) {
        log.admin.error(`Failed to sync ${location.name}:`, { error: error instanceof Error ? error.message : String(error) });
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * Update GMB location from database
   */
  async updateGMBLocation(dispensaryId: string): Promise<void> {
    const dispensary = await prisma.dispensary.findUnique({
      where: { id: dispensaryId },
      include: { hours: true },
    });

    if (!dispensary || !dispensary.gmbLocationId) {
      throw new Error('Dispensary not found or no GMB location ID');
    }

    const locationUpdate = {
      locationName: dispensary.name,
      primaryPhone: dispensary.phone || '',
      address: {
        addressLines: [dispensary.address],
        locality: dispensary.city,
        administrativeArea: dispensary.province,
        postalCode: dispensary.postalCode,
        regionCode: 'CA',
      },
      websiteUrl: dispensary.website || '',
      profile: {
        description: dispensary.description || dispensary.descriptionAi || '',
      },
    };

    await this.mybusiness.accounts.locations.patch({
      name: dispensary.gmbLocationId,
      requestBody: locationUpdate,
      updateMask: 'locationName,primaryPhone,address,websiteUrl,profile.description',
    });

    log.admin.info(`✅ Updated GMB: ${dispensary.name}`);
  }

  /**
   * Fetch GMB reviews for a location
   */
  async fetchReviews(gmbLocationId: string): Promise<any[]> {
    try {
      const response = await this.mybusiness.accounts.locations.reviews.list({
        parent: gmbLocationId,
        pageSize: 50,
      });

      return response.data.reviews || [];
    } catch (error: unknown) {
      log.admin.error('Error fetching GMB reviews:', { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }

  /**
   * Sync GMB reviews to database
   */
  async syncReviews(dispensaryId: string, gmbLocationId: string): Promise<void> {
    const reviews = await this.fetchReviews(gmbLocationId);

    for (const review of reviews) {
      await prisma.dispensaryReview.upsert({
        where: {
          id: review.reviewId,
        },
        update: {
          rating: review.starRating,
          content: review.comment || '',
          authorName: review.reviewer.displayName,
          updatedAt: new Date(review.updateTime),
        },
        create: {
          id: review.reviewId,
          dispensaryId,
          rating: review.starRating,
          content: review.comment || '',
          authorName: review.reviewer.displayName,
          verified: true, // GMB reviews are verified
          createdAt: new Date(review.createTime),
        },
      });
    }

    // Update average rating
    const avgRating = await prisma.dispensaryReview.aggregate({
      where: { dispensaryId },
      _avg: { rating: true },
      _count: { id: true },
    });

    await prisma.dispensary.update({
      where: { id: dispensaryId },
      data: {
        averageRating: avgRating._avg.rating || 0,
        reviewCount: avgRating._count.id,
      },
    });

    log.admin.info(`✅ Synced ${reviews.length} reviews`);
  }

  /**
   * Fetch GMB insights (analytics)
   */
  async fetchInsights(gmbLocationId: string, startDate: string, endDate: string): Promise<any> {
    try {
      const response = await this.mybusiness.accounts.locations.reportInsights({
        name: this.accountName,
        requestBody: {
          locationNames: [gmbLocationId],
          basicRequest: {
            metricRequests: [
              { metric: 'QUERIES_DIRECT' },
              { metric: 'QUERIES_INDIRECT' },
              { metric: 'VIEWS_MAPS' },
              { metric: 'VIEWS_SEARCH' },
              { metric: 'ACTIONS_WEBSITE' },
              { metric: 'ACTIONS_PHONE' },
              { metric: 'ACTIONS_DRIVING_DIRECTIONS' },
              { metric: 'PHOTOS_VIEWS_MERCHANT' },
              { metric: 'PHOTOS_VIEWS_CUSTOMERS' },
            ],
            timeRange: {
              startTime: `${startDate}T00:00:00Z`,
              endTime: `${endDate}T23:59:59Z`,
            },
          },
        },
      });

      return response.data;
    } catch (error: unknown) {
      log.admin.error('Error fetching GMB insights:', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Upload photo to GMB
   */
  async uploadPhoto(gmbLocationId: string, imageUrl: string, category: string = 'INTERIOR'): Promise<void> {
    try {
      await this.mybusiness.accounts.locations.photos.create({
        parent: gmbLocationId,
        requestBody: {
          mediaFormat: 'PHOTO',
          locationAssociation: {
            category,
          },
          sourceUrl: imageUrl,
        },
      });

      log.admin.info(`✅ Uploaded photo to GMB: ${category}`);
    } catch (error: unknown) {
      log.admin.error('Error uploading photo:', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  // Helper methods
  private generateSlug(name: string, city: string): string {
    return `${name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}-${city.toLowerCase().replace(/\s+/g, '-')}`;
  }

  private mapRegionToProvince(regionCode: string): string {
    const mapping: Record<string, string> = {
      'ON': 'ON', 'Ontario': 'ON',
      'BC': 'BC', 'British Columbia': 'BC',
      'AB': 'AB', 'Alberta': 'AB',
      'QC': 'QC', 'Quebec': 'QC',
      'MB': 'MB', 'Manitoba': 'MB',
      'SK': 'SK', 'Saskatchewan': 'SK',
      'NS': 'NS', 'Nova Scotia': 'NS',
      'NB': 'NB', 'New Brunswick': 'NB',
      'NL': 'NL', 'Newfoundland and Labrador': 'NL',
      'PE': 'PE', 'Prince Edward Island': 'PE',
    };
    return mapping[regionCode] || regionCode;
  }

  private async syncBusinessHours(dispensaryId: string, periods: { openDay: string; openTime: string; closeDay: string; closeTime: string }[]): Promise<void> {
    const dayMapping: Record<string, number> = {
      'SUNDAY': 0, 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3,
      'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6,
    };

    // Delete existing hours
    await prisma.businessHours.deleteMany({
      where: { dispensaryId },
    });

    // Create new hours
    for (const period of periods) {
      await prisma.businessHours.create({
        data: {
          dispensaryId,
          dayOfWeek: dayMapping[period.openDay],
          openTime: period.openTime,
          closeTime: period.closeTime,
          isClosed: false,
        },
      });
    }
  }

  private async syncPhotos(dispensaryId: string, photos: { name: string; sourceUrl?: string; googleUrl?: string; locationAssociation: { category: string } }[]): Promise<void> {
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      
      await prisma.dispensaryImage.upsert({
        where: { id: photo.name },
        update: {
          url: photo.sourceUrl || photo.googleUrl,
          altText: `${photo.locationAssociation.category} photo`,
          isPrimary: i === 0,
        },
        create: {
          id: photo.name,
          dispensaryId,
          url: photo.sourceUrl || photo.googleUrl,
          altText: `${photo.locationAssociation.category} photo`,
          isPrimary: i === 0,
        },
      });
    }
  }
}

// Lazy singleton — only instantiates when accessed
let _instance: GMBIntegration | null = null;
export function getGMBIntegration(): GMBIntegration {
    if (!_instance) _instance = new GMBIntegration();
    return _instance;
}

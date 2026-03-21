/** Customer Testimonials from .cc — review cards with avatars */
export function CustomerTestimonials() {
  const reviews = [
    {
      name: "Sarah M.",
      location: "Toronto, ON",
      rating: 5,
      text: "Super fast delivery and the products are always top quality. My go-to dispensary!",
    },
    {
      name: "James L.",
      location: "Vancouver, BC",
      rating: 5,
      text: "Amazing value for money. The discreet packaging is a huge plus.",
    },
    {
      name: "Marie D.",
      location: "Montreal, QC",
      rating: 5,
      text: "Great product selection and the customer service is exceptional. Highly recommend!",
    },
  ];

  return (
    <section className="bg-[var(--card)] border-y border-[var(--border)] py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-heading font-bold text-center mb-2">
          What Our Customers Say
        </h2>
        <p className="text-center text-[var(--muted-foreground)] mb-10">
          Thousands of happy customers across Canada
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-[var(--background)] border border-[var(--border)]"
            >
              <div className="flex gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${star <= review.rating ? "text-amber-400" : "text-[var(--border)]"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-[var(--muted-foreground)] mb-4 italic">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--lime)]/20 rounded-full flex items-center justify-center text-[var(--lime)] font-bold text-sm">
                  {review.name[0]}
                </div>
                <div>
                  <p className="font-bold text-sm text-white">{review.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {review.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * tRPC API Route Handler — Next.js App Router
 * Handles all /api/trpc/* requests.
 * Auth: verifies JWT from cookie directly (defense-in-depth).
 */
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/trpc/root";
import { createTRPCContext } from "@/server/trpc/trpc";
import { verifySessionToken } from "@/lib/auth";
import { cookies } from "next/headers";

async function handler(req: Request) {
  // Verify JWT from cookie directly instead of trusting headers
  const cookieStore = await cookies();
  const token = cookieStore.get("mm-session")?.value
    || req.headers.get("Authorization")?.replace("Bearer ", "");

  let userId: string | null = null;
  let userRole: string | null = null;
  let userEmail: string | null = null;

  if (token) {
    const payload = verifySessionToken(token);
    if (payload && payload.exp >= Date.now() / 1000) {
      userId = payload.sub;
      userRole = payload.role;
      userEmail = payload.email;
    }
  }

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () =>
      createTRPCContext({ userId, userRole, userEmail }),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(`tRPC error on ${path ?? "<no-path>"}: ${error.message}`);
          }
        : undefined,
  });
}

export { handler as GET, handler as POST };

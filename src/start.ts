import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

// Guard: only run server-side checks when not in the browser
const isServer = typeof window === "undefined";

const REQUIRED_SUPABASE_ENV = [
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const missingSupabaseEnv = isServer
  ? REQUIRED_SUPABASE_ENV.filter((name) => !process.env[name])
  : [];

if (isServer && missingSupabaseEnv.length > 0) {
  const message =
    `[Startup] Missing Supabase environment variable(s): ${missingSupabaseEnv.join(", ")}. ` +
    `Add these to Netlify Environment Variables (Site Configuration → Environment Variables), then redeploy.`;
  console.error("\n" + "=".repeat(80) + "\n" + message + "\n" + "=".repeat(80) + "\n");
}

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
  functionMiddleware: [attachSupabaseAuth],
}));

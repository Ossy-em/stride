import type { MetadataRoute } from "next";

// Public pages are open to search engines; the signed-in app, APIs and tools are not.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/home",
        "/sessions",
        "/session/",
        "/agent",
        "/insights",
        "/goals",
        "/settings",
        "/onboarding",
        "/premium",
        "/dashboard",
        "/patterns",
        "/demo",
        "/dev-preview",
        "/maintenance-login",
      ],
    },
    sitemap: "https://trystrideai.com/sitemap.xml",
    host: "https://trystrideai.com",
  };
}

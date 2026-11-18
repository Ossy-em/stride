import type { MetadataRoute } from "next";

const URL = "https://trystrideai.com";

// Only the public pages. Add new public pages here so Google finds them.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${URL}/sign-in`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}

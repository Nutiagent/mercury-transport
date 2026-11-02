import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { services } from "@/content/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ["", "/teenused", "/ettevottest", "/kontakt", "/privaatsus"];
  return [
    ...pages.map((p) => ({
      url: `${site.url}${p || "/"}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: p === "" ? 1 : p === "/privaatsus" ? 0.2 : 0.8,
    })),
    ...services.map((s) => ({
      url: `${site.url}/teenused/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

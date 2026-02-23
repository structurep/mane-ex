import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const baseUrl = "https://maneexchange.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/browse`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/how-it-works`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/iso`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/discover`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/quiz`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // Active horse listings
  const { data: listings } = await supabase
    .from("horse_listings")
    .select("slug, updated_at")
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(5000);

  const listingPages: MetadataRoute.Sitemap = (listings || []).map((l) => ({
    url: `${baseUrl}/horses/${l.slug}`,
    lastModified: new Date(l.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Seller profiles
  const { data: sellers } = await supabase
    .from("profiles")
    .select("id, updated_at")
    .not("display_name", "is", null)
    .order("updated_at", { ascending: false })
    .limit(5000);

  const sellerPages: MetadataRoute.Sitemap = (sellers || []).map((s) => ({
    url: `${baseUrl}/sellers/${s.id}`,
    lastModified: new Date(s.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Farm pages
  const { data: farms } = await supabase
    .from("farms")
    .select("slug, updated_at")
    .order("updated_at", { ascending: false })
    .limit(5000);

  const farmPages: MetadataRoute.Sitemap = (farms || []).map((f) => ({
    url: `${baseUrl}/farms/${f.slug}`,
    lastModified: new Date(f.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...listingPages, ...sellerPages, ...farmPages];
}

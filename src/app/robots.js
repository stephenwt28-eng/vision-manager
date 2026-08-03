const siteUrl = "https://visionmanager.com.br";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/login", "/signup"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
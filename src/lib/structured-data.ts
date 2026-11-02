import { site } from "@/config/site";
import type { Service } from "@/content/services";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${site.url}/#organization`,
    name: site.brand,
    legalName: site.legalName,
    url: site.url,
    logo: `${site.url}/icon.svg`,
    image: `${site.url}/og.jpg`,
    telephone: site.phone.e164,
    email: site.email,
    vatID: site.vatNumber,
    identifier: { "@type": "PropertyValue", propertyID: "Äriregistri kood", value: site.registryCode },
    foundingDate: site.founded,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.legalAddress.street,
      addressLocality: site.legalAddress.city,
      postalCode: site.legalAddress.postalCode,
      addressRegion: site.legalAddress.county,
      addressCountry: site.legalAddress.country,
    },
    areaServed: { "@type": "Country", name: "Eesti" },
    openingHoursSpecification: site.available247
      ? {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          opens: "00:00",
          closes: "23:59",
        }
      : undefined,
    sameAs: [site.facebook],
  };
}

export function serviceJsonLd(s: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.title,
    description: s.metaDescription,
    url: `${site.url}/teenused/${s.slug}`,
    areaServed: { "@type": "Country", name: "Eesti" },
    provider: { "@id": `${site.url}/#organization` },
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${site.url}${it.path}`,
    })),
  };
}

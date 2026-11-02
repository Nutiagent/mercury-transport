/**
 * Central business configuration.
 *
 * Only verified facts live here. Sources (checked 2026-11-02):
 *  - mercurytransport.weebly.com (home + hinnakiri pages)
 *  - Estonian business register data via inforegister.ee / regia.ee
 * Anything marked `ownerToConfirm` is shown on the site but should be re-checked
 * by the owner before launch. See README → "Owner confirmation".
 */

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const site = {
  url: siteUrl,
  brand: "Mercury Transport",
  legalName: "MERCURY TRANSPORTATIONS OÜ",
  registryCode: "14063837",
  vatNumber: "EE101927697",
  founded: "2016-06-09",
  foundedYear: 2016,
  phone: {
    display: "+372 5685 5138",
    href: "tel:+37256855138",
    e164: "+37256855138",
  },
  /** Listed in the business register. ownerToConfirm: is this the inbox for enquiries? */
  email: "mercuryveod@gmail.com",
  /** Registered (legal) address from the business register. */
  legalAddress: {
    street: "Kauge tn 6-13",
    district: "Nõmme linnaosa",
    city: "Tallinn",
    postalCode: "11215",
    county: "Harju maakond",
    country: "EE",
  },
  /** Old site: "Soodne puksiirabi 24H/7" and "Teostame tööd 24/7". ownerToConfirm */
  available247: true,
  /** Old site: "Kaubavedu üle Eesti". */
  serviceArea: "Kogu Eesti",
  /** Old site: vehicles and construction equipment covered by transport liability insurance. */
  liabilityInsured: true,
  facebook: "https://www.facebook.com/puksiiriabi",
  locale: "et_EE",
  defaultTitle: "Mercury Transport — puksiirabi ja veod üle Eesti",
  defaultDescription:
    "Mercury Transport pakub ööpäevaringset puksiirabi, sõidukite ja ehitustehnika vedu ning muid haagisvedusid üle kogu Eesti. Helista +372 5685 5138.",
} as const;

export const nav = [
  { href: "/", label: "Avaleht" },
  { href: "/teenused", label: "Teenused" },
  { href: "/ettevottest", label: "Ettevõttest" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

export const analytics = {
  /** Optional, privacy-friendly analytics. Disabled unless configured. */
  plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || "",
};

export function formatAddress(a = site.legalAddress) {
  return `${a.street}, ${a.city} ${a.postalCode}, ${a.county}`;
}

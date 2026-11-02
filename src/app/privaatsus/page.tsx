import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { analytics, formatAddress, site } from "@/config/site";

export const metadata: Metadata = {
  title: "Privaatsusteave",
  description: "Kuidas Mercury Transport kasutab veebilehe päringuvormi kaudu saadetud isikuandmeid.",
  alternates: { canonical: "/privaatsus" },
};

const updated = "2. november 2026";

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="display mt-16 text-[clamp(1.5rem,3vw,2.1rem)] first:mt-0">{children}</h2>;
}

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        label="Privaatsus"
        title="Privaatsusteave"
        lead="Selgitame lihtsalt, milliseid andmeid päringuvorm kogub, miks ja kuidas neid kasutame."
        crumbs={[{ href: "/privaatsus", label: "Privaatsus" }]}
      />
      <section className="bg-ink py-16 md:py-24">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <p className="label text-steel">Viimati uuendatud</p>
            <p className="mt-2 font-mono text-sm">{updated}</p>
          </aside>
          <article className="max-w-3xl space-y-5 text-[1.05rem] leading-relaxed text-bone-dim text-pretty lg:col-span-8 [&_strong]:text-bone [&_a]:text-bone [&_a]:underline [&_a]:underline-offset-4">
            <H2>Vastutav töötleja</H2>
            <p>
              <strong>{site.legalName}</strong> (registrikood {site.registryCode}), {formatAddress()}. Küsimuste korral kirjuta{" "}
              <a href={`mailto:${site.email}`}>{site.email}</a> või helista <a href={site.phone.href}>{site.phone.display}</a>.
            </p>

            <H2>Milliseid andmeid päringuvorm kogub</H2>
            <p>Kui saadad hinnapäringu, edastame meile järgmised andmed:</p>
            <ul className="list-disc space-y-1 pl-6 marker:text-signal">
              <li>valitud teenus;</li>
              <li>pealevõtmise koht või sõiduki asukoht ning sihtkoht;</li>
              <li>sõiduki, tehnika või veose kirjeldus;</li>
              <li>soovitud kuupäev või kiireloomulisus;</li>
              <li>lisainfo, mille ise kirjutad;</li>
              <li>nimi, telefoninumber ja e-posti aadress.</li>
            </ul>
            <p>
              Rämpspostitõrjeks kasutame vormis peidetud kontrollvälja ja ajatemplit. Päringute arvu piiramiseks hoiame sinu IP-aadressi
              lühiajaliselt serveri mälus (kuni 15 minutit). IP-aadressi ei salvestata päringu juurde ega saadeta e-kirjaga.
            </p>

            <H2>Milleks andmeid kasutame</H2>
            <p>
              Kasutame andmeid ainult sinu päringule vastamiseks, hinnapakkumise koostamiseks ja veo korraldamiseks. Õiguslik alus on
              lepingueelsete meetmete võtmine sinu soovil ning lepingu täitmine (isikuandmete kaitse üldmääruse art 6 lg 1 p b).
            </p>
            <p>Me ei kasuta päringu andmeid turunduseks ega müü neid kellelegi.</p>

            <H2>Kuidas andmed liiguvad</H2>
            <p>
              Vormi andmed saadetakse meie serverist e-postiteenuse kaudu meie postkasti. E-posti edastamiseks kasutame
              volitatud töötlejat, kes töötleb andmeid ainult kirja kohaletoimetamiseks. Veebilehte majutab teenusepakkuja, kelle
              serverid võivad tehnilistes logides lühiajaliselt registreerida päringu aja ja IP-aadressi.
            </p>

            <H2>Kui kaua andmeid hoiame</H2>
            <p>
              Hoiame päringut nii kaua, kui on vaja sellele vastamiseks ja võimaliku veo korraldamiseks. Kui päringust lepingut ei
              sünni, kustutame selle mõistliku aja jooksul. Raamatupidamisdokumente säilitame seadusega nõutud tähtaja jooksul.
            </p>

            <H2>Küpsised ja analüütika</H2>
            <p>
              Veebileht ei kasuta reklaami- ega jälgimisküpsiseid.
              {analytics.plausibleDomain
                ? " Külastusstatistika kogumiseks kasutame küpsisevaba analüütikat, mis ei tuvasta üksikut külastajat."
                : " Külastusstatistikat praegu ei koguta."}
            </p>

            <H2>Sinu õigused</H2>
            <p>
              Sul on õigus küsida, milliseid andmeid sinu kohta hoiame, neid parandada, lasta need kustutada või esitada vastuväide
              nende töötlemisele. Kirjuta selleks <a href={`mailto:${site.email}`}>{site.email}</a>.
            </p>
            <p>
              Kui leiad, et sinu andmeid on töödeldud valesti, võid pöörduda Andmekaitse Inspektsiooni poole (
              <a href="https://www.aki.ee" target="_blank" rel="noopener noreferrer">
                www.aki.ee
              </a>
              ).
            </p>
          </article>
        </div>
      </section>
    </>
  );
}

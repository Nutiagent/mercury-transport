/**
 * Structured service content. Facts come from the existing website
 * (24/7 towing, freight across Estonia, construction equipment, liability insurance).
 * Practical notes avoid unverified numbers (capacities, prices, response times).
 */

export type ServiceSlug = "puksiirabi" | "soidukite-vedu" | "ehitustehnika-vedu" | "haagisveod";

/** Which optional quote-form fields are shown for the service. */
export type QuoteFieldConfig = {
  destination: "required" | "optional";
  detailsLabel: string;
  detailsPlaceholder: string;
  timing: "urgency" | "date";
  emailRequired: boolean;
};

export type Faq = { q: string; a: string };

export type Service = {
  slug: ServiceSlug;
  code: string;
  title: string;
  shortTitle: string;
  /** One-line summary for cards and the selector */
  summary: string;
  /** Lead paragraph on the detail page */
  lead: string;
  body: string[];
  examples: string[];
  practical: { label: string; text: string }[];
  checklist: string[];
  faqs: Faq[];
  quote: QuoteFieldConfig;
  urgent?: boolean;
  metaDescription: string;
  /** Cargo drawn by the technical illustration */
  glyph: "car-damaged" | "car" | "excavator" | "cargo";
};

export const services: Service[] = [
  {
    slug: "puksiirabi",
    code: "01",
    title: "Puksiirabi ja autoabi",
    shortTitle: "Puksiirabi",
    summary: "Ööpäevaringne abi, kui sõiduk jääb teele seisma või vajab pärast avariid äravedu.",
    lead:
      "Kui auto ei käivitu, on avariis kahjustada saanud või ei saa sellega lihtsalt edasi sõita, tuleme kohale ja viime sõiduki sinna, kuhu vaja.",
    body: [
      "Töötame ööpäevaringselt. Sõiduk laaditakse platvormile ja kinnitatakse nii, et see jõuab sihtkohta ilma lisakahjustusteta, olgu selleks remonditöökoda, kodu või parkla.",
      "Kiireim tee abini on telefonikõne. Nii saame asukoha, olukorra ja sõiduki andmed kohe selgeks ning anname teada, millal oleme kohal.",
    ],
    examples: [
      "Sõiduk ei käivitu",
      "Avariijärgne äravedu",
      "Rikkis või sõidukeelu saanud auto",
      "Vedu remonditöökotta",
    ],
    practical: [
      { label: "Saadavus", text: "24/7, ka öösiti ja nädalavahetustel" },
      { label: "Piirkond", text: "Tallinn, Harjumaa ja kogu Eesti" },
      { label: "Hind", text: "Sõltub kellaajast ja vahemaast. Ütleme hinna telefonis enne väljasõitu." },
      { label: "Kindlustus", text: "Veetavad sõidukid on kaetud veoseveo vastutuskindlustusega" },
    ],
    checklist: [
      "Täpne asukoht või lähim aadress",
      "Sõiduki mark, mudel ja mis juhtus",
      "Kas rattad pöörlevad ja rool liigub",
      "Kuhu sõiduk viia",
    ],
    faqs: [
      {
        q: "Kui kiiresti te kohale jõuate?",
        a: "See sõltub asukohast ja hetke koormusest. Helista ja ütle, kus oled, siis anname kohe realistliku saabumisaja.",
      },
      {
        q: "Kas saate vedada ka sõidukit, mis ei veere?",
        a: "Jah. Sõiduk tõmmatakse vintsiga platvormile. Ütle kõne ajal, kui rattad on blokeeritud või rool lukus, et saaksime selleks valmistuda.",
      },
      {
        q: "Kas pean ise sõiduki juures ootama?",
        a: "Soovitame jääda sõiduki juurde või lähedusse, kui see on ohutu. Kui see pole võimalik, lepime laadimise ja võtmete üleandmise eraldi kokku.",
      },
    ],
    quote: {
      destination: "optional",
      detailsLabel: "Sõiduk ja olukord",
      detailsPlaceholder: "Nt Volkswagen Passat, ei käivitu, rattad pöörlevad",
      timing: "urgency",
      emailRequired: false,
    },
    urgent: true,
    metaDescription:
      "Ööpäevaringne puksiirabi ja autoabi Tallinnas ja üle Eesti. Avariijärgne äravedu ja rikkis sõidukite vedu. Helista +372 5685 5138.",
    glyph: "car-damaged",
  },
  {
    slug: "soidukite-vedu",
    code: "02",
    title: "Sõidukite transport",
    shortTitle: "Sõidukite vedu",
    summary: "Planeeritud autovedu linnast linna: ostetud auto, hoolduses käik või ilma numbriteta sõiduk.",
    lead:
      "Veame sõidukeid platvormil üle kogu Eesti, kui autoga ei saa või ei ole mõistlik ise sõita.",
    body: [
      "Sobib, kui ostsid auto teisest linnast, sõidukil puudub ülevaatus või registreerimismärk, või on vaja viia sõiduk hooldusse, värvi- või kerepaika.",
      "Lepime aja ja aadressid kokku ette. Sõiduk kinnitatakse platvormile rihmadega ning see sõidab sihtkohta läbisõitu kogumata.",
    ],
    examples: ["Ostetud auto kojutoomine", "Vedu hooldusesse", "Ülevaatuseta sõiduk", "Vedu kere- ja värvitöökotta"],
    practical: [
      { label: "Piirkond", text: "Kogu Eesti" },
      { label: "Aeg", text: "Kokkuleppel, sobivaks kuupäevaks ja kellaajaks" },
      { label: "Hind", text: "Sõltub vahemaast. Küsi pakkumist vormi või telefoni teel." },
      { label: "Kindlustus", text: "Veoseveo vastutuskindlustus" },
    ],
    checklist: ["Pealevõtmise ja sihtkoha aadress", "Sõiduki mark, mudel ja kas see sõidab", "Soovitud kuupäev"],
    faqs: [
      {
        q: "Kas sõiduk peab olema sõidukorras?",
        a: "Ei pea. Ütle päringus, kas sõiduk liigub omal jõul, siis arvestame laadimisel vintsiga.",
      },
      {
        q: "Kas saan pakkumise enne kokkulepet?",
        a: "Jah. Saada päring aadresside ja sõiduki andmetega ning anname hinna enne, kui midagi kinnitad.",
      },
      {
        q: "Kas te veate ka väljapoole Tallinna?",
        a: "Jah, teeme sõidukite vedu üle kogu Eesti.",
      },
    ],
    quote: {
      destination: "required",
      detailsLabel: "Sõiduk",
      detailsPlaceholder: "Nt Toyota Corolla, sõidukorras / ei sõida",
      timing: "date",
      emailRequired: true,
    },
    metaDescription:
      "Sõidukite transport platvormil üle Eesti: ostetud autod, hooldusesse veod ja sõidukid ilma ülevaatuseta. Küsi pakkumist.",
    glyph: "car",
  },
  {
    slug: "ehitustehnika-vedu",
    code: "03",
    title: "Ehitustehnika vedu",
    shortTitle: "Ehitustehnika",
    summary: "Väiksema ehitus- ja eritehnika vedu objektile ja objektilt, ajastatud töögraafikuga.",
    lead:
      "Toome minikopad, laadurid ja muu kompaktse tehnika objektile õigeks ajaks ja viime töö lõppedes tagasi.",
    body: [
      "Ehitusel loeb ajastus. Planeerime veo nii, et tehnika on platsil siis, kui töö algab, ning lepime peale- ja mahalaadimise koha eelnevalt kokku.",
      "Ehitusplatsil eritehnikaga tehtavate tööde hind lepitakse kokku iga töö jaoks eraldi.",
    ],
    examples: ["Minikopad", "Kompaktlaadurid", "Kompaktsed teerullid", "Muu eritehnika"],
    practical: [
      { label: "Piirkond", text: "Kogu Eesti" },
      { label: "Aeg", text: "Planeeritud vedu, vajadusel korduvad sõidud" },
      { label: "Hind", text: "Kokkuleppel, vastavalt tehnikale ja marsruudile" },
      { label: "Kindlustus", text: "Ehitustehnika on veo ajal kaetud vastutuskindlustusega" },
    ],
    checklist: [
      "Tehnika tüüp, mudel ja ligikaudne mass",
      "Mõõtmed, kui tehnika on tavapärasest suurem",
      "Objekti aadress ja ligipääs",
      "Soovitud kuupäev ja kellaaeg",
    ],
    faqs: [
      {
        q: "Millist tehnikat saate vedada?",
        a: "Kompaktset ehitus- ja eritehnikat. Kirjuta päringusse masina mudel ja mass, siis kinnitame, kas see sobib meie platvormile.",
      },
      {
        q: "Kas saate tehnika ära tuua ka objekti lõpus?",
        a: "Jah. Võime kokku leppida nii toomise kui ka äraviimise, ka mitme objekti vahel.",
      },
      {
        q: "Kuidas hind kujuneb?",
        a: "Eritehnika veo hind lepitakse kokku iga töö jaoks, sõltuvalt masinast, vahemaast ja laadimistingimustest.",
      },
    ],
    quote: {
      destination: "required",
      detailsLabel: "Tehnika",
      detailsPlaceholder: "Nt minikopp Kubota KX019, u 1,9 t",
      timing: "date",
      emailRequired: true,
    },
    metaDescription:
      "Ehitustehnika vedu: minikopad, laadurid ja muu kompaktne eritehnika objektile ja objektilt üle Eesti. Küsi pakkumist.",
    glyph: "excavator",
  },
  {
    slug: "haagisveod",
    code: "04",
    title: "Muud haagisveod",
    shortTitle: "Haagisveod",
    summary: "Mahukad ja ebamugavad veosed, materjalid ja seadmed, mis vajavad platvormi.",
    lead:
      "Kui veos ei mahu kaubikusse või vajab avatud platvormi, leiame sellele lahenduse.",
    body: [
      "Veame üle Eesti seadmeid, materjale, haagiseid ja muid veoseid, mida on mugavam laadida avatud platvormile.",
      "Kirjelda veost võimalikult täpselt, siis saame hinnata laadimist, kinnitust ja marsruuti ning teha konkreetse pakkumise.",
    ],
    examples: ["Seadmed ja masinad", "Ehitusmaterjalid", "Väiksemad haagised", "Mahukad üksikveosed"],
    practical: [
      { label: "Piirkond", text: "Kaubavedu üle kogu Eesti" },
      { label: "Aeg", text: "Kokkuleppel" },
      { label: "Hind", text: "Pakkumine veose ja vahemaa põhjal" },
      { label: "Kindlustus", text: "Veoseveo vastutuskindlustus" },
    ],
    checklist: ["Mis on veos ja ligikaudne mass", "Mõõtmed", "Kuidas see laaditakse", "Aadressid ja kuupäev"],
    faqs: [
      {
        q: "Mida saab haagisega vedada?",
        a: "Kõike, mis sobib avatud platvormile ja on ohutult kinnitatav. Kirjelda veost ning ütleme, kas ja kuidas see õnnestub.",
      },
      {
        q: "Kas laadite veose ise peale?",
        a: "See sõltub veosest. Kirjuta päringusse, kas kohapeal on laadimisvõimalus olemas, ja lepime laadimise eraldi kokku.",
      },
      {
        q: "Kas teete ka ühekordseid vedusid?",
        a: "Jah. Pakume nii ühekordseid kui ka korduvaid vedusid.",
      },
    ],
    quote: {
      destination: "required",
      detailsLabel: "Veos",
      detailsPlaceholder: "Nt kaks puitkasti, kokku u 800 kg, 2 × 1,2 m",
      timing: "date",
      emailRequired: true,
    },
    metaDescription:
      "Haagisveod üle Eesti: seadmed, materjalid, haagised ja muud mahukad veosed avatud platvormil. Küsi pakkumist.",
    glyph: "cargo",
  },
];

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);
export const serviceSlugs = services.map((s) => s.slug) as [ServiceSlug, ...ServiceSlug[]];

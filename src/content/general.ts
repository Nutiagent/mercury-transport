import type { Faq } from "./services";

export const process = [
  {
    step: "01",
    title: "Kõne",
    text: "Helista ja ütle, kus oled ja mis juhtus. Planeeritud veo puhul saada päring vormi kaudu. Hinna ütleme enne, kui midagi kinnitad.",
    meta: "Telefon 24/7",
    scene: "arrival",
  },
  {
    step: "02",
    title: "Kohapeal",
    text: "Tuleme kohale ka öösel, vihmas ja lumes. Hindame olukorra ning valmistame sõiduki või tehnika ohutuks laadimiseks ette.",
    meta: "Ööpäevaringselt",
    scene: "recovery",
  },
  {
    step: "03",
    title: "Laadimine",
    text: "Sõiduk tõmmatakse vintsiga platvormile ja kinnitatakse veoks. Ka siis, kui see ise ei veere.",
    meta: "Kindlustatud vedu",
    scene: "loading",
  },
  {
    step: "04",
    title: "Sihtkohta",
    text: "Toimetame sõiduki või veose kokkulepitud kohta ja anname selle üle sulle või määratud vastuvõtjale.",
    meta: "Kogu Eesti",
    scene: "road",
  },
] as const;

export const generalFaqs: Faq[] = [
  {
    q: "Kas töötate ka öösel ja nädalavahetusel?",
    a: "Jah, puksiirabi on saadaval ööpäevaringselt, seitse päeva nädalas. Kiireima abi saamiseks helista +372 5685 5138.",
  },
  {
    q: "Millises piirkonnas te töötate?",
    a: "Asume Tallinnas ja teeme vedusid üle kogu Eesti.",
  },
  {
    q: "Kuidas saan hinnapakkumise?",
    a: "Täida päringuvorm või helista. Vajame pealevõtmise ja sihtkoha asukohta, veose kirjeldust ja soovitud aega. Hinna ütleme enne kokkulepet.",
  },
  {
    q: "Kas veetav sõiduk või tehnika on kindlustatud?",
    a: "Jah, kõik veetavad sõidukid ja ehitustehnika on kaetud veoseveo vastutuskindlustusega.",
  },
  {
    q: "Kas peaksin kiire abi korral täitma vormi?",
    a: "Kui oled teel hätta jäänud, helista otse. Kõne on kiirem kui vorm ja saame olukorra kohe selgeks.",
  },
];

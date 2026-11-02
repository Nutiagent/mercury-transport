import type { Faq } from "./services";

export const process = [
  {
    step: "01",
    title: "Võta ühendust",
    text: "Kiire abi korral helista. Planeeritud veo puhul saada päring vormi kaudu või helista.",
    meta: "Telefon 24/7",
  },
  {
    step: "02",
    title: "Täpsustame detailid",
    text: "Selgitame välja asukoha, sihtkoha, veose ja aja ning ütleme hinna enne, kui midagi kinnitad.",
    meta: "Hind enne kokkulepet",
  },
  {
    step: "03",
    title: "Laadimine ja kinnitus",
    text: "Sõiduk või tehnika laaditakse platvormile ja kinnitatakse veoks ohutult.",
    meta: "Kindlustatud vedu",
  },
  {
    step: "04",
    title: "Üleandmine sihtkohas",
    text: "Toimetame veose kokkulepitud kohta ja anname selle üle sulle või määratud vastuvõtjale.",
    meta: "Kogu Eesti",
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

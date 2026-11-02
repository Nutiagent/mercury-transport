# Mercury Transporti veebileht GoHighLevelis

GHL-i jaoks on leht tehtud valmis HTML-plokkidena. Disain, film, peatükid, menüü ja teenuste valik töötavad samamoodi nagu algses Next.js versioonis. Iga leht on üks plokk, mille kleebid GHL-i **Custom Code** elementi. Ühine stiil ja skript lisatakse **üks kord** kogu saidi päisesse.

Failid asuvad kaustas `ghl/dist/`:

| Fail | Mis see on |
| --- | --- |
| `head.html` | Saidi päisesse: fondid, stiil (`mercury.css`) ja skript (`mercury.js`). Stiil ja skript tulevad GitHubist jsDelivri kaudu. |
| `head-inline.html` | Sama sisu, aga stiil ja skript on otse failis sees (umbes 67 KB). Kasuta seda ainult siis, kui CDN-i ei soovi. |
| `pages/*.html` | Üks fail iga lehe kohta. Kleebi Custom Code elementi. |
| `preview/*.html` | Ainult kohalikuks testimiseks: `node scripts/serve-ghl.mjs` |

## 1. Loo veebileht

1. Mine GHL-is **Sites → Websites → + New Website** ja vali **From Blank**. Pane nimeks „Mercury Transport“.
2. Mine **Settings → Head tracking code** ja kleebi sinna kogu `head.html` sisu.
3. Lisa saidi seadetes favicon. Fail `public/icon.svg` sobib, aga kui GHL tahab PNG-d, tee sellest 512×512 PNG.

## 2. Lisa lehed

Tee iga lehe jaoks nii:

1. **+ Add Page.** Pane nimi ja tee (path) nagu tabelis.
2. Ava lehe muutja ja lisa üks **Full Width** sektsioon ilma päise ja jaluseta. Sea sektsiooni, rea ja veeru **padding 0**, **margin 0** ja taustaks läbipaistev.
3. Lisa veergu element **Custom Code** ja kleebi sinna kogu vastava `pages/…html` faili sisu.
4. Lisa lehe seadetes (**Page Settings → SEO Meta Data**) pealkiri ja kirjeldus tabelist. **Social image** jaoks sobib
   `https://cdn.jsdelivr.net/gh/Nutiagent/mercury-transport@main/public/og.jpg`.

Lehe menüü ja jalus on juba ploki sees, nii et GHL-i oma päist ja jalust ei ole vaja.

| Tee (path) | Fail | SEO pealkiri | SEO kirjeldus |
| --- | --- | --- | --- |
| `/` (avaleht) | `pages/avaleht.html` | Mercury Transport — puksiirabi ja veod üle Eesti | Mercury Transport pakub ööpäevaringset puksiirabi, sõidukite ja ehitustehnika vedu ning muid haagisvedusid üle kogu Eesti. Helista +372 5685 5138. |
| `/teenused` | `pages/teenused.html` | Teenused \| Mercury Transport | Puksiirabi 24/7, sõidukite transport, ehitustehnika vedu ja muud haagisveod üle Eesti. Vaata teenuseid ja küsi pakkumist. |
| `/puksiirabi` | `pages/puksiirabi.html` | Puksiirabi ja autoabi \| Mercury Transport | Ööpäevaringne puksiirabi ja autoabi Tallinnas ja üle Eesti. Avariijärgne äravedu ja rikkis sõidukite vedu. Helista +372 5685 5138. |
| `/soidukite-vedu` | `pages/soidukite-vedu.html` | Sõidukite transport \| Mercury Transport | Sõidukite transport platvormil üle Eesti: ostetud autod, hooldusesse veod ja sõidukid ilma ülevaatuseta. Küsi pakkumist. |
| `/ehitustehnika-vedu` | `pages/ehitustehnika-vedu.html` | Ehitustehnika vedu \| Mercury Transport | Ehitustehnika vedu: minikopad, laadurid ja muu kompaktne eritehnika objektile ja objektilt üle Eesti. Küsi pakkumist. |
| `/haagisveod` | `pages/haagisveod.html` | Muud haagisveod \| Mercury Transport | Haagisveod üle Eesti: seadmed, materjalid, haagised ja muud mahukad veosed avatud platvormil. Küsi pakkumist. |
| `/ettevottest` | `pages/ettevottest.html` | Ettevõttest \| Mercury Transport | Mercury Transport (MERCURY TRANSPORTATIONS OÜ) on 2016. aastal Tallinnas asutatud puksiirabi- ja veoettevõte, mis teeb vedusid üle kogu Eesti. |
| `/kontakt` | `pages/kontakt.html` | Kontakt ja hinnapäring \| Mercury Transport | Küsi pakkumist puksiirabile, sõidukite või ehitustehnika veole. Kiire abi korral helista ööpäevaringselt +372 5685 5138. |
| `/privaatsus` | `pages/privaatsus.html` | Privaatsusteave \| Mercury Transport | Kuidas Mercury Transport kasutab veebilehe päringuvormi kaudu saadetud isikuandmeid. |

Lehtede omavahelised lingid eeldavad just neid teid. Kui mõnda teed muudad, tuleb ka plokid uuesti genereerida (vt punkt 6).

## 3. Hinnapäringu vorm (GHL Forms)

1. Mine **Sites → Forms → Builder** ja loo vorm „Hinnapäring“. Soovitatud väljad:
   - Teenus (valik: Puksiirabi / Sõidukite vedu / Ehitustehnika vedu / Haagisvedu)
   - Nimi
   - Telefon
   - E-post (mittekohustuslik)
   - Kust (pealevõtmise koht)
   - Kuhu (sihtkoht)
   - Mida vedada / mis juhtus
   - Soovitud kuupäev
   - Nõusolek privaatsusteabega (link `/privaatsus`)
2. Kujundus: tume taust `#09090a`, tekst `#f2ede4`, nupp `#ff5b1a` musta tekstiga, nurgad 0 px.
3. Teenuste lehtedel on nupud kujul `/kontakt?teenus=puksiirabi#paring`. Kui annad teenuse väljale **Query Key** väärtuseks `teenus`, täidab GHL selle välja URL-ist ise.
4. Vali **Integrate → Embed** ja kopeeri kood.
5. Ava `/kontakt` lehe Custom Code plokk. Asenda kõik ridade `<!-- GHL_FORM_START …` ja `<!-- GHL_FORM_END -->` vahel embed-koodiga. Kuni vormi pole, näeb külastaja seal helistamise ja e-kirja nuppe.
6. Seadista **Automation → Workflows** nii, et iga uue päringu kohta tuleb teavitus e-posti või SMS-iga.

## 4. Domeen

1. Ühenda domeen: **Settings → Domains**.
2. Anna domeen mulle (või käivita `SITE_URL=https://domeen.ee npm run ghl`) ja kleebi plokid uuesti. Domeeni on vaja otsingumootorite struktureeritud andmete (JSON-LD) jaoks. Praegu on seal ajutine `https://SINU-DOMEEN.ee`.

## 5. Kust pildid ja videod tulevad

Videod, pildid, stiil ja skript tulevad GitHubi repost jsDelivri tasuta CDN-i kaudu, nii et GHL-i Media Library'sse ei pea midagi üles laadima. Kui soovid kõike GHL-is hoida, tee nii:

1. Lae `public/media/` failid GHL-i Media Library'sse.
2. Kopeeri sealt kausta URL.
3. Käivita `MEDIA_BASE=<url>/ npm run ghl`. Failinimed peavad jääma samaks.

`@main` tähendab, et jsDelivr serveerib reposti viimast versiooni. Pärast muudatusi võib vahemälu uueneda kuni 12 tunniga. Kiiremaks uuendamiseks ava `https://purge.jsdelivr.net/gh/Nutiagent/mercury-transport@main/ghl/dist/mercury.css` (ja sama `mercury.js` jaoks).

## 6. Plokkide uuesti genereerimine

Kui sisu muutub (näiteks `src/config/site.ts` või `src/content/*`):

```bash
npm install
npm run build
SITE_URL=https://domeen.ee npm run ghl     # → ghl/dist/
node scripts/serve-ghl.mjs                 # eelvaade http://localhost:4300
node scripts/test-ghl.mjs                  # automaatkontroll (vajab Playwrighti)
```

Seejärel push GitHubi ja kleebi muutunud plokid GHL-i.

## Mida kontrollida pärast GHL-i panemist

- GHL võib lisada oma CSS-i. Kui kuskil on ümber ploki valge serv või vahe, sea sektsiooni, rea ja veeru padding ja margin nulli.
- Kontrolli telefonis, et film mängib ja menüü avaneb.
- Privaatsusleht mainib, et andmed lähevad HighLevel CRM-i. HighLevel on USA ettevõte, seega lase omanikul või juristil see üle vaadata. Kui lisad GHL-i vestlusakna või jälgimiskoodi, tuleb privaatsusteksti täiendada.

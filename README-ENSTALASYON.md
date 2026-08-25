# Rose Créatrice — Gid Enstalasyon

App la fèt (design, galri, sistèm rezèvasyon "bot"). Gen **4 etap** pou l mache
pou vre sou entènèt e pou moun ka enstale l tankou yon app nòmal.

---

## Etap 1 — Kreye pwojè Firebase (5-10 min, gratis)

1. Ale sou **console.firebase.google.com**, konekte ak kont Google ou a.
2. Klike **"Ajoute yon pwojè"** → bay li non `rose-creatrice` → kontinye
   (ou ka dezaktive Google Analytics, li pa obligatwa).
3. Nan meni goch la, klike **Build > Firestore Database** → **Kreye baz done** →
   chwazi **mòd pwodiksyon** → chwazi yon rejyon (egzanp `us-east1`).
4. Ale nan zòn **Règ (Rules)** anndan Firestore, efase sa ki la a, epi kopye-kole
   tout kontni fichye `firestore.rules` ki nan dosye sa a → klike **Pibliye**.
5. Retounen sou **Paramèt pwojè la (⚙️ zanno a) > Jeneral**, desann jiskaske
   ou wè **"Vre app yo"**. Klike ti ikòn `</>` (Web) → bay li non `rose-creatrice-web`
   → **Anrejistre app la**.
6. Firebase ap montre w yon bout kòd ak yon objè `firebaseConfig = {...}`.
   **Kopye valè** ki nan li (apiKey, authDomain, projectId, elt.) epi kole yo
   nan fichye **`js/config.js`**, kote li make `REMPLASE_AVEK...`.

C'est tout — pa gen lòt bagay pou fè sou Firebase.

---

## Etap 2 — Konfigire nimewo WhatsApp ak enfòmasyon biznis la

Louvri `js/config.js` epi modifye:

- `WHATSAPP_NUMBER` → mete nimewo WhatsApp biznis la (fòma: `509xxxxxxxx`,
  san "+" ni espas).
- `BUSINESS.instagram` / `facebook` / `tiktok` → mete lyen paj ou yo si genyen.
- `CAPACITY_BY_WEEKDAY` → si ou vle chanje kantite plas pa jou pi devan,
  se la pou modifye l.

---

## Etap 3 — Mete app la sou entènèt (GitHub Pages)

1. Kreye yon repo GitHub (egzanp `rose-creatrice`), telechaje **tout** dosye
   sa a ladan (`index.html`, `css/`, `js/`, `images/`, `icons/`,
   `manifest.json`, `service-worker.js`).
2. Nan repo a: **Settings > Pages** → chwazi branch `main`, dosye `/ (root)` →
   **Save**.
3. Apre kèk minit, GitHub ap ba w yon lyen tankou
   `https://tonkont.github.io/rose-creatrice/`. Se lyen sa a ou pral pataje
   bay kliyan yo.

> 💡 Si ou vle yon non domèn pèsonalize (egzanp `rosecreatrice.com`), ou ka
> konekte l nan menm paj "Pages" la — mande m si ou bezwen èd pou sa.

---

## Etap 4 — Enstale app la sou telefòn

- **Android/Chrome**: louvri lyen an, ap gen yon bouton "⬇️ Enstale app la"
  ki parèt anba ekran an — klike sou li.
- **iPhone/Safari**: louvri lyen an → bouton **Pataje** (⬆️) → **"Ajoute sou
  Ekran Akèy la"**.
- Yon fwa enstale, app la ap mande otorizasyon pou aktive **notifikasyon** —
  aksepte pou pa manke nouvèl.

---

## Bagay ou ka vle chanje pita

- **Ikòn/logo**: `icons/icon-192.png` ak `icons/icon-512.png` se yon ikòn
  woz jeneri m kreye an atandan yon vre logo. Ranplase yo (menm dimansyon)
  depi ou gen yon logo ofisyèl.
- **Foto**: ajoute nouvo foto nan `images/<kategori>/` epi ajoute yon
  `<div class="gallery__item">` nouvo nan `index.html` (gade modèl ki
  deja la yo).
- **Kategori san foto** (Tableau PVC, Décoration, Panier surprise): pa gen
  foto pou yo kounye a — voye m yo pou m ajoute nan galri a.

---

## Konsènan notifikasyon WhatsApp otomatik

Kounye a, lè yon kliyan konfime yon rezèvasyon, app la ouvri yon lyen
WhatsApp deja ranpli ak tout detay yo (kliyan an sèlman gen pou tape "voye").
Sa a gratis e mache imedyatman.

Yon vrè bot ki voye mesaj **san pèsonn pa touche telefòn** mande yon
apwobasyon biznis Meta ak yon sèvis peman (Twilio/360dialog) — n ap ka
mete sa an plas pita si biznis la grandi ak ou vle envesti nan sa.

---

## Google Business Profile

Pou app la parèt sou Google Search/Maps lè moun chèche "Rose Créatrice"
oswa "atelye crochet Delmas":

1. Ale sou **business.google.com** ak menm kont Google ou sèvi pou Firebase la.
2. Klike **"Jere kounye a"** → antre non biznis la (`Rose Créatrice`) →
   adrès la (`Delmas 33, Petite Place Cazeau, 3ème Cité, Port-au-Prince`).
3. Chwazi kategori: *Artisanat / Créateur de mode / Boutique cadeaux* (pi
   pre sa w fè a).
4. Ajoute lyen sit ou a (GitHub Pages), nimewo telefòn, ak orè travay.
5. Google ap voye yon kòd verifikasyon (kat postal oswa telefòn) — antre l
   pou konfime biznis la se pa w.

Si ou vle, m ka ede w ranpli tèks deskripsyon ak chwazi bon mo kle yo.

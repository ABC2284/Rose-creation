// ============================================================
// SEND-NOTIFICATIONS.JS — Rose Créatrice
// ============================================================
// Skrip sa a kouri sou GitHub Actions (pa sou telefòn ou, pa
// sou Firebase) — li itilize "firebase-admin" pou l ka voye
// notifikasyon push san Cloud Functions, kidonk san Blaze plan.
//
// 2 mòd:
//   node scripts/send-notifications.js weekly   -> rapèl chak wikenn
//   node scripts/send-notifications.js dayfull  -> alèt jou/semèn plen
// ============================================================
const admin = require("firebase-admin");

// ⚠️ Dwe menm valè ak CAPACITY_BY_WEEKDAY nan js/config.js
const CAPACITY_BY_WEEKDAY = {
  0: 2, // dimanch
  1: 2, // lendi
  2: 2, // madi
  3: 1, // mèkredi
  4: 2, // jedi
  5: 2, // vandredi
  6: 2, // samdi
};
const BOOKING_WINDOW_DAYS = 21;

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const JOU_KREYOL = ["Dim", "Len", "Mad", "Mèk", "Jed", "Van", "Sam"];
const MWA_KREYOL = [
  "Janvye", "Fevriye", "Mas", "Avril", "Me", "Jen",
  "Jiyè", "Out", "Septanm", "Oktòb", "Novanm", "Desanm",
];

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function labelDate(d) {
  return `${JOU_KREYOL[d.getDay()]} ${d.getDate()} ${MWA_KREYOL[d.getMonth()]}`;
}
function buildDayList() {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < BOOKING_WINDOW_DAYS; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

// ---- Voye yon mesaj bay TOUT telefòn anrejistre ----
async function sendToAllTokens(title, body) {
  const snap = await db.collection("pushTokens").get();
  const tokens = snap.docs.map((d) => d.id);
  if (tokens.length === 0) {
    console.log("Pa gen okenn telefòn anrejistre pou notifikasyon.");
    return;
  }

  const CHUNK = 500; // limit FCM multicast
  let sent = 0;
  const invalidTokens = [];

  for (let i = 0; i < tokens.length; i += CHUNK) {
    const batch = tokens.slice(i, i + CHUNK);
    const res = await admin.messaging().sendEachForMulticast({
      tokens: batch,
      notification: { title, body },
      webpush: { notification: { icon: "https://abc2284.github.io/Rose-creation/icons/icon-192.png" } },
    });
    sent += res.successCount;
    res.responses.forEach((r, idx) => {
      if (!r.success && r.error?.code === "messaging/registration-token-not-registered") {
        invalidTokens.push(batch[idx]);
      }
    });
  }

  // Netwaye token ki pa valid ankò (telefòn ki dezenstale app la)
  await Promise.all(
    invalidTokens.map((t) => db.collection("pushTokens").doc(t).delete().catch(() => {}))
  );

  console.log(`Mesaj voye bay ${sent}/${tokens.length} telefòn. ${invalidTokens.length} token retire.`);
}

// ---- Mòd 1: Rapèl chak wikenn ----
async function runWeekly() {
  await sendToAllTokens(
    "🌹 Rose Créatrice",
    "Wikenn nan ap rive! Prese fè rezèvasyon w pou pa manke plas ou."
  );
}

// ---- Mòd 2: Alèt jou/semèn plen ----
async function runDayFullCheck() {
  const days = buildDayList();
  const dateKeys = days.map(fmtDate);

  // Li tout kontè yo yon sèl kou
  const counters = {};
  const chunks = [];
  for (let i = 0; i < dateKeys.length; i += 10) chunks.push(dateKeys.slice(i, i + 10));
  for (const chunk of chunks) {
    const snap = await db
      .collection("dayCounters")
      .where(admin.firestore.FieldPath.documentId(), "in", chunk)
      .get();
    snap.forEach((d) => (counters[d.id] = d.data().count || 0));
  }

  // ---- Verifye chak jou endividyèlman ----
  for (const d of days) {
    const key = fmtDate(d);
    const cap = CAPACITY_BY_WEEKDAY[d.getDay()] ?? 2;
    const used = counters[key] || 0;
    const isFull = used >= cap;

    const notifRef = db.collection("dayFullNotifications").doc(key);
    const notifSnap = await notifRef.get();
    const alreadyNotified = notifSnap.exists;

    if (isFull && !alreadyNotified) {
      // Chèche pwochen jou ki disponib pou mete nan mesaj la
      const idx = days.findIndex((x) => fmtDate(x) === key);
      let suggestion = null;
      for (let i = idx + 1; i < days.length; i++) {
        const k2 = fmtDate(days[i]);
        const cap2 = CAPACITY_BY_WEEKDAY[days[i].getDay()] ?? 2;
        if ((counters[k2] || 0) < cap2) {
          suggestion = labelDate(days[i]);
          break;
        }
      }
      await sendToAllTokens(
        "🌹 Rose Créatrice",
        `Jou ${labelDate(d)} konplè!` +
          (suggestion ? ` Pwochen jou disponib: ${suggestion}.` : " Tout kalandriye a plen kounye a.")
      );
      await notifRef.set({ notifiedAt: new Date().toISOString() });
    }

    if (!isFull && alreadyNotified) {
      // Jou a rouvri (yon rezèvasyon te anile) — retire mak la pou l ka re-notifye pi ta si l replen
      await notifRef.delete().catch(() => {});
    }
  }

  // ---- Verifye si TOUT 7 pwochen jou yo plen ----
  const first7 = days.slice(0, 7);
  const weekKey = `week-${fmtDate(first7[0])}`;
  const weekAllFull = first7.every((d) => {
    const key = fmtDate(d);
    const cap = CAPACITY_BY_WEEKDAY[d.getDay()] ?? 2;
    return (counters[key] || 0) >= cap;
  });
  const weekNotifRef = db.collection("dayFullNotifications").doc(weekKey);
  const weekNotifSnap = await weekNotifRef.get();

  if (weekAllFull && !weekNotifSnap.exists) {
    await sendToAllTokens(
      "🌹 Rose Créatrice",
      "Tout semèn sa a konplè! Rezève pou semèn pwochèn pou pa manke plas ou."
    );
    await weekNotifRef.set({ notifiedAt: new Date().toISOString() });
  } else if (!weekAllFull && weekNotifSnap.exists) {
    await weekNotifRef.delete().catch(() => {});
  }
}

// ---- Antre pwogram nan ----
const mode = process.argv[2];
(async () => {
  try {
    if (mode === "weekly") {
      await runWeekly();
    } else if (mode === "dayfull") {
      await runDayFullCheck();
    } else {
      console.error("Itilizasyon: node send-notifications.js [weekly|dayfull]");
      process.exit(1);
    }
    process.exit(0);
  } catch (err) {
    console.error("Erè:", err);
    process.exit(1);
  }
})();

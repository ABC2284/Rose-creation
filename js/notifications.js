// ============================================================
// NOTIFIKASYON PUSH — Rose Créatrice (Firebase Cloud Messaging)
// ============================================================
// Anrejistre telefòn nan pou l ka resevwa mesaj Carl voye
// dirèkteman soti nan Firebase Console (Engage > Messaging),
// san okenn kòd sèvè.
import {
  app,
  db,
  getMessaging,
  getToken,
  onMessage,
  isMessagingSupported,
  collection,
  doc,
  Timestamp,
} from "./firebase-init.js";
import { setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { VAPID_KEY } from "./config.js";

const banner = document.getElementById("notifBanner");
const enableBtn = document.getElementById("notifEnableBtn");
const dismissBtn = document.getElementById("notifDismissBtn");

function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}
function isStandaloneApp() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

async function saveTokenForRecords(token) {
  try {
    // Anrejistreman senp — sèvi si nou vle voye mesaj sib pi ta.
    // Pa obligatwa pou "voye a tout moun" via Firebase Console.
    await setDoc(doc(collection(db, "pushTokens"), token), {
      token,
      updatedAt: Timestamp ? Timestamp.now() : new Date().toISOString(),
      lang: navigator.language || "",
    });
  } catch (err) {
    console.warn("Pa t ka anrejistre token push la (pa grav):", err);
  }
}

async function registerForPush() {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Navigatè a pa sipòte Service Worker");
  }
  const supported = await isMessagingSupported().catch(() => false);
  if (!supported) {
    throw new Error("Navigatè a pa sipòte Firebase Messaging (isSupported=false)");
  }
  if (VAPID_KEY.startsWith("REMPLASE")) {
    throw new Error("VAPID_KEY poko konfigire nan js/config.js");
  }

  const swReg = await navigator.serviceWorker.ready;
  const messaging = getMessaging(app);
  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: swReg,
  });
  if (!token) {
    throw new Error("getToken() pa retounen okenn token");
  }

  const isNewToken = !localStorage.getItem("rc_push_registered");
  await saveTokenForRecords(token);

  // Mesaj "byenvini" lokal — parèt imedyatman, san w pa bezwen
  // tann pwochen mesaj Carl voye soti nan Firebase Console.
  if (isNewToken) {
    localStorage.setItem("rc_push_registered", "1");
    swReg.showNotification("🌹 Byenvini nan Rose Créatrice!", {
      body: "Notifikasyon aktive — w ap resevwa nouvèl ak rapèl rezèvasyon.",
      icon: "./icons/icon-192.png",
    });
  }

  // Mesaj ki rive PANDAN app la ouvri (premye plan)
  onMessage(messaging, (payload) => {
    const title = payload.notification?.title || "Rose Créatrice";
    const body = payload.notification?.body || "";
    swReg.showNotification(title, {
      body,
      icon: "./icons/icon-192.png",
    });
  });
  return true;
}

function maybeShowBanner() {
  if (!banner) return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "default") return;
  if (localStorage.getItem("rc_notif_dismissed") === "1") return;
  // Sou iPhone, notifikasyon web sèlman disponib si app la enstale sou ekran akèy la
  if (!isStandaloneApp() && isIOS()) return;

  banner.hidden = false;
}

if (enableBtn) {
  enableBtn.addEventListener("click", async () => {
    let statusMsg = "";
    try {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        const ok = await registerForPush();
        statusMsg = ok
          ? "✅ Notifikasyon aktive avèk siksè!"
          : "⚠️ Pèmisyon bay, men enskripsyon push echwe (gade detay anba).";
      } else {
        statusMsg = `⚠️ Pèmisyon: ${perm}`;
      }
    } catch (err) {
      statusMsg = `⚠️ Erè: ${err.message || err}`;
    }
    // Montre rezilta a sou ekran pandan 6 segonn (itil pou dyagnostike sou iPhone
    // kote pa gen aksè fasil ak console debug la).
    if (banner) {
      const p = banner.querySelector("p");
      if (p) p.textContent = statusMsg;
      setTimeout(() => {
        banner.hidden = true;
      }, 6000);
    }
  });
}

if (dismissBtn) {
  dismissBtn.addEventListener("click", () => {
    localStorage.setItem("rc_notif_dismissed", "1");
    if (banner) banner.hidden = true;
  });
}

export function initNotifications() {
  // Si moun nan te deja bay pèmisyon anvan (nan yon lòt vizit),
  // re-anrejistre l an silans, san montre bandwo a.
  if ("Notification" in window && Notification.permission === "granted") {
    registerForPush().catch((err) => {
      console.warn("Erè re-enskripsyon:", err);
      // Montre erè a sou ekran menm si pèmisyon deja bay (itil pou dyagnostike
      // sou iPhone kote pa gen aksè fasil ak console).
      if (banner) {
        const p = banner.querySelector("p");
        if (p) p.textContent = `⚠️ Erè enskripsyon: ${err.message || err}`;
        banner.hidden = false;
        setTimeout(() => (banner.hidden = true), 8000);
      }
    });
    return;
  }
  window.addEventListener("load", () => {
    setTimeout(maybeShowBanner, 2000);
  });
}

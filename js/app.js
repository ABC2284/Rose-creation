// ============================================================
// APP SHELL — splash, enstalasyon, notifikasyon, navigasyon
// ============================================================

// ---- Anrejistre Service Worker (mòd ofline + enstalasyon) ----
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((err) => {
      console.warn("Service worker pa t rive enstale:", err);
    });
  });
}

// ---- Splash screen (ekran demaraj) ----
// Disparèt apre yon TAN FIKS — pa tann tout foto galri yo fin chaje,
// sa ka pran plizyè segonn sou yon koneksyon lan e bloke ekran an.
(() => {
  const splash = document.getElementById("splash");
  if (!splash) return;
  const SPLASH_MS = 1500; // dire ekran demaraj la, an milisegonn

  function hideSplash() {
    if (!splash.isConnected) return;
    splash.classList.add("splash--hide");
    setTimeout(() => splash.remove(), 700);
  }

  // Si HTML la deja parèt (DOM pare), pa bezwen tann "load" konplè a
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(hideSplash, SPLASH_MS);
    });
  } else {
    setTimeout(hideSplash, SPLASH_MS);
  }

  // Filè sekirite: kèlkeswa sa k ap pase, pa janm kite splash la
  // parèt pi plis pase 4 segonn.
  setTimeout(hideSplash, 4000);
})();

// ---- Navigasyon mobil ----
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("nav__menu--open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navMenu.classList.remove("nav__menu--open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );
}

// ---- Prompt Enstalasyon (Android/Desktop: beforeinstallprompt) ----
let deferredInstallPrompt = null;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  if (installBtn) installBtn.hidden = false;
});

if (installBtn) {
  installBtn.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installBtn.hidden = true;
  });
}

window.addEventListener("appinstalled", () => {
  if (installBtn) installBtn.hidden = true;
  localStorage.setItem("rc_installed", "1");
});

// ---- Detekte si app la ap kouri "enstale" (standalone) ----
function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

// ---- Bandwo aktivasyon notifikasyon (parèt yon sèl fwa, apre enstalasyon) ----
const notifBanner = document.getElementById("notifBanner");
const notifEnableBtn = document.getElementById("notifEnableBtn");
const notifDismissBtn = document.getElementById("notifDismissBtn");

function maybeShowNotifBanner() {
  if (!notifBanner) return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "default") return;
  if (localStorage.getItem("rc_notif_dismissed") === "1") return;
  // Sou iPhone, notifikasyon web sèlman disponib lè app la enstale sou ekran akèy la
  if (!isStandalone() && /iPhone|iPad|iPod/i.test(navigator.userAgent)) return;

  notifBanner.hidden = false;
}

if (notifEnableBtn) {
  notifEnableBtn.addEventListener("click", async () => {
    try {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        new Notification("Rose Créatrice", {
          body: "Notifikasyon aktive! Ou pral resevwa nouvèl rezèvasyon ak pwomosyon.",
          icon: "./icons/icon-192.png",
        });
      }
    } catch (err) {
      console.warn(err);
    }
    notifBanner.hidden = true;
  });
}

if (notifDismissBtn) {
  notifDismissBtn.addEventListener("click", () => {
    localStorage.setItem("rc_notif_dismissed", "1");
    notifBanner.hidden = true;
  });
}

window.addEventListener("load", () => {
  setTimeout(maybeShowNotifBanner, 2200);
});

// ---- Ane a nan footer ----
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---- Galri: filtre pa kategori ----
const filterBtns = document.querySelectorAll(".filter-chip");
const galleryItems = document.querySelectorAll(".gallery__item");
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("filter-chip--active"));
    btn.classList.add("filter-chip--active");
    const cat = btn.getAttribute("data-filter");
    galleryItems.forEach((item) => {
      const match = cat === "tout" || item.getAttribute("data-category") === cat;
      item.style.display = match ? "" : "none";
    });
  });
});

// ---- Lightbox senp pou foto galri ----
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
document.querySelectorAll(".gallery__item img").forEach((img) => {
  img.addEventListener("click", () => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.hidden = false;
  });
});
if (lightbox) {
  lightbox.addEventListener("click", () => (lightbox.hidden = true));
}

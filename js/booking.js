// ============================================================
// "BOT" REZÈVASYON — Rose Créatrice
// Verifye kapasite chak jou, aksepte/ranvwaye otomatikman,
// e pwopoze pwochen jou ki disponib.
// ============================================================
import {
  db,
  collection,
  doc,
  runTransaction,
  query,
  where,
  onSnapshot,
  orderBy,
} from "./firebase-init.js";
import {
  WHATSAPP_NUMBER,
  BUSINESS,
  CAPACITY_BY_WEEKDAY,
  BOOKING_WINDOW_DAYS,
} from "./config.js";

const JOU_KREYOL = ["Dim", "Len", "Mad", "Mèk", "Jed", "Van", "Sam"];
const MWA_KREYOL = [
  "Janvye", "Fevriye", "Mas", "Avril", "Me", "Jen",
  "Jiyè", "Out", "Septanm", "Oktòb", "Novanm", "Desanm",
];

const state = {
  counts: {}, // { "YYYY-MM-DD": nombreReserve }
  selectedDate: null,
};

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function capacityFor(date) {
  return CAPACITY_BY_WEEKDAY[date.getDay()] ?? 2;
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

// ---- Real-time listener sou "dayCounters" pou konte plas okipe ----
// (Nou li kontè piblik yo, PA lis konplè rezèvasyon yo — sa a pwoteje
// non ak nimewo telefòn kliyan yo. Gade firestore.rules.)
function listenReservations(onUpdate) {
  const today = fmtDate(new Date());
  const q = query(
    collection(db, "dayCounters"),
    where("date", ">=", today),
    orderBy("date", "asc")
  );
  return onSnapshot(q, (snap) => {
    const counts = {};
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      counts[data.date] = data.count || 0;
    });
    state.counts = counts;
    onUpdate(counts);
  });
}

function renderCalendar(container) {
  const days = buildDayList();
  container.innerHTML = "";

  days.forEach((d) => {
    const key = fmtDate(d);
    const cap = capacityFor(d);
    const used = state.counts[key] || 0;
    const full = used >= cap;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "day-chip" + (full ? " day-chip--full" : "") +
      (state.selectedDate === key ? " day-chip--selected" : "");
    btn.disabled = full;
    btn.setAttribute("data-date", key);
    btn.innerHTML = `
      <span class="day-chip__dow">${JOU_KREYOL[d.getDay()]}</span>
      <span class="day-chip__num">${d.getDate()}</span>
      <span class="day-chip__mon">${MWA_KREYOL[d.getMonth()].slice(0, 3)}</span>
      <span class="day-chip__status">${full ? "Plen" : `${cap - used} plas`}</span>
    `;
    btn.addEventListener("click", () => {
      state.selectedDate = key;
      document
        .querySelectorAll(".day-chip--selected")
        .forEach((el) => el.classList.remove("day-chip--selected"));
      btn.classList.add("day-chip--selected");
      document.getElementById("selectedDateLabel").textContent =
        `${JOU_KREYOL[d.getDay()]} ${d.getDate()} ${MWA_KREYOL[d.getMonth()]}`;
      document.getElementById("bookingFormWrap").hidden = false;
      document.getElementById("botMessage").textContent = "";
    });
    container.appendChild(btn);
  });

  // Si TOUT semèn nan (7 pwochen jou) plen, avèti kliyan an
  const first7 = days.slice(0, 7);
  const allFull = first7.every((d) => {
    const key = fmtDate(d);
    return (state.counts[key] || 0) >= capacityFor(d);
  });
  const notice = document.getElementById("weekFullNotice");
  if (notice) {
    notice.hidden = !allFull;
  }
}

function nextAvailableDate(afterKey) {
  const days = buildDayList();
  const idx = days.findIndex((d) => fmtDate(d) === afterKey);
  for (let i = idx + 1; i < days.length; i++) {
    const d = days[i];
    const key = fmtDate(d);
    if ((state.counts[key] || 0) < capacityFor(d)) {
      return `${JOU_KREYOL[d.getDay()]} ${d.getDate()} ${MWA_KREYOL[d.getMonth()]}`;
    }
  }
  return null;
}

function buildWhatsAppLink({ name, phone, service, date, message }) {
  const text =
    `Bonjou ${BUSINESS.name}! Mwen fenk fè yon rezèvasyon:\n` +
    `👤 Non: ${name}\n` +
    `📞 Telefòn: ${phone}\n` +
    `🎨 Sèvis: ${service}\n` +
    `📅 Dat: ${date}\n` +
    (message ? `📝 Nòt: ${message}\n` : "") +
    `\nMèsi pou konfime rezèvasyon an! 🌹`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

// ---- Soumèt yon rezèvasyon avèk yon TRANZAKSYON (evite 2 moun pran menm dènye plas la) ----
async function submitBooking({ name, phone, service, date, message }) {
  const dateObj = new Date(date + "T00:00:00");
  const cap = capacityFor(dateObj);
  const counterRef = doc(db, "dayCounters", date);
  const reservationRef = doc(collection(db, "reservations"));

  try {
    await runTransaction(db, async (tx) => {
      const counterSnap = await tx.get(counterRef);
      const used = counterSnap.exists() ? counterSnap.data().count || 0 : 0;

      if (used >= cap) {
        throw new Error("PLEN");
      }

      tx.set(
        counterRef,
        { count: used + 1, date, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      tx.set(reservationRef, {
        name,
        phone,
        service,
        date,
        message: message || "",
        status: "confirme",
        createdAt: new Date().toISOString(),
      });
    });
    return { ok: true };
  } catch (err) {
    if (err.message === "PLEN") {
      return { ok: false, reason: "PLEN" };
    }
    console.error(err);
    return { ok: false, reason: "ERWA" };
  }
}

// ============================================================
// INISYALIZASYON PAJ LA
// ============================================================
export function initBooking() {
  const calendarEl = document.getElementById("bookingCalendar");
  if (!calendarEl) return;

  listenReservations(() => renderCalendar(calendarEl));

  const form = document.getElementById("bookingForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const botMessage = document.getElementById("botMessage");
    const submitBtn = form.querySelector("button[type=submit]");

    if (!state.selectedDate) {
      botMessage.textContent = "🌹 Tanpri chwazi yon jou anvan.";
      return;
    }

    const formData = new FormData(form);
    const payload = {
      name: formData.get("name").trim(),
      phone: formData.get("phone").trim(),
      service: formData.get("service"),
      date: state.selectedDate,
      message: formData.get("message")?.trim() || "",
    };

    submitBtn.disabled = true;
    botMessage.textContent = "⏳ Bot la ap verifye plas ki disponib...";

    const result = await submitBooking(payload);

    if (result.ok) {
      botMessage.textContent =
        "✅ Rezèvasyon w KONFIME! N ap voye w sou WhatsApp pou konfime detay yo.";
      form.reset();
      document.getElementById("bookingFormWrap").hidden = true;
      state.selectedDate = null;
      const link = buildWhatsAppLink({
        ...payload,
        date: document.getElementById("selectedDateLabel").textContent,
      });
      setTimeout(() => window.open(link, "_blank"), 900);
    } else if (result.reason === "PLEN") {
      const suggestion = nextAvailableDate(payload.date);
      botMessage.textContent = suggestion
        ? `🙏 Dezole, jou sa a fèk vin PLEN pandan w ap ranpli fòm nan. Pwochen jou ki disponib: ${suggestion}. Tanpri chwazi l.`
        : "🙏 Dezole, tout pwochen jou yo plen. Tanpri tounen verifye pi ta oswa kontakte nou sou WhatsApp.";
    } else {
      botMessage.textContent =
        "⚠️ Gen yon pwoblèm koneksyon. Tanpri eseye ankò, oswa kontakte nou sou WhatsApp.";
    }

    submitBtn.disabled = false;
  });
}

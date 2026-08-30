// ============================================================
// Inisyalizasyon Firebase — pa modifye fichye sa a.
// Modifye js/config.js pito.
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  runTransaction,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported as isMessagingSupported,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";
import { firebaseConfig } from "./config.js";

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export {
  collection,
  doc,
  runTransaction,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp,
  getMessaging,
  getToken,
  onMessage,
  isMessagingSupported,
};

/* ============================================================
   KONFIGIRASYON — Rose Créatrice
   ============================================================
   SÈL FICHYE OU BEZWEN MODIFYE POU APP LA MACHE POU VRÈ.
   Gade README-ENSTALASYON.md pou enstriksyon pa etap.
   ============================================================ */

// 1) Konfigirasyon Firebase — kopye l soti nan Firebase Console
//    (Paramèt pwojè > Jeneral > Aplikasyon web ou a)
export const firebaseConfig = {
  apiKey: "AIzaSyDJwsEPbMvCgrSrF-sHNBlpN5_TpEsbP1w",
  authDomain: "https://rose-creatrice-default-rtdb.firebaseio.com",
  projectId: "rose-créatrice",
  storageBucket: "rose-creatrice.firebasestorage.app",
  messagingSenderId: "876965087161",
  appId: "1:876965087161 :web :5ea4911f3639252a1b9868 ",
};

// 2) Nimewo WhatsApp biznis la (fòma entènasyonal, san "+" ni espas)
//    Egzanp Ayiti: 50937xxxxxx
export const WHATSAPP_NUMBER = "50900000000";

// 3) Non biznis la ak lyen rezo sosyal (mete yo si ou genyen)
export const BUSINESS = {
  name: "Rose Créatrice",
  address: "Delmas 33, Petite Place Cazeau, 3ème Cité, Port-au-Prince, Haïti",
  instagram: "", // egzanp: "https://instagram.com/rosecreatrice"
  facebook: "",
  tiktok: "",
};

// 4) Règ rezèvasyon — kapasite pa jou
//    Kle a se nimewo jou a: 0=dimanch,1=lendi,2=madi,3=mèkredi,4=jedi,5=vandredi,6=samdi
export const CAPACITY_BY_WEEKDAY = {
  0: 2, // dimanch
  1: 2, // lendi
  2: 2, // madi
  3: 1, // MÈKREDI — sèl yon moun
  4: 2, // jedi
  5: 2, // vandredi
  6: 2, // samdi
};

// Konbyen jou davans pou montre nan kalandriye rezèvasyon an
export const BOOKING_WINDOW_DAYS = 21;

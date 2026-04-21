import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function advance() {
  const ref = doc(db, 'config', 'academic');
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, {
      currentAcademicYear: '2026-27'
    });
  } else {
    await setDoc(ref, {
      currentAcademicYear: '2026-27'
    });
  }
  console.log('Advanced to 2026-27');
  process.exit(0);
}

advance();

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function revert() {
  await updateDoc(doc(db, 'config', 'academic'), {
    currentAcademicYear: '2025-26'
  });
  console.log('Reverted to 2025-26');
  process.exit(0);
}

revert();

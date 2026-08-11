/**
 * One-time script to delete fake seed transactions from Firestore.
 * Run with: node scripts/delete-seed-transactions.mjs
 * Requires: VITE_FIREBASE_* env vars to be set in .env
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env variables manually
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env');

try {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && key.trim() && !key.startsWith('#')) {
      process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
  console.log('✅ Loaded .env file');
} catch {
  console.error('❌ Could not load .env file');
  process.exit(1);
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SEED_IDS = [
  'pay_P1o98G7sL9kH',
  'pay_J2m54K8aQ2wX',
  'pay_N9p12V6cR7tM'
];

async function deleteSeedTransactions() {
  console.log('\n🧹 Cleaning up fake seed transactions from Firestore...\n');
  
  for (const id of SEED_IDS) {
    const ref = doc(db, 'transactions', id);
    const snap = await getDoc(ref);
    
    if (snap.exists()) {
      await deleteDoc(ref);
      console.log(`✅ Deleted: ${id}`);
    } else {
      console.log(`⏭️  Not found (already removed): ${id}`);
    }
  }

  console.log('\n✨ Done! Fake orders removed from Firestore.\n');
  process.exit(0);
}

deleteSeedTransactions().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

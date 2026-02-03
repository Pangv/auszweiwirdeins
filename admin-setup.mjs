import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFile } from 'fs/promises';

// 1. JSON laden
const serviceAccount = JSON.parse(
  await readFile(new URL('./firebase_key_kommrum.json', import.meta.url))
);

initializeApp({
  credential: cert(serviceAccount)
});

// DEINE UID hier einfügen (findest du in der Firebase Console unter Authentication)
const uid = 'fVGB9eRaNnRm7nLSN8ItapbNg9J3';

async function makeAdmin() {
  try {
    await getAuth().setCustomUserClaims(uid, { admin: true });
    console.log(`Successfully set admin claim for user: ${uid}`);
    console.log('WICHTIG: Logge dich in der App aus und wieder ein, um das neue Token zu erhalten!');
  } catch (error) {
    console.error('Error setting admin claim:', error);
  }
}

makeAdmin();

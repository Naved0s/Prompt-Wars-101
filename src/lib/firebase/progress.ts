import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './config';

export async function saveProgress(userId: string, topic: string, score: number) {
  const ref = doc(db, 'users', userId, 'progress', topic);
  await setDoc(ref, {
    topic,
    lastScore: score,
    attempts: arrayUnion({
      score,
      completedAt: new Date().toISOString(),
    }),
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

export async function getUserProgress(userId: string) {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

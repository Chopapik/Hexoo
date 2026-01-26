import { adminDb } from "@/lib/firebaseAdmin";

export async function isUsernameTaken(username: string): Promise<boolean> {
  if (!username) return true;

  const normalized = username.trim().toLowerCase();
  const trimmed = username.trim();

  // Sprawdź nameLowercase (dla nowych użytkowników z tym polem)
  const snapshotByLowercase = await adminDb
    .collection("users")
    .where("nameLowercase", "==", normalized)
    .limit(1)
    .get();

  if (!snapshotByLowercase.empty) {
    return true;
  }

  // Sprawdź name dokładnie (dla starych użytkowników bez nameLowercase)
  const snapshotByName = await adminDb
    .collection("users")
    .where("name", "==", trimmed)
    .limit(1)
    .get();

  if (!snapshotByName.empty) {
    return true;
  }

  // Sprawdź również znormalizowaną wersję name (dla użytkowników którzy mogą mieć małe litery)
  if (normalized !== trimmed) {
    const snapshotByNameNormalized = await adminDb
      .collection("users")
      .where("name", "==", normalized)
      .limit(1)
      .get();

    if (!snapshotByNameNormalized.empty) {
      return true;
    }
  }

  // Ostatnia opcja - pobierz wszystkich użytkowników i sprawdź w pamięci
  // (tylko jeśli powyższe nie znalazły, aby uniknąć niepotrzebnych operacji)
  // To jest kosztowne, ale zapewnia 100% dokładność dla starych użytkowników bez nameLowercase
  const allUsersSnapshot = await adminDb
    .collection("users")
    .select("name", "nameLowercase")
    .get();

  for (const doc of allUsersSnapshot.docs) {
    const userData = doc.data();
    const userName = userData.name?.trim().toLowerCase();
    const userNameLowercase = userData.nameLowercase?.trim().toLowerCase();
    
    if (userName === normalized || userNameLowercase === normalized) {
      return true;
    }
  }

  return false;
}

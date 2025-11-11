const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY!;

export async function signInWithPassword(email: string, password: string) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw body;
  }

  return body;
}

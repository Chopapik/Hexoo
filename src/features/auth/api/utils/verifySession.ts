import { adminAuth } from "@/lib/firebaseAdmin";

export async function verifySession(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) throw new Error("Brak ciasteczka sesji");

  const match = cookieHeader.match(/session=([^;]+)/);
  if (!match) throw new Error("Nie znaleziono ciasteczka session");

  const sessionCookie = match[1];
  const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
  return decoded;
}

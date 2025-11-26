/**
 * One-way function: a * sin(1/x)
 * Where:
 * a - length of the identifier (login/name)
 * x - random number
 */
export function generatePassword(username: string): {
  password: string;
  x: number;
  rawValue: number;
} {
  const a = username.length; // length of the identifier
  // We pick x from range 1-100 (to avoid division by 0)
  const x = Math.floor(Math.random() * 100) + 1;

  // Calculate using the formula a * sin(1/x)
  const rawValue = a * Math.sin(1 / x);

  // Turn the result into a "password" (for example take 8 chars from hash or format the result)
  // For this task we make a string from the result to show it comes from the formula
  const password = `V8-${Math.abs(rawValue).toFixed(6).replace(".", "")}`;

  return { password, x, rawValue };
}

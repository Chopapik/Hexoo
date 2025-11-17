export function validateAuthData<T extends Record<string, any>>(data: T) {
  for (const key in data) {
    const value = data[key];

    if (value === "" || value === null || value === undefined) {
      return false;
    }
  }
  return true;
}

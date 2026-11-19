/** Browser preferences are optional, never a prerequisite for rendering the app.
 * Cross-origin frames and privacy modes may throw even when accessing the
 * localStorage property, before getItem/setItem can run.
 */
export function getLocalStorageItem(key: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setLocalStorageItem(key: string, value: string): boolean {
  try {
    if (typeof window === "undefined") return false;
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

const PREFIX = 'cyclehome_v1_';

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  },
  set(key: string, value: unknown): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // ignore
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      // ignore
    }
  },
  clearAll(): void {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  },
};

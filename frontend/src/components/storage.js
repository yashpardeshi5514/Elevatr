/**
 * Elevatr Safe Storage Utility
 * Drop this in src/components/storage.js
 *
 * Fixes: QuotaExceededError when saving profile with base64 avatar
 * How:   Strips the avatar out of the profile before writing to localStorage
 *        and stores it in a separate smaller key.
 */

export function lsGet(key, fallback = null) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

export function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      console.warn('[Elevatr] Quota hit — clearing stale data and retrying');
      const protect = new Set(['elevatr_user', 'elevatr_token']);
      Object.keys(localStorage)
        .filter(k => !protect.has(k) && k !== key)
        .forEach(k => { try { localStorage.removeItem(k); } catch {} });
      try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch {}
    }
    console.error('[Elevatr] lsSet failed:', e.message);
    return false;
  }
}

export function lsRemove(...keys) {
  keys.forEach(k => { try { localStorage.removeItem(k); } catch {} });
}

/**
 * Save profile WITHOUT the avatar (prevents QuotaExceededError).
 * Avatar is stored separately in 'elevatr_avatar' key.
 */
export function saveProfileToStorage(profile) {
  if (!profile) return;
  const { avatar, ...profileWithoutAvatar } = profile;
  lsSet('elevatr_profile', profileWithoutAvatar);
  if (avatar) {
    try {
      localStorage.setItem('elevatr_avatar', avatar);
    } catch {
      console.warn('[Elevatr] Avatar too large for storage — showing in memory only');
    }
  }
}

/**
 * Load profile and merge avatar back in from its separate key.
 */
export function loadProfileFromStorage() {
  const profile = lsGet('elevatr_profile');
  if (!profile) return null;
  const avatar = (() => {
    try { return localStorage.getItem('elevatr_avatar') || null; } catch { return null; }
  })();
  return avatar ? { ...profile, avatar } : profile;
}
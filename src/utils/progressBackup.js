import { sanitizeProfilesPayload } from './profileStorage';
import { getLocalDateKey } from './dailyChallenge';

export function createBackupPayload(profilesData, soundEnabled = true) {
  const sanitizedProfiles = sanitizeProfilesPayload(profilesData);

  return {
    app: 'guess-my-number',
    version: 1,
    exportedAt: new Date().toISOString(),
    activeProfileId: sanitizedProfiles.activeProfileId,
    profiles: sanitizedProfiles.profiles,
    soundPreference: Boolean(soundEnabled),
  };
}

export function downloadJSONFile(data, filename) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportProgressBackup(profilesData, soundEnabled = true, dateInput = new Date()) {
  const payload = createBackupPayload(profilesData, soundEnabled);
  const dateKey = getLocalDateKey ? getLocalDateKey(dateInput) : new Date().toISOString().slice(0, 10);
  const filename = `guess-my-number-backup-${dateKey}.json`;

  if (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof URL !== 'undefined' &&
    typeof URL.createObjectURL === 'function'
  ) {
    downloadJSONFile(payload, filename);
  }

  return payload;
}

export function validateBackupJSON(jsonInput) {
  let parsed;
  if (typeof jsonInput === 'string') {
    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      return { valid: false, error: 'Invalid JSON file format' };
    }
  } else if (jsonInput && typeof jsonInput === 'object') {
    parsed = jsonInput;
  } else {
    return { valid: false, error: 'Empty or unreadable backup file' };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { valid: false, error: 'Backup data must be a JSON object' };
  }

  if (parsed.app !== 'guess-my-number') {
    return { valid: false, error: 'Unrecognized backup file. Expected app identifier "guess-my-number"' };
  }

  if (parsed.version !== 1) {
    return { valid: false, error: `Unsupported backup version "${parsed.version}". Version 1 expected.` };
  }

  if (!Array.isArray(parsed.profiles) || parsed.profiles.length === 0) {
    return { valid: false, error: 'Backup contains no player profiles' };
  }

  const sanitizedProfilesData = sanitizeProfilesPayload({
    version: 1,
    activeProfileId: parsed.activeProfileId,
    profiles: parsed.profiles,
  });

  const soundPreference = typeof parsed.soundPreference === 'boolean' ? parsed.soundPreference : true;

  return {
    valid: true,
    payload: {
      app: 'guess-my-number',
      version: 1,
      exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString(),
      activeProfileId: sanitizedProfilesData.activeProfileId,
      profiles: sanitizedProfilesData.profiles,
      soundPreference,
    },
  };
}

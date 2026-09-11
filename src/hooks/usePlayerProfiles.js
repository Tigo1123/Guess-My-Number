import { useState, useCallback, useMemo } from 'react';
import {
  loadProfilesFromStorage,
  saveProfilesToStorage,
  validateProfileName,
  generateUUID,
  createEmptyProgress,
  sanitizeProgress,
  sanitizeAvatar,
} from '../utils/profileStorage';
import { exportProgressBackup, validateBackupJSON } from '../utils/progressBackup';

export function usePlayerProfiles() {
  const [profilesData, setProfilesData] = useState(() => loadProfilesFromStorage());

  // Save to storage helper
  const updateProfilesData = useCallback((nextData) => {
    setProfilesData((prev) => {
      const sanitized = saveProfilesToStorage(typeof nextData === 'function' ? nextData(prev) : nextData);
      return sanitized;
    });
  }, []);

  // Active Profile object
  const activeProfile = useMemo(() => {
    const found = profilesData.profiles.find((p) => p.id === profilesData.activeProfileId);
    return found || profilesData.profiles[0];
  }, [profilesData]);

  // Create Profile
  const createProfile = useCallback((name) => {
    const validation = validateProfileName(name, profilesData.profiles);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const newId = generateUUID();
    const now = new Date().toISOString();
    const newProfile = {
      id: newId,
      name: validation.name,
      avatar: '/images/avatars/avatar-01.jpeg',
      createdAt: now,
      updatedAt: now,
      progress: createEmptyProgress(),
    };

    updateProfilesData((prev) => ({
      ...prev,
      activeProfileId: newId,
      profiles: [...prev.profiles, newProfile],
    }));

    return { success: true, profile: newProfile };
  }, [profilesData.profiles, updateProfilesData]);

  const updateAvatar = useCallback((id, avatar) => {
    const nextAvatar = sanitizeAvatar(avatar);
    updateProfilesData((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => p.id === id ? { ...p, avatar: nextAvatar, updatedAt: new Date().toISOString() } : p),
    }));
  }, [updateProfilesData]);

  // Switch Profile
  const switchProfile = useCallback((id) => {
    if (id === profilesData.activeProfileId) return false;
    const exists = profilesData.profiles.some((p) => p.id === id);
    if (!exists) return false;

    updateProfilesData((prev) => ({
      ...prev,
      activeProfileId: id,
    }));
    return true;
  }, [profilesData.activeProfileId, profilesData.profiles, updateProfilesData]);

  // Rename Profile
  const renameProfile = useCallback((id, newName) => {
    const validation = validateProfileName(newName, profilesData.profiles, id);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    updateProfilesData((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          name: validation.name,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));

    return { success: true };
  }, [profilesData.profiles, updateProfilesData]);

  // Delete Profile
  const deleteProfile = useCallback((id) => {
    if (profilesData.profiles.length <= 1) {
      return { success: false, error: 'Cannot delete the final remaining profile' };
    }

    const exists = profilesData.profiles.some((p) => p.id === id);
    if (!exists) {
      return { success: false, error: 'Profile not found' };
    }

    updateProfilesData((prev) => {
      const remaining = prev.profiles.filter((p) => p.id !== id);
      let nextActiveId = prev.activeProfileId;
      if (prev.activeProfileId === id) {
        nextActiveId = remaining[0].id;
      }
      return {
        ...prev,
        activeProfileId: nextActiveId,
        profiles: remaining,
      };
    });

    return { success: true };
  }, [profilesData.activeProfileId, profilesData.profiles, updateProfilesData]);

  // Update Active Profile Progress
  const updateActiveProgress = useCallback((updater) => {
    updateProfilesData((prev) => {
      const activeId = prev.activeProfileId;
      const target = prev.profiles.find((p) => p.id === activeId) || prev.profiles[0];
      const nextProgress = sanitizeProgress(
        typeof updater === 'function' ? updater(target.progress) : updater
      );

      return {
        ...prev,
        profiles: prev.profiles.map((p) => {
          if (p.id !== target.id) return p;
          return {
            ...p,
            updatedAt: new Date().toISOString(),
            progress: nextProgress,
          };
        }),
      };
    });
  }, [updateProfilesData]);

  // Export Backup
  const triggerExport = useCallback((soundEnabled = true) => {
    return exportProgressBackup(profilesData, soundEnabled);
  }, [profilesData]);

  // Restore Backup
  const restoreBackup = useCallback((backupInput) => {
    const validation = validateBackupJSON(backupInput);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    updateProfilesData(validation.payload);
    return { success: true, payload: validation.payload };
  }, [updateProfilesData]);

  return {
    profilesData,
    profiles: profilesData.profiles,
    activeProfileId: profilesData.activeProfileId,
    activeProfile,
    createProfile,
    switchProfile,
    renameProfile,
    deleteProfile,
    updateAvatar,
    updateActiveProgress,
    triggerExport,
    restoreBackup,
  };
}

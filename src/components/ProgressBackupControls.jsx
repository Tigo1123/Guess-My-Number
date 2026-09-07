import React, { useState, useRef } from 'react';
import { validateBackupJSON } from '../utils/progressBackup';

export function ProgressBackupControls({ onExportBackup, onRestoreBackup }) {
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const fileInputRef = useRef(null);

  const handleExportClick = () => {
    setErrorMessage('');
    setSuccessMessage('');
    onExportBackup();
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setErrorMessage('');
    setSuccessMessage('');
    setSelectedBackup(null);
    setIsConfirming(false);

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const validation = validateBackupJSON(content);
      if (!validation.valid) {
        setErrorMessage(validation.error);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setSelectedBackup(validation.payload);
        setIsConfirming(true);
      }
    };

    reader.onerror = () => {
      setErrorMessage('Failed to read backup file');
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsText(file);
  };

  const handleConfirmRestore = () => {
    if (!selectedBackup) return;
    const res = onRestoreBackup(selectedBackup);
    if (!res.success) {
      setErrorMessage(res.error);
      setIsConfirming(false);
    } else {
      setSuccessMessage('Progress restored successfully!');
      setSelectedBackup(null);
      setIsConfirming(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCancelRestore = () => {
    setSelectedBackup(null);
    setIsConfirming(false);
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <section className="backup-controls-container" aria-label="Progress Backup and Restore">
      <div className="backup-controls-header">
        <h2 className="backup-title">PROGRESS BACKUP & RESTORE</h2>
      </div>

      <div className="backup-actions-grid">
        <div className="backup-action-box">
          <span className="backup-box-title">EXPORT PROGRESS</span>
          <p className="backup-box-desc">Download a backup file containing all player profiles, high scores, and statistics.</p>
          <button
            type="button"
            className="btn-backup export"
            onClick={handleExportClick}
            aria-label="Export Progress Backup JSON file"
          >
            💾 Download Backup (.json)
          </button>
        </div>

        <div className="backup-action-box">
          <span className="backup-box-title">RESTORE BACKUP</span>
          <p className="backup-box-desc">Upload a previously saved .json backup file to restore player profiles.</p>
          <div className="file-input-wrapper">
            <label htmlFor="backup-file-input" className="btn-backup import-label">
              📁 Choose Backup File
            </label>
            <input
              id="backup-file-input"
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="file-input-hidden"
              onChange={handleFileChange}
              aria-label="Upload Progress Backup JSON file"
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="backup-message error" role="alert">
          ⚠️ {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="backup-message success" role="status">
          ✅ {successMessage}
        </div>
      )}

      {isConfirming && selectedBackup && (
        <div className="backup-confirm-modal" aria-label="Restore Backup Confirmation">
          <div className="confirm-modal-box">
            <h3 className="confirm-modal-title">RESTORE BACKUP CONFIRMATION</h3>
            <p className="confirm-modal-text">
              Restore this backup? This will replace all current player profiles and progress.
            </p>
            <div className="confirm-modal-info">
              <span>Profiles in backup: <strong>{selectedBackup.profiles.length}</strong></span>
            </div>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn-danger-confirm"
                onClick={handleConfirmRestore}
              >
                Confirm Restore
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancelRestore}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

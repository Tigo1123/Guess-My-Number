import React, { useState, useRef } from 'react';
import { validateBackupJSON } from '../utils/progressBackup';

export function ProgressBackupControls({ onExportBackup, onRestoreBackup }) {
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const fileInputRef = useRef(null);

  const [fileName, setFileName] = useState('');

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
    setFileName(file ? file.name : '');

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const validation = validateBackupJSON(content);
      if (!validation.valid) {
        setErrorMessage(validation.error);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setFileName('');
      } else {
        setSelectedBackup(validation.payload);
        setIsConfirming(true);
      }
    };

    reader.onerror = () => {
      setErrorMessage('Failed to read backup file');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setFileName('');
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
      setFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCancelRestore = () => {
    setSelectedBackup(null);
    setIsConfirming(false);
    setErrorMessage('');
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <section className="summary-card-block" aria-label="Progress Backup and Restore">
      <h2 className="section-title">Backup & Restore</h2>
      <p className="section-subtitle">Keep a copy of your player profiles and progress.</p>

      <div className="backup-sections-grid">
        <div className="backup-item-box">
          <h3 className="backup-item-title">Export</h3>
          <p className="backup-item-desc">Save all local game progress to a JSON backup.</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleExportClick}
            aria-label="Export Progress Backup JSON file"
          >
            Export backup
          </button>
        </div>

        <div className="backup-item-box">
          <h3 className="backup-item-title">Import</h3>
          <p className="backup-item-desc">Restore profiles and progress from a previous backup.</p>
          <div className="file-picker-row">
            <label htmlFor="backup-file" className="btn-secondary">
              Choose backup file
            </label>
            <span className="file-status-text">
              {fileName || 'No file selected'}
            </span>
            <input
              id="backup-file"
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="visually-hidden-file-input"
              onChange={handleFileChange}
              aria-label="Upload Progress Backup JSON file"
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="backup-message error" role="alert">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="backup-message success" role="status">
          {successMessage}
        </div>
      )}

      {isConfirming && selectedBackup && (
        <div className="backup-confirm-modal" aria-label="Restore Backup Confirmation">
          <div className="confirm-modal-box">
            <h3 className="confirm-modal-title">Restore Backup Confirmation</h3>
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
                Restore backup
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

import React, { useState } from 'react';
import { AppImage } from './AppImage';
import { AVATAR_FALLBACK, AVATAR_IMAGES } from '../utils/imageAssets';

export function ProfileManager({
  profiles = [],
  activeProfileId,
  activeProfile,
  onCreateProfile,
  onSwitchProfile,
  onRenameProfile,
  onDeleteProfile,
  onUpdateAvatar,
}) {
  const [activePanel, setActivePanel] = useState(null); // null | 'switch' | 'create' | 'rename' | 'delete'
  const [inputName, setInputName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const activeName = activeProfile ? activeProfile.name : 'Unknown';
  const stats = (activeProfile && activeProfile.progress && activeProfile.progress.statistics) || {};
  const games = stats.totalGames || 0;
  const wins = stats.totalWins || 0;
  const winRate = games > 0 ? Math.round((wins / games) * 100) : 0;

  const handleOpenCreate = () => {
    setInputName('');
    setErrorMessage('');
    setActivePanel('create');
  };

  const handleOpenRename = () => {
    setInputName(activeName);
    setErrorMessage('');
    setActivePanel('rename');
  };

  const handleOpenSwitch = () => {
    setErrorMessage('');
    setActivePanel('switch');
  };

  const handleOpenDelete = () => {
    setErrorMessage('');
    setActivePanel('delete');
  };

  const handleClose = () => {
    setActivePanel(null);
    setInputName('');
    setErrorMessage('');
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const res = onCreateProfile(inputName);
    if (!res.success) {
      setErrorMessage(res.error);
    } else {
      handleClose();
    }
  };

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (!activeProfile) return;
    const res = onRenameProfile(activeProfile.id, inputName);
    if (!res.success) {
      setErrorMessage(res.error);
    } else {
      handleClose();
    }
  };

  const handleDeleteConfirm = () => {
    if (!activeProfile) return;
    const res = onDeleteProfile(activeProfile.id);
    if (!res.success) {
      setErrorMessage(res.error);
    } else {
      handleClose();
    }
  };

  const handleSelectSwitch = (id) => {
    onSwitchProfile(id);
    handleClose();
  };

  return (
    <section className="summary-card-block" aria-label="Player Profiles Manager">
      <div className="section-header-row">
        <h2 className="section-title">Player Profiles</h2>
        <button
          type="button"
          className="btn-primary btn-sm"
          onClick={activePanel === 'create' ? handleClose : handleOpenCreate}
          aria-label="Create New Player Profile"
        >
          New Player
        </button>
      </div>

      <div className="active-player-card">
        <div className="player-card-header">
          <div className="avatar-circle">
            <AppImage src={activeProfile?.avatar || AVATAR_FALLBACK} fallbackSrc={AVATAR_FALLBACK} alt={`${activeName} avatar`} />
            <span className="avatar-initial-fallback" aria-hidden="true">{activeName?.charAt(0).toUpperCase() || 'P'}</span>
          </div>
          <div className="player-card-info">
            <h3 className="player-card-name">{activeName}</h3>
            <span className="player-card-badge">Active player</span>
          </div>
        </div>

        <div className="avatar-chooser" role="group" aria-label="Choose player avatar">
          <span className="field-label">Avatar</span>
          <div className="avatar-choice-list">
            {AVATAR_IMAGES.map((avatar, index) => (
              <button key={avatar} type="button" className={`avatar-choice ${activeProfile?.avatar === avatar ? 'selected' : ''}`} aria-pressed={activeProfile?.avatar === avatar} aria-label={`Choose Avatar ${index + 1}`} onClick={() => onUpdateAvatar?.(activeProfile.id, avatar)}>
                <AppImage src={avatar} fallbackSrc={AVATAR_FALLBACK} alt={`Avatar ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="player-card-stats-row">
          <span>Games: <strong>{games}</strong></span>
          <span>Wins: <strong>{wins}</strong></span>
          <span>Win Rate: <strong>{winRate}%</strong></span>
        </div>

        <div className="player-card-actions" role="group" aria-label="Profile Actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={activePanel === 'switch' ? handleClose : handleOpenSwitch}
            aria-label="Switch Player Profile"
          >
            Switch
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={activePanel === 'rename' ? handleClose : handleOpenRename}
            aria-label="Rename Current Player Profile"
          >
            Rename
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={activePanel === 'delete' ? handleClose : handleOpenDelete}
            aria-label="Delete Current Player Profile"
            disabled={profiles.length <= 1}
          >
            Delete
          </button>
        </div>
      </div>

      {activePanel === 'switch' && (
        <div className="profile-panel-box" aria-label="Switch Player Profile Panel">
          <h3 className="panel-title">SELECT PLAYER PROFILE</h3>
          <ul className="profile-select-list">
            {profiles.map((p) => {
              const isActive = p.id === activeProfileId;
              return (
                <li key={p.id} className="profile-select-item">
                  <button
                    type="button"
                    className={`btn-profile-select ${isActive ? 'selected' : ''}`}
                    aria-pressed={isActive}
                    onClick={() => handleSelectSwitch(p.id)}
                    aria-label={`Select player ${p.name}${isActive ? ' (currently active)' : ''}`}
                  >
                    <span className="avatar-circle">
                      <AppImage src={p.avatar || AVATAR_FALLBACK} fallbackSrc={AVATAR_FALLBACK} alt={`${p.name} avatar`} />
                      <span className="avatar-initial-fallback" aria-hidden="true">{p.name?.charAt(0).toUpperCase() || 'P'}</span>
                    </span>
                    <span className="profile-item-name">{p.name}</span>
                    {isActive && <span className="active-badge">(ACTIVE)</span>}
                  </button>

                </li>
              );
            })}
          </ul>
          <button type="button" className="btn-secondary cancel-btn" onClick={handleClose}>
            Close
          </button>
        </div>
      )}

      {activePanel === 'create' && (
        <form className="create-player-card" onSubmit={handleCreateSubmit} aria-label="Create New Player Profile Form">
          <div className="create-player-header">
            <div className="create-avatar-badge">+</div>
            <div className="create-header-text">
              <h3 className="create-title">Create New Player</h3>
              <p className="create-subtitle">Add a new player profile with separate progress and statistics.</p>
            </div>
          </div>

          <div className="form-group-field">
            <label htmlFor="new-player-name-input" className="field-label">
              Player name
            </label>
            <input
              id="new-player-name-input"
              type="text"
              className={`create-player-input ${errorMessage ? 'has-error' : ''}`}
              maxLength={20}
              value={inputName}
              onChange={(e) => {
                setInputName(e.target.value);
                setErrorMessage('');
              }}
              placeholder="Enter name (1-20 characters)"
              autoFocus
            />
            <span className="field-helper-text">
              Enter a unique name (1 to 20 characters).
            </span>
          </div>

          {errorMessage && (
            <div className="profile-error-message inline-error" role="alert">
              {errorMessage}
            </div>
          )}

          <div className="create-actions-row">
            <button type="submit" className="btn-primary">
              Create Player
            </button>
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {activePanel === 'rename' && (
        <form className="profile-panel-box" onSubmit={handleRenameSubmit} aria-label="Rename Player Profile Form">
          <h3 className="panel-title">Rename Player: {activeName}</h3>
          <div className="form-group-field">
            <label htmlFor="rename-player-name-input" className="field-label">
              New Name
            </label>
            <input
              id="rename-player-name-input"
              type="text"
              className={`terminal-input ${errorMessage ? 'has-error' : ''}`}
              maxLength={20}
              value={inputName}
              onChange={(e) => {
                setInputName(e.target.value);
                setErrorMessage('');
              }}
              placeholder="Enter new name (1-20 characters)"
              autoFocus
            />
          </div>

          {errorMessage && (
            <div className="profile-error-message inline-error" role="alert">
              {errorMessage}
            </div>
          )}

          <div className="panel-form-actions">
            <button type="submit" className="btn-primary">
              Save Name
            </button>
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {activePanel === 'delete' && (
        <div className="profile-panel-box danger" aria-label="Delete Player Profile Confirmation">
          <h3 className="panel-title danger-title">DELETE PLAYER PROFILE</h3>

          {profiles.length <= 1 ? (
            <p className="danger-text">Cannot delete the final remaining player profile.</p>
          ) : (
            <>
              <p className="danger-text">
                Are you sure you want to delete profile <strong>"{activeName}"</strong>? All progress for this player will be permanently lost.
              </p>

              {errorMessage && (
                <div className="profile-error-message" role="alert">
                  {errorMessage}
                </div>
              )}

              <div className="panel-form-actions">
                <button type="button" className="btn-danger-confirm" onClick={handleDeleteConfirm}>
                  Confirm Delete
                </button>
                <button type="button" className="btn-secondary" onClick={handleClose}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

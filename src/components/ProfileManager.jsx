import React, { useState } from 'react';

export function ProfileManager({
  profiles = [],
  activeProfileId,
  activeProfile,
  onCreateProfile,
  onSwitchProfile,
  onRenameProfile,
  onDeleteProfile,
}) {
  const [activePanel, setActivePanel] = useState(null); // null | 'switch' | 'create' | 'rename' | 'delete'
  const [inputName, setInputName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const activeName = activeProfile ? activeProfile.name : 'Unknown';

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
    <section className="profile-manager-container" aria-label="Player Profiles Manager">
      <div className="profile-manager-header">
        <div className="profile-active-display">
          <span className="profile-active-label">ACTIVE PLAYER:</span>
          <strong className="profile-active-name">{activeName}</strong>
        </div>

        <div className="profile-action-buttons" role="group" aria-label="Profile Actions">
          <button
            type="button"
            className={`btn-profile-action ${activePanel === 'switch' ? 'active' : ''}`}
            onClick={activePanel === 'switch' ? handleClose : handleOpenSwitch}
            aria-label="Switch Player Profile"
          >
            👤 Switch Player
          </button>
          <button
            type="button"
            className={`btn-profile-action ${activePanel === 'create' ? 'active' : ''}`}
            onClick={activePanel === 'create' ? handleClose : handleOpenCreate}
            aria-label="Create New Player Profile"
          >
            ➕ New Player
          </button>
          <button
            type="button"
            className={`btn-profile-action ${activePanel === 'rename' ? 'active' : ''}`}
            onClick={activePanel === 'rename' ? handleClose : handleOpenRename}
            aria-label="Rename Current Player Profile"
          >
            ✏️ Rename
          </button>
          <button
            type="button"
            className={`btn-profile-action danger ${activePanel === 'delete' ? 'active' : ''}`}
            onClick={activePanel === 'delete' ? handleClose : handleOpenDelete}
            aria-label="Delete Current Player Profile"
            disabled={profiles.length <= 1}
          >
            🗑️ Delete
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
        <form className="profile-panel-box" onSubmit={handleCreateSubmit} aria-label="Create New Player Profile Form">
          <h3 className="panel-title">CREATE NEW PLAYER</h3>
          <div className="form-group">
            <label htmlFor="new-player-name-input">Player Name:</label>
            <input
              id="new-player-name-input"
              type="text"
              className="terminal-input"
              maxLength={20}
              value={inputName}
              onChange={(e) => {
                setInputName(e.target.value);
                setErrorMessage('');
              }}
              placeholder="Enter name (1-20 chars)"
              autoFocus
            />
          </div>

          {errorMessage && (
            <div className="profile-error-message" role="alert">
              ⚠️ {errorMessage}
            </div>
          )}

          <div className="panel-form-actions">
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
          <h3 className="panel-title">RENAME PLAYER: {activeName}</h3>
          <div className="form-group">
            <label htmlFor="rename-player-name-input">New Name:</label>
            <input
              id="rename-player-name-input"
              type="text"
              className="terminal-input"
              maxLength={20}
              value={inputName}
              onChange={(e) => {
                setInputName(e.target.value);
                setErrorMessage('');
              }}
              placeholder="Enter new name (1-20 chars)"
              autoFocus
            />
          </div>

          {errorMessage && (
            <div className="profile-error-message" role="alert">
              ⚠️ {errorMessage}
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
                  ⚠️ {errorMessage}
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

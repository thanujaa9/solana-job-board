import React, { useState, useEffect } from 'react';
import ProfileForm from './ProfileForm';

function Profile({ token, onLogout, initialProfileData, onProfileUpdated, onCancelEdit }) {
  return (
    <div className="p-4">
      <ProfileForm
        token={token}
        onProfileUpdated={onProfileUpdated}
        initialProfileData={initialProfileData}
        onCancelEdit={onCancelEdit}
      />
    </div>
  );
}

export default Profile;

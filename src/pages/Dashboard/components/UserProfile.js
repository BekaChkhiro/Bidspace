import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import SiteActions from './SiteActions';

const UserProfile = () => {
  const { user } = useAuth();

  return <SiteActions user={user} />;
};

export default UserProfile;

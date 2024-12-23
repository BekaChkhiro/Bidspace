import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import SiteActions from '../common/SiteActions';

const UserProfile = () => {
  const { user } = useAuth();

  return <SiteActions user={user} />;
};

export default UserProfile;

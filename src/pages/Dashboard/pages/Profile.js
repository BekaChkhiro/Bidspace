import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNav from '../components/DashboardNav';
import { useAuth } from '../../../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="flex">
      <DashboardNav />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">პროფილი</h1>
        <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">სახელი</label>
              <p className="mt-1 text-lg">{user?.name || 'არ არის მითითებული'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ელ-ფოსტა</label>
              <p className="mt-1 text-lg">{user?.email || 'არ არის მითითებული'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ტელეფონი</label>
              <p className="mt-1 text-lg">{user?.phone || 'არ არის მითითებული'}</p>
            </div>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              პროფილის რედაქტირება
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import PasswordChange from '../components/PasswordChange';
import PhoneChangeModal from '../components/PhoneChangeModal';
import EmailChangeModal from '../components/EmailChangeModal';
import Alert from '../../../components/Alert';

const Settings = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    nickname: '',
    piradi_nomeri: ''
  });
  const [loading, setLoading] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (user) {
      console.log('User object available:', user);
      fetchUserData();
    } else {
      console.log('No user object available');
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      console.log('Fetching user data...');
      const response = await fetch(`/wp-json/wp/v2/users/me`, {
        credentials: 'include',
        headers: {
          'X-WP-Nonce': wpApiSettings.nonce
        }
      });
      const data = await response.json();
      console.log('Received user data:', data);
      setUserData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone_number: data.meta?.phone_number || '',
        nickname: data.nickname || '',
        piradi_nomeri: data.meta?.piradi_nomeri || ''
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/wp-json/wp/v2/users/me`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpApiSettings.nonce
        },
        body: JSON.stringify({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          nickname: userData.nickname,
          meta: {
            phone_number: userData.phone_number,
            piradi_nomeri: userData.piradi_nomeri
          }
        })
      });

      if (!response.ok) throw new Error('Update failed');

      showToast('პროფილი წარმატებით განახლდა');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('პროფილის განახლება ვერ მოხერხდა', 'error');
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {toast && (
          <div className="fixed bottom-4 right-4 z-50">
            <Alert
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          </div>
        )}
        <h2 className="text-2xl font-bold">პირადი მონაცემების რედაქტირება</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">სახელი</label>
              <input type="text" id="first_name" name="first_name" value={userData.first_name} onChange={handleInputChange} required className="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">გვარი</label>
              <input type="text" id="last_name" name="last_name" value={userData.last_name} onChange={handleInputChange} required className="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">ელ-ფოსტა</label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userData.email}
                  disabled
                  className="settings-field-style block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 pr-20"
                />
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 text-sm text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
                >
                  შეცვლა
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">ტელეფონის ნომერი</label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  id="phone_number"
                  name="phone_number"
                  value={userData.phone_number}
                  disabled
                  className="settings-field-style block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 pr-20"
                />
                <button
                  type="button"
                  onClick={() => setIsPhoneModalOpen(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 text-sm text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
                >
                  შეცვლა
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">მომხმარებლის სახელი</label>
              <input type="text" id="nickname" name="nickname" value={userData.nickname} onChange={handleInputChange} required className="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
            </div>
            <div>
              <label htmlFor="piradi_nomeri" className="block text-sm font-medium text-gray-700">პირადი ნომერი</label>
              <input type="text" id="piradi_nomeri" name="piradi_nomeri" value={userData.piradi_nomeri} onChange={handleInputChange} className="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
            </div>
          </div>
          <div className="flex">
            <button
              type="submit"
              className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:bg-gray-400"
              disabled={loading}
            >
              შენახვა
            </button>
          </div>
        </form>

        <div className="border-t pt-6">
          <PasswordChange />
        </div>

        <PhoneChangeModal
          isOpen={isPhoneModalOpen}
          onClose={() => setIsPhoneModalOpen(false)}
          currentPhone={userData.phone_number}
          onPhoneChange={(newPhone) => {
            setUserData(prev => ({
              ...prev,
              phone_number: newPhone
            }));
            showToast('ტელეფონის ნომერი წარმატებით შეიცვალა');
          }}
        />

        <EmailChangeModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          currentEmail={userData.email}
          onEmailChange={(newEmail) => {
            setUserData(prev => ({
              ...prev,
              email: newEmail
            }));
            showToast('ელ-ფოსტა წარმატებით შეიცვალა');
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default Settings;
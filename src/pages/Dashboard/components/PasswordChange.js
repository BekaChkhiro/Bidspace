import React, { useState } from 'react';

const PasswordChange = () => {
  const [userData, setUserData] = useState({
    password: '',
    password_confirm: '',
    verification_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const requestPasswordReset = async () => {
    setLoading(true);
    try {
      const response = await fetch('/wp-json/bidspace/v1/request-password-reset', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpApiSettings.nonce
        }
      });

      if (!response.ok) throw new Error('Failed to send verification code');

      setVerificationSent(true);
      setShowVerification(true);
      alert('დადასტურების კოდი გამოგზავნილია თქვენს ელ-ფოსტაზე');
    } catch (error) {
      console.error('Error requesting password reset:', error);
      alert('დადასტურების კოდის გაგზავნა ვერ მოხერხდა');
    }
    setLoading(false);
  };

  const verifyAndUpdatePassword = async () => {
    if (!userData.verification_code) {
      alert('გთხოვთ შეიყვანოთ დადასტურების კოდი');
      return;
    }

    if (!userData.password || !userData.password_confirm) {
      alert('გთხოვთ შეიყვანოთ ახალი პაროლი');
      return;
    }

    if (userData.password !== userData.password_confirm) {
      alert('პაროლები არ ემთხვევა');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/wp-json/bidspace/v1/verify-and-reset-password', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpApiSettings.nonce
        },
        body: JSON.stringify({
          code: userData.verification_code,
          new_password: userData.password
        })
      });

      if (!response.ok) throw new Error('Verification failed');

      alert('პაროლი წარმატებით შეიცვალა');
      setShowVerification(false);
      setVerificationSent(false);
      setUserData({
        password: '',
        password_confirm: '',
        verification_code: ''
      });
    } catch (error) {
      console.error('Error verifying code:', error);
      alert('დადასტურების კოდი არასწორია ან ვადაგასულია');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">პაროლის შეცვლა</h3>
      <div className="grid grid-cols-2 gap-4">
        {!showVerification ? (
          <div className="col-span-2">
            <button
              type="button"
              onClick={requestPasswordReset}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              style={{ backgroundColor: '#00AEEF' }}
              disabled={loading}
            >
              პაროლის შეცვლის დაწყება
            </button>
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="verification_code" className="block text-sm font-medium text-gray-700">დადასტურების კოდი</label>
              <input
                type="text"
                id="verification_code"
                name="verification_code"
                value={userData.verification_code}
                onChange={handleInputChange}
                placeholder="შეიყვანეთ კოდი"
                className="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">&nbsp;</label>
              <button
                type="button"
                onClick={() => setShowVerification(false)}
                className="mt-1 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                გაუქმება
              </button>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">ახალი პაროლი</label>
              <input
                type="password"
                id="password"
                name="password"
                value={userData.password}
                onChange={handleInputChange}
                className="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">გაიმეორეთ ახალი პაროლი</label>
              <input
                type="password"
                id="password_confirm"
                name="password_confirm"
                value={userData.password_confirm}
                onChange={handleInputChange}
                className="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div className="col-span-2">
              <button
                type="button"
                onClick={verifyAndUpdatePassword}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                style={{ backgroundColor: '#00AEEF' }}
                disabled={loading}
              >
                პაროლის შეცვლა
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PasswordChange;

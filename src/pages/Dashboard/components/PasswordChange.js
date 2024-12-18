import React, { useState, useEffect } from 'react';
import Alert from '../../../components/Alert';

const PasswordChange = () => {
  const [userData, setUserData] = useState({
    password: '',
    password_confirm: '',
    verification_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [alert, setAlert] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds = 1 minute
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));

    // If entering verification code, check if it's correct
    if (name === 'verification_code' && value.length === 6) {
      verifyCode(value);
    }
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const startTimer = () => {
    setTimeLeft(60);
    if (timer) clearInterval(timer);
    
    const newTimer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(newTimer);
          if (!showPasswordFields) {
            setShowVerification(false);
            showAlert('დრო ამოიწურა. სცადეთ თავიდან', 'error');
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    setTimer(newTimer);
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
      setShowPasswordFields(false);
      showAlert('დადასტურების კოდი გამოგზავნილია თქვენს ელ-ფოსტაზე', 'success');
      startTimer();
    } catch (error) {
      console.error('Error requesting password reset:', error);
      showAlert('დადასტურების კოდის გაგზავნა ვერ მოხერხდა', 'error');
    }
    setLoading(false);
  };

  const verifyCode = async (code) => {
    if (!code || code.length !== 6) return;

    setLoading(true);
    try {
      const response = await fetch('/wp-json/bidspace/v1/verify-code', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpApiSettings.nonce
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) throw new Error('Invalid code');

      showAlert('კოდი სწორია', 'success');
      setShowPasswordFields(true);
      if (timer) clearInterval(timer);
    } catch (error) {
      console.error('Error verifying code:', error);
      showAlert('არასწორი კოდი', 'error');
    }
    setLoading(false);
  };

  const verifyAndUpdatePassword = async () => {
    if (!userData.password || !userData.password_confirm) {
      showAlert('გთხოვთ შეიყვანოთ ახალი პაროლი', 'error');
      return;
    }

    if (userData.password !== userData.password_confirm) {
      showAlert('პაროლები არ ემთხვევა', 'error');
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

      showAlert('პაროლი წარმატებით შეიცვალა', 'success');
      setShowVerification(false);
      setShowPasswordFields(false);
      setVerificationSent(false);
      setUserData({
        password: '',
        password_confirm: '',
        verification_code: ''
      });
    } catch (error) {
      console.error('Error verifying code:', error);
      showAlert('დადასტურების კოდი არასწორია ან ვადაგასულია', 'error');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    if (timer) clearInterval(timer);
    setShowVerification(false);
    setShowPasswordFields(false);
    setUserData({
      password: '',
      password_confirm: '',
      verification_code: ''
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">პაროლის შეცვლა</h3>
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
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
              <label htmlFor="verification_code" className="block text-sm font-medium text-gray-700">
                დადასტურების კოდი {timeLeft > 0 && <span className="text-gray-500 ml-2">({timeLeft} წამი)</span>}
              </label>
              <input
                type="text"
                id="verification_code"
                name="verification_code"
                value={userData.verification_code}
                onChange={handleInputChange}
                placeholder="შეიყვანეთ კოდი"
                maxLength={6}
                className="settings-field-style mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                disabled={showPasswordFields}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">&nbsp;</label>
              <button
                type="button"
                onClick={handleCancel}
                className="mt-1 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                გაუქმება
              </button>
            </div>
            {showPasswordFields && (
              <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default PasswordChange;

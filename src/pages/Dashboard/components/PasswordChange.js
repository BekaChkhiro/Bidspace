import React, { useState, useEffect } from 'react';
import Alert from '../../../components/Alert';

const PasswordChange = () => {
  const [userData, setUserData] = useState({
    password: '',
    password_confirm: '',
    verification_code: '',
    phone: '',
    verificationMethod: 'email' // Default to email
  });
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [alert, setAlert] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
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
        },
        body: JSON.stringify({
          verification_method: userData.verificationMethod,
          phone: userData.phone
        })
      });

      if (!response.ok) throw new Error('Failed to send verification code');

      setVerificationSent(true);
      setShowVerification(true);
      setShowPasswordFields(false);
      showAlert(
        userData.verificationMethod === 'email' 
          ? 'დადასტურების კოდი გამოგზავნილია თქვენს ელ-ფოსტაზე'
          : 'დადასტურების კოდი გამოგზავნილია SMS-ით',
        'success'
      );
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
    <div className="px-9 pb-9 pt-12 flex flex-col gap-4">
      <h3 className="text-xl font-semibold text-center">პაროლის აღდგენა</h3>
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      <div className="flex flex-col gap-4">
        {!showVerification ? (
          <>
            <div className="flex flex-col gap-2.5">
              <label className="text-sm text-gray-600">დადასტურების მეთოდი</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="verificationMethod"
                    value="email"
                    checked={userData.verificationMethod === 'email'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  ელ-ფოსტა
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="verificationMethod"
                    value="sms"
                    checked={userData.verificationMethod === 'sms'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  SMS
                </label>
              </div>
            </div>
            {userData.verificationMethod === 'sms' && (
              <div className="flex flex-col gap-2.5">
                <label htmlFor="phone" className="text-sm text-gray-600">ტელეფონის ნომერი</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={userData.phone}
                  onChange={handleInputChange}
                  placeholder="+995"
                  className="px-3 py-2 border border-gray-600 rounded-2xl"
                />
              </div>
            )}
            <button
              type="button"
              onClick={requestPasswordReset}
              className="w-full text-sm bg-black text-white p-4 rounded-full hover:bg-gray-900 transition-colors"
              disabled={loading || (userData.verificationMethod === 'sms' && !userData.phone)}
            >
              პაროლის შეცვლის დაწყება
            </button>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2.5">
              <label htmlFor="verification_code" className="text-sm text-gray-600">
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
                className="px-3 py-2 border border-gray-600 rounded-2xl"
                disabled={showPasswordFields}
              />
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="w-full text-sm border border-gray-600 text-gray-600 p-4 rounded-full hover:bg-gray-50 transition-colors"
            >
              გაუქმება
            </button>
            {showPasswordFields && (
              <>
                <div className="flex flex-col gap-2.5">
                  <label htmlFor="password" className="text-sm text-gray-600">ახალი პაროლი</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={userData.password}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-gray-600 rounded-2xl"
                  />
                </div>
                <div className="flex flex-col gap-2.5">
                  <label htmlFor="password_confirm" className="text-sm text-gray-600">გაიმეორეთ ახალი პაროლი</label>
                  <input
                    type="password"
                    id="password_confirm"
                    name="password_confirm"
                    value={userData.password_confirm}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-gray-600 rounded-2xl"
                  />
                </div>
                <button
                  type="button"
                  onClick={verifyAndUpdatePassword}
                  className="w-full text-sm bg-black text-white p-4 rounded-full hover:bg-gray-900 transition-colors"
                  disabled={loading}
                >
                  პაროლის შეცვლა
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PasswordChange;

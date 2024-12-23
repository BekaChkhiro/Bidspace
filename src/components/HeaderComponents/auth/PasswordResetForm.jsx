import React, { useState, useEffect } from 'react';

const PasswordResetForm = ({ setIsPasswordReset }) => {
  const [userData, setUserData] = useState({
    password: '',
    password_confirm: '',
    verification_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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
            setErrorMessage('დრო ამოიწურა. სცადეთ თავიდან');
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

      setShowVerification(true);
      setShowPasswordFields(false);
      setErrorMessage('');
      startTimer();
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setErrorMessage('დადასტურების კოდის გაგზავნა ვერ მოხერხდა');
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

      setErrorMessage('');
      setShowPasswordFields(true);
      if (timer) clearInterval(timer);
    } catch (error) {
      console.error('Error verifying code:', error);
      setErrorMessage('არასწორი კოდი');
    }
    setLoading(false);
  };

  const verifyAndUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (!userData.password || !userData.password_confirm) {
      setErrorMessage('გთხოვთ შეიყვანოთ ახალი პაროლი');
      return;
    }

    if (userData.password !== userData.password_confirm) {
      setErrorMessage('პაროლები არ ემთხვევა');
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
      setIsPasswordReset(false);
    } catch (error) {
      console.error('Error verifying code:', error);
      setErrorMessage('დადასტურების კოდი არასწორია ან ვადაგასულია');
    }
    setLoading(false);
  };

  return (
    <div className="px-9 pb-9 pt-12 flex flex-col gap-4">
      <h3 className="text-xl font-semibold text-center">პაროლის აღდგენა</h3>
      {errorMessage && (
        <p className="text-sm text-red-500 text-center">{errorMessage}</p>
      )}
      <div className="flex flex-col gap-4">
        {!showVerification ? (
          <>
            <button
              type="button"
              onClick={requestPasswordReset}
              className="w-full text-sm bg-black text-white p-4 rounded-full hover:bg-gray-900 transition-colors"
              disabled={loading}
            >
              პაროლის აღდგენის დაწყება
            </button>
            <button
              type="button"
              onClick={() => setIsPasswordReset(false)}
              className="w-full text-sm border border-gray-600 text-gray-600 p-4 rounded-full hover:bg-gray-50 transition-colors"
            >
              უკან დაბრუნება
            </button>
          </>
        ) : (
          <form onSubmit={verifyAndUpdatePassword} className="flex flex-col gap-4">
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
              </>
            )}

            {showPasswordFields ? (
              <button
                type="submit"
                className="w-full text-sm bg-black text-white p-4 rounded-full hover:bg-gray-900 transition-colors"
                disabled={loading}
              >
                პაროლის შეცვლა
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsPasswordReset(false)}
                className="w-full text-sm border border-gray-600 text-gray-600 p-4 rounded-full hover:bg-gray-50 transition-colors"
              >
                გაუქმება
              </button>
            )}

            {!showPasswordFields && (
              <p className="text-sm text-gray-600 text-center mt-4">
                არ მიგიღიათ კოდი? {' '}
                <button 
                  type="button"
                  onClick={requestPasswordReset}
                  className="font-bold hover:underline"
                >
                  ხელახლა გაგზავნა
                </button>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default PasswordResetForm;

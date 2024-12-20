import React, { useState, useEffect } from 'react';
import Alert from '../../../components/Alert';
import { auth, initializeRecaptcha, cleanupRecaptcha } from '../../../firebase-config';
import { signInWithPhoneNumber } from 'firebase/auth';

const PasswordChange = () => {
  const [userData, setUserData] = useState({
    password: '',
    password_confirm: '',
    verification_code: '',
    phone: '',
    verificationMethod: 'email'
  });
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [alert, setAlert] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timer, setTimer] = useState(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
      cleanupRecaptcha();
    };
  }, [timer]);

  const formatPhoneNumber = (number) => {
    let cleaned = number.replace(/\D/g, '');
    if (cleaned.startsWith('995')) {
      cleaned = cleaned.slice(3);
    }
    cleaned = cleaned.slice(0, 9);
    return cleaned;
  };

  const isValidPhoneNumber = (number) => {
    const cleaned = number.replace(/\D/g, '');
    const numberWithoutCountry = cleaned.startsWith('995') ? 
      cleaned.slice(3) : cleaned;
    return /^5\d{8}$/.test(numberWithoutCountry);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setUserData(prev => ({
        ...prev,
        [name]: formattedPhone
      }));
    } else {
      setUserData(prev => ({
        ...prev,
        [name]: value
      }));
    }

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
            cleanupRecaptcha();
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
      if (userData.verificationMethod === 'email') {
        const response = await fetch('/wp-json/bidspace/v1/request-password-reset', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': wpApiSettings.nonce
          },
          body: JSON.stringify({
            verification_method: 'email'
          })
        });

        if (!response.ok) throw new Error('Failed to send verification code');
      } else {
        // SMS ვერიფიკაცია
        if (!isValidPhoneNumber(userData.phone)) {
          throw new Error('გთხოვთ შეიყვანოთ ვალიდური ქართული მობილურის ნომერი (მაგ: 555123456)');
        }

        // Format phone number
        const formattedPhone = userData.phone.startsWith('995') ? 
          `+${userData.phone}` : 
          `+995${userData.phone}`;
        
        console.log('1. Formatting phone number:', formattedPhone);

        // Initialize reCAPTCHA
        console.log('2. Initializing reCAPTCHA...');
        const recaptchaVerifier = initializeRecaptcha('recaptcha-container');
        
        // Send verification code
        console.log('3. Sending SMS...');
        const confirmationResult = await signInWithPhoneNumber(
          auth,
          formattedPhone,
          recaptchaVerifier
        );
        
        console.log('4. SMS sent successfully!');
        window.confirmationResult = confirmationResult;
      }

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
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });

      let errorMessage = 'დადასტურების კოდის გაგზავნა ვერ მოხერხდა';
      
      switch (error.code) {
        case 'auth/invalid-phone-number':
          errorMessage = 'არასწორი ტელეფონის ნომერი';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'ძალიან ბევრი მცდელობა. გთხოვთ სცადოთ მოგვიანებით';
          break;
        case 'auth/captcha-check-failed':
          errorMessage = 'Recaptcha შემოწმება ვერ მოხერხდა. გთხოვთ სცადოთ თავიდან';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'ინტერნეტთან კავშირის პრობლემა. გთხოვთ შეამოწმოთ კავშირი';
          break;
        default:
          if (error.message.includes('-39')) {
            errorMessage = 'Recaptcha ინიციალიზაციის შეცდომა. გთხოვთ განაახლოთ გვერდი';
          } else {
            errorMessage = `შეცდომა: ${error.message}`;
          }
      }
      
      showAlert(errorMessage, 'error');
      cleanupRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (code = userData.verification_code) => {
    if (!code || code.length !== 6) {
      showAlert('გთხოვთ შეიყვანოთ 6-ნიშნა კოდი', 'error');
      return;
    }

    setLoading(true);
    try {
      if (userData.verificationMethod === 'sms') {
        if (!window.confirmationResult) {
          throw new Error('No verification in progress');
        }
        await window.confirmationResult.confirm(code);
      }

      const response = await fetch('/wp-json/bidspace/v1/verify-code', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpApiSettings.nonce
        },
        body: JSON.stringify({
          verification_code: code,
          verification_method: userData.verificationMethod
        })
      });

      if (!response.ok) throw new Error('Invalid verification code');

      setShowVerification(false);
      setShowPasswordFields(true);
      showAlert('კოდი დადასტურებულია', 'success');
      cleanupRecaptcha();
    } catch (error) {
      console.error('Error verifying code:', error);
      showAlert('არასწორი კოდი', 'error');
      cleanupRecaptcha();
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setShowVerification(false);
    setShowPasswordFields(false);
    setUserData(prev => ({
      ...prev,
      verification_code: '',
      password: '',
      password_confirm: ''
    }));
    cleanupRecaptcha();
  };

  const resetPassword = async () => {
    setLoading(true);
    try {
      const response = await fetch('/wp-json/bidspace/v1/reset-password', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpApiSettings.nonce
        },
        body: JSON.stringify({
          password: userData.password,
          password_confirm: userData.password_confirm
        })
      });

      if (!response.ok) throw new Error('Failed to reset password');

      showAlert('პაროლი წარმატებით შეიცვალა', 'success');
      handleCancel();
    } catch (error) {
      console.error('Error resetting password:', error);
      showAlert('პაროლის შეცვლა ვერ მოხერხდა', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div id="recaptcha-container" key={showVerification ? 'showing' : 'hidden'}></div>
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      {!showVerification && !showPasswordFields && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">დადასტურების მეთოდი</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="verificationMethod"
                  value="email"
                  checked={userData.verificationMethod === 'email'}
                  onChange={(e) => setUserData(prev => ({ ...prev, verificationMethod: e.target.value }))}
                  className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2">ელ-ფოსტით</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="verificationMethod"
                  value="sms"
                  checked={userData.verificationMethod === 'sms'}
                  onChange={(e) => setUserData(prev => ({ ...prev, verificationMethod: e.target.value }))}
                  className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2">SMS-ით</span>
              </label>
            </div>
          </div>
          
          {userData.verificationMethod === 'sms' && (
            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-sm font-medium text-gray-700">ტელეფონის ნომერი</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                  +995
                </span>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={userData.phone}
                  onChange={handleInputChange}
                  placeholder="555123456"
                  className="w-full px-16 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={requestPasswordReset}
            disabled={loading || (userData.verificationMethod === 'sms' && !isValidPhoneNumber(userData.phone))}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            style={{ backgroundColor: '#00AEEF' }}
          >
            {loading ? 'იგზავნება...' : 'დადასტურების კოდის გაგზავნა'}
          </button>
        </div>
      )}

      {showVerification && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="verification_code" className="text-sm font-medium text-gray-700">
              დადასტურების კოდი {timeLeft > 0 && <span className="text-gray-500 ml-2">({timeLeft} წამი)</span>}
            </label>
            <input
              type="text"
              id="verification_code"
              name="verification_code"
              value={userData.verification_code}
              onChange={handleInputChange}
              maxLength={6}
              placeholder="შეიყვანეთ 6-ნიშნა კოდი"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              გაუქმება
            </button>
            <button
              type="button"
              onClick={() => verifyCode()}
              disabled={loading || userData.verification_code.length !== 6}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
              style={{ backgroundColor: '#00AEEF' }}
            >
              დადასტურება
            </button>
          </div>
        </div>
      )}

      {showPasswordFields && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">ახალი პაროლი</label>
            <input
              type="password"
              id="password"
              name="password"
              value={userData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password_confirm" className="text-sm font-medium text-gray-700">გაიმეორეთ პაროლი</label>
            <input
              type="password"
              id="password_confirm"
              name="password_confirm"
              value={userData.password_confirm}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              გაუქმება
            </button>
            <button
              type="button"
              onClick={resetPassword}
              disabled={loading || !userData.password || !userData.password_confirm || userData.password !== userData.password_confirm}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
              style={{ backgroundColor: '#00AEEF' }}
            >
              პაროლის შეცვლა
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordChange;

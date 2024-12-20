import React, { useState, useEffect } from 'react';
import Alert from '../../../components/Alert';
import { auth } from '../../../firebase-config';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

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
  const [debug, setDebug] = useState('');

  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timer]);

  // ტელეფონის ნომრის ფორმატირება
  const formatPhoneNumber = (number) => {
    // არა-ციფრების წაშლა
    let cleaned = number.replace(/\D/g, '');
    
    // თუ იწყება 995-ით, წაშალე
    if (cleaned.startsWith('995')) {
      cleaned = cleaned.slice(3);
    }
    
    // მაქსიმუმ 9 ციფრი
    cleaned = cleaned.slice(0, 9);
    
    return cleaned;
  };

  // ტელეფონის ნომრის ვალიდაცია
  const isValidPhoneNumber = (number) => {
    // არა-ციფრების წაშლა
    const cleaned = number.replace(/\D/g, '');
    
    // ქვეყნის კოდის მოშორება თუ არის
    const numberWithoutCountry = cleaned.startsWith('995') ? 
      cleaned.slice(3) : cleaned;
    
    // უნდა იყოს 9 ციფრი და იწყებოდეს 5-ით
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
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    setTimer(newTimer);
  };

  // Firebase Recaptcha-ს ინიციალიზაცია
  const generateRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved
        }
      });
    }
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

        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }

        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'send-code-button', {
          size: 'invisible',
          callback: async (response) => {
            setDebug(prev => prev + '\nRecaptcha წარმატებით გაიარა: ' + response);
          },
          'expired-callback': () => {
            showAlert('Recaptcha-ს ვადა გავიდა. სცადეთ თავიდან.', 'error');
            setDebug(prev => prev + '\nRecaptcha-ს ვადა გავიდა');
            if (window.recaptchaVerifier) {
              window.recaptchaVerifier.clear();
              window.recaptchaVerifier = null;
            }
            setLoading(false);
          }
        });

        // ნომრის ფორმატირება +995-ით
        const formattedPhone = userData.phone.startsWith('995') ? 
          `+${userData.phone}` : 
          `+995${userData.phone}`;
        
        setDebug(prev => prev + '\nფორმატირებული ნომერი: ' + formattedPhone);
        
        const confirmationResult = await signInWithPhoneNumber(
          auth,
          formattedPhone,
          window.recaptchaVerifier
        );
        
        window.confirmationResult = confirmationResult;
        setDebug(prev => prev + '\nSMS წარმატებით გაიგზავნა');
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
      console.error('Error requesting password reset:', error);
      showAlert(error.message || 'დადასტურების კოდის გაგზავნა ვერ მოხერხდა', 'error');
      setDebug(prev => prev + '\nError: ' + error.message);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    }
    setLoading(false);
  };

  const verifyCode = async (code) => {
    if (!code || code.length !== 6) return;

    setLoading(true);
    try {
      if (userData.verificationMethod === 'email') {
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
      } else {
        // Firebase კოდის ვერიფიკაცია
        if (!window.confirmationResult) {
          throw new Error('No verification in progress');
        }
        await window.confirmationResult.confirm(code);
        setDebug(prev => prev + '\nკოდი წარმატებით დადასტურდა');
      }

      showAlert('კოდი სწორია', 'success');
      setShowPasswordFields(true);
      if (timer) clearInterval(timer);
    } catch (error) {
      console.error('Error verifying code:', error);
      showAlert('არასწორი კოდი', 'error');
      setDebug(prev => prev + '\nError: ' + error.message);
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
    <div className="flex flex-col gap-4">
      <div id="recaptcha-container"></div>
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
                <button
                  type="button"
                  onClick={() => handleInputChange({ target: { name: 'verificationMethod', value: 'email' } })}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 border-dashed transition-colors duration-200 ${
                    userData.verificationMethod === 'email'
                      ? 'bg-black text-white border-black'
                      : 'border-gray-300 text-gray-600 hover:border-[#00AEEF]'
                  }`}
                >
                  ელ-ფოსტა
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange({ target: { name: 'verificationMethod', value: 'sms' } })}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 border-dashed transition-colors duration-200 ${
                    userData.verificationMethod === 'sms'
                      ? 'bg-black text-white border-black'
                      : 'border-gray-300 text-gray-600 hover:border-[#00AEEF]'
                  }`}
                >
                  SMS
                </button>
              </div>
            </div>
            {userData.verificationMethod === 'sms' && (
              <div className="flex flex-col gap-2.5">
                <label htmlFor="phone" className="text-sm text-gray-600">ტელეფონის ნომერი</label>
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
                    className="w-full px-16 py-2 border border-gray-600 rounded-2xl"
                  />
                </div>
                <small className="text-gray-600 mt-1 block">
                  შეიყვანეთ 9-ნიშნა მობილურის ნომერი (მაგ: 555123456)
                </small>
              </div>
            )}
            <button
              id="send-code-button"
              type="button"
              onClick={requestPasswordReset}
              className="w-full text-sm bg-black text-white p-4 rounded-full hover:bg-gray-900 transition-colors"
              disabled={loading || (userData.verificationMethod === 'sms' && !isValidPhoneNumber(userData.phone))}
            >
              {loading ? 'იგზავნება...' : 'პაროლის შეცვლის დაწყება'}
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

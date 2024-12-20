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

  // Cleanup function to handle reCAPTCHA and timer
  const cleanup = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (error) {
        console.error('Error clearing reCAPTCHA:', error);
      }
      window.recaptchaVerifier = null;
    }
    if (window.confirmationResult) {
      window.confirmationResult = null;
    }
  };

  // Component cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // Timer cleanup when verification state changes
  useEffect(() => {
    if (!showVerification) {
      cleanup();
    }
  }, [showVerification]);

  // Cleanup on verification method change
  useEffect(() => {
    cleanup();
  }, [userData.verificationMethod]);

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
            cleanup();
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    setTimer(newTimer);
  };

  const generateRecaptcha = () => {
    cleanup(); // Clean up any existing instances

    return new Promise((resolve, reject) => {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: (response) => {
            resolve(response);
          },
          'expired-callback': () => {
            cleanup();
            showAlert('Recaptcha-ს ვადა გავიდა. სცადეთ თავიდან.', 'error');
            reject(new Error('reCAPTCHA expired'));
          }
        });
      } catch (error) {
        cleanup();
        reject(error);
      }
    });
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

        // Clear any existing reCAPTCHA
        cleanup();
        console.log('1. Cleaned up existing instances');

        // Create reCAPTCHA container if it doesn't exist
        let container = document.getElementById('recaptcha-container');
        if (!container) {
          console.error('reCAPTCHA container not found!');
          throw new Error('reCAPTCHA container not found');
        }
        console.log('2. Found reCAPTCHA container');

        // Initialize new reCAPTCHA verifier
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          'recaptcha-container',
          {
            size: 'invisible',
            callback: () => {
              console.log('3. reCAPTCHA callback success');
            },
            'expired-callback': () => {
              console.log('reCAPTCHA expired');
              cleanup();
              showAlert('Recaptcha-ს ვადა გავიდა. სცადეთ თავიდან.', 'error');
            }
          }
        );
        
        console.log('4. Created new reCAPTCHA verifier');

        // Format phone number
        const formattedPhone = userData.phone.startsWith('995') ? 
          `+${userData.phone}` : 
          `+995${userData.phone}`;
        
        console.log('5. Formatted phone number:', formattedPhone);

        // Send verification code
        console.log('6. Attempting to send SMS...');
        const confirmationResult = await signInWithPhoneNumber(
          auth,
          formattedPhone,
          window.recaptchaVerifier
        );
        
        console.log('7. SMS sent successfully!');
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
      console.error('Detailed error information:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });

      let errorMessage = 'დადასტურების კოდის გაგზავნა ვერ მოხერხდა';
      
      // Handle specific Firebase error codes
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
            // Force cleanup on -39 error
            cleanup();
          } else {
            errorMessage = `შეცდომა: ${error.message}`;
          }
      }
      
      showAlert(errorMessage, 'error');
      cleanup();
    } finally {
      setLoading(false);
    }
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
      cleanup();
    } catch (error) {
      console.error('Error verifying code:', error);
      showAlert('არასწორი კოდი', 'error');
      setDebug(prev => prev + '\nError: ' + error.message);
      cleanup();
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setShowVerification(false);
    setShowPasswordFields(false);
    setUserData({
      password: '',
      password_confirm: '',
      verification_code: ''
    });
    cleanup();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">პაროლის შეცვლა</h3>
      <div id="recaptcha-container" key={showVerification ? 'showing' : 'hidden'}></div>
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      {!showVerification && !showPasswordFields && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              დადასტურების მეთოდი
            </label>
            <div className="space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="verificationMethod"
                  value="email"
                  checked={userData.verificationMethod === 'email'}
                  onChange={handleInputChange}
                  className="form-radio"
                />
                <span className="ml-2">ელ-ფოსტა</span>
              </label>
              <br />
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="verificationMethod"
                  value="phone"
                  checked={userData.verificationMethod === 'phone'}
                  onChange={handleInputChange}
                  className="form-radio"
                />
                <span className="ml-2">ტელეფონის ნომერი</span>
              </label>
            </div>
          </div>
          
          {userData.verificationMethod === 'phone' && (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                ტელეფონის ნომერი
              </label>
              <div className="mt-1 relative">
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
                  className="block w-full pl-16 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          )}

          <button
            type="button"
            id="send-code-button"
            onClick={requestPasswordReset}
            disabled={loading || (userData.verificationMethod === 'phone' && !isValidPhoneNumber(userData.phone))}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            style={{ backgroundColor: '#00AEEF' }}
          >
            {loading ? 'იგზავნება...' : 'დადასტურების კოდის გაგზავნა'}
          </button>
        </div>
      )}

      {showVerification && !showPasswordFields && (
        <div className="space-y-4">
          <div>
            <label htmlFor="verification_code" className="block text-sm font-medium text-gray-700">
              დადასტურების კოდი {timeLeft > 0 && <span className="text-gray-500">({timeLeft} წამი)</span>}
            </label>
            <input
              type="text"
              id="verification_code"
              name="verification_code"
              value={userData.verification_code}
              onChange={handleInputChange}
              maxLength={6}
              placeholder="შეიყვანეთ 6-ნიშნა კოდი"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              onClick={() => verifyCode(userData.verification_code)}
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
        <div className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              ახალი პაროლი
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={userData.password}
              onChange={handleInputChange}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">
              გაიმეორეთ პაროლი
            </label>
            <input
              type="password"
              id="password_confirm"
              name="password_confirm"
              value={userData.password_confirm}
              onChange={handleInputChange}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              type="submit"
              disabled={loading || !userData.password || userData.password !== userData.password_confirm}
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

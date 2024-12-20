import React, { useState, useEffect } from 'react';
import Alert from '../../../components/Alert';
import { auth } from '../../../firebase-config';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const PhoneChange = ({ currentPhone, onPhoneChange }) => {
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [alert, setAlert] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timer, setTimer] = useState(null);

  // Cleanup function to handle reCAPTCHA and timer
  const cleanup = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    if (window.phoneRecaptchaVerifier) {
      try {
        window.phoneRecaptchaVerifier.clear();
      } catch (error) {
        console.error('Error clearing reCAPTCHA:', error);
      }
      window.phoneRecaptchaVerifier = null;
    }
    if (window.confirmationResult) {
      window.confirmationResult = null;
    }
  };

  // Return cleanup function
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // Cleanup on showVerification change
  useEffect(() => {
    if (!showVerification) {
      cleanup();
    }
  }, [showVerification]);

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

  const handlePhoneChange = (e) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setPhone(formattedPhone);
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
          setShowVerification(false);
          showAlert('დრო ამოიწურა. სცადეთ თავიდან', 'error');
          cleanup();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    setTimer(newTimer);
  };

  const sendVerificationCode = async () => {
    if (!isValidPhoneNumber(phone)) {
      showAlert('გთხოვთ შეიყვანოთ ვალიდური ქართული მობილურის ნომერი (მაგ: 555123456)', 'error');
      return;
    }

    setLoading(true);
    try {
      // Clear any existing reCAPTCHA
      cleanup();
      console.log('1. Cleaned up existing instances');

      // Create reCAPTCHA container if it doesn't exist
      let container = document.getElementById('phone-recaptcha-container');
      if (!container) {
        console.error('reCAPTCHA container not found!');
        throw new Error('reCAPTCHA container not found');
      }
      console.log('2. Found reCAPTCHA container');

      // Initialize new reCAPTCHA verifier
      window.phoneRecaptchaVerifier = new RecaptchaVerifier(
        auth,
        'phone-recaptcha-container',
        {
          size: 'invisible',
          callback: () => {
            console.log('3. reCAPTCHA callback success');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
            cleanup();
            showAlert('დადასტურების კოდის ვადა გავიდა. სცადეთ თავიდან', 'error');
          }
        }
      );
      
      console.log('4. Created new reCAPTCHA verifier');

      // Format phone number
      const formattedPhone = phone.startsWith('995') ? 
        `+${phone}` : 
        `+995${phone}`;
      
      console.log('5. Formatted phone number:', formattedPhone);

      // Send verification code
      console.log('6. Attempting to send SMS...');
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        window.phoneRecaptchaVerifier
      );
      
      console.log('7. SMS sent successfully!');
      window.confirmationResult = confirmationResult;
      setShowVerification(true);
      showAlert('დადასტურების კოდი გამოგზავნილია', 'success');
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

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      showAlert('გთხოვთ შეიყვანოთ 6-ნიშნა კოდი', 'error');
      return;
    }

    setLoading(true);
    try {
      if (!window.confirmationResult) {
        throw new Error('No verification in progress');
      }
      await window.confirmationResult.confirm(verificationCode);
      
      // Update phone number in WordPress
      const response = await fetch('/wp-json/wp/v2/users/me', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpApiSettings.nonce
        },
        body: JSON.stringify({
          meta: {
            phone_number: phone
          }
        })
      });

      if (!response.ok) throw new Error('Failed to update phone number');

      showAlert('ტელეფონის ნომერი წარმატებით შეიცვალა', 'success');
      onPhoneChange(phone);
      setShowVerification(false);
      setVerificationCode('');
      setPhone('');
      cleanup();
    } catch (error) {
      console.error('Error verifying code:', error);
      showAlert('არასწორი კოდი', 'error');
      cleanup();
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setShowVerification(false);
    setVerificationCode('');
    setPhone('');
    cleanup();
  };

  return (
    <div className="flex flex-col gap-4">
      <div id="phone-recaptcha-container" key={showVerification ? 'showing' : 'hidden'}></div>
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      {!showVerification ? (
        <div className="flex flex-col gap-2.5">
          <label htmlFor="new_phone" className="text-sm font-medium text-gray-700">ახალი ტელეფონის ნომერი</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
              +995
            </span>
            <input
              type="tel"
              id="new_phone"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="555123456"
              className="w-full px-16 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="button"
            onClick={sendVerificationCode}
            disabled={loading || !isValidPhoneNumber(phone)}
            className="mt-2 w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            style={{ backgroundColor: '#00AEEF' }}
          >
            {loading ? 'იგზავნება...' : 'დადასტურების კოდის გაგზავნა'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2.5">
            <label htmlFor="verification_code" className="text-sm font-medium text-gray-700">
              დადასტურების კოდი {timeLeft > 0 && <span className="text-gray-500 ml-2">({timeLeft} წამი)</span>}
            </label>
            <input
              type="text"
              id="verification_code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
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
              onClick={verifyCode}
              disabled={loading || verificationCode.length !== 6}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
              style={{ backgroundColor: '#00AEEF' }}
            >
              დადასტურება
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneChange;

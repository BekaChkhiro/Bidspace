import React, { useState, useEffect, useCallback } from 'react';
import Alert from '../../../components/Alert';
import RecaptchaContainer from '../../../components/RecaptchaContainer';
import { auth } from '../../../firebase-config';
import { signInWithPhoneNumber } from 'firebase/auth';

const PhoneChange = ({ currentPhone, onPhoneChange }) => {
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [alert, setAlert] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timer, setTimer] = useState(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timer]);

  const handleVerifierCreated = useCallback((verifier) => {
    setRecaptchaVerifier(verifier);
  }, []);

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

    if (!recaptchaVerifier) {
      showAlert('გთხოვთ დაელოდოთ reCAPTCHA-ს ინიციალიზაციას', 'error');
      return;
    }

    setLoading(true);
    try {
      // Format phone number
      const formattedPhone = phone.startsWith('995') ? 
        `+${phone}` : 
        `+995${phone}`;
      
      console.log('1. Formatting phone number:', formattedPhone);
      
      // Send verification code
      console.log('2. Sending SMS...');
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifier
      );
      
      console.log('3. SMS sent successfully!');
      window.confirmationResult = confirmationResult;
      setShowVerification(true);
      showAlert('დადასტურების კოდი გამოგზავნილია', 'success');
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
      console.log('1. Starting code verification...');
      
      if (!window.confirmationResult) {
        console.error('No confirmationResult found in window object');
        throw new Error('No verification in progress');
      }

      console.log('2. Confirming code...');
      const result = await window.confirmationResult.confirm(verificationCode);
      console.log('3. Verification result:', result);
      
      // Update phone number in WordPress
      console.log('4. Updating phone number in WordPress...');
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

      if (!response.ok) {
        const errorData = await response.json();
        console.error('WordPress API Error:', errorData);
        throw new Error('Failed to update phone number');
      }

      console.log('5. Phone number updated successfully!');
      showAlert('ტელეფონის ნომერი წარმატებით შეიცვალა', 'success');
      onPhoneChange(phone);
      setShowVerification(false);
      setVerificationCode('');
      setPhone('');
    } catch (error) {
      console.error('Verification Error:', error);
      
      let errorMessage = 'არასწორი კოდი';
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'არასწორი დადასტურების კოდი';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'კოდს ვადა გაუვიდა';
      }
      
      showAlert(errorMessage, 'error');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setShowVerification(false);
    setVerificationCode('');
    setPhone('');
  };

  return (
    <div className="flex flex-col gap-4">
      {!showVerification && <RecaptchaContainer onVerifierCreated={handleVerifierCreated} />}
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

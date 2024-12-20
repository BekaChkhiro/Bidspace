import React, { useState, useEffect, useCallback } from 'react';
import Alert from '../../../components/Alert';
import RecaptchaContainer from '../../../components/RecaptchaContainer';
import { auth } from '../../../firebase-config';
import { signInWithPhoneNumber } from 'firebase/auth';

const PasswordChange = () => {
  const [userData, setUserData] = useState({
    phone: '',
    verificationMethod: 'sms',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [alert, setAlert] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timer, setTimer] = useState(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);

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

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const startTimer = () => {
    setTimeLeft(300); // 5 minutes instead of 1
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

  const resendCode = async () => {
    if (loading) return;
    
    // Clear existing timer
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }

    // Reset verification code
    setVerificationCode('');
    
    // Request new code
    await requestPasswordReset();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isValidPhoneNumber = (number) => {
    const cleaned = number.replace(/\D/g, '');
    const numberWithoutCountry = cleaned.startsWith('995') ? 
      cleaned.slice(3) : cleaned;
    return /^5\d{8}$/.test(numberWithoutCountry);
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

        if (!recaptchaVerifier) {
          throw new Error('გთხოვთ დაელოდოთ reCAPTCHA-ს ინიციალიზაციას');
        }

        // Format phone number
        const formattedPhone = userData.phone.startsWith('995') ? 
          `+${userData.phone}` : 
          `+995${userData.phone}`;
        
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
      }

      setShowVerification(true);
      showAlert('დადასტურების კოდი გამოგზავნილია', 'success');
      startTimer();
    } catch (error) {
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });

      let errorMessage = error.message;
      
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
          }
      }
      
      showAlert(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      showAlert('გთხოვთ შეიყვანოთ 6-ნიშნა კოდი', 'error');
      return;
    }

    // Ensure code contains only numbers
    if (!/^\d{6}$/.test(verificationCode)) {
      showAlert('კოდი უნდა შეიცავდეს მხოლოდ ციფრებს', 'error');
      return;
    }

    if (userData.newPassword !== userData.confirmPassword) {
      showAlert('პაროლები არ ემთხვევა', 'error');
      return;
    }

    setLoading(true);
    try {
      console.log('1. Starting password reset process...');
      console.log('Verification code:', verificationCode);
      let verificationResponse;
      
      if (userData.verificationMethod === 'email') {
        console.log('2. Verifying email code...');
        verificationResponse = await fetch('/wp-json/bidspace/v1/verify-reset-code', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': wpApiSettings.nonce
          },
          body: JSON.stringify({
            verification_code: verificationCode
          })
        });

        if (!verificationResponse.ok) {
          const errorData = await verificationResponse.json();
          console.error('Email verification error:', errorData);
          throw new Error('Invalid verification code');
        }
      } else {
        console.log('2. Verifying SMS code...');
        if (!window.confirmationResult) {
          console.error('No confirmationResult found in window object');
          throw new Error('No verification in progress');
        }
        try {
          const result = await window.confirmationResult.confirm(verificationCode);
          console.log('3. SMS verification result:', result);
        } catch (confirmError) {
          console.error('SMS confirmation error details:', {
            code: confirmError.code,
            message: confirmError.message,
            stack: confirmError.stack
          });
          throw confirmError;
        }
      }

      // Update password
      console.log('4. Updating password...');
      const response = await fetch('/wp-json/bidspace/v1/update-password', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpApiSettings.nonce
        },
        body: JSON.stringify({
          current_password: userData.currentPassword,
          new_password: userData.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Password update error:', errorData);
        throw new Error(errorData.message || 'Failed to update password');
      }

      console.log('5. Password updated successfully!');
      showAlert('პაროლი წარმატებით შეიცვალა', 'success');
      setShowVerification(false);
      setVerificationCode('');
      setUserData({
        phone: '',
        verificationMethod: 'sms',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password reset error:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      let errorMessage = error.message;
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'არასწორი დადასტურების კოდი';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'კოდს ვადა გაუვიდა';
      } else if (error.code === 'auth/argument-error') {
        errorMessage = 'არასწორი ფორმატის კოდი';
      } else if (error.message.includes('current_password')) {
        errorMessage = 'მიმდინარე პაროლი არასწორია';
      }
      
      showAlert(errorMessage, 'error');
    }
    setLoading(false);
  };

  const handleVerificationCodeChange = (e) => {
    // Allow only numbers
    const value = e.target.value.replace(/\D/g, '');
    // Limit to 6 digits
    setVerificationCode(value.slice(0, 6));
  };

  const handleCancel = () => {
    setShowVerification(false);
    setVerificationCode('');
    setUserData({
      phone: '',
      verificationMethod: 'sms',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
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
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ვერიფიკაციის მეთოდი</label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  name="verificationMethod"
                  value="sms"
                  checked={userData.verificationMethod === 'sms'}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  SMS ვერიფიკაცია
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="verificationMethod"
                  value="email"
                  checked={userData.verificationMethod === 'email'}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Email ვერიფიკაცია
                </label>
              </div>
            </div>
          </div>

          {userData.verificationMethod === 'sms' && (
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
                  name="phone"
                  id="phone"
                  value={userData.phone}
                  onChange={handleChange}
                  placeholder="555123456"
                  className="w-full px-16 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              მიმდინარე პაროლი
            </label>
            <input
              type="password"
              name="currentPassword"
              id="currentPassword"
              value={userData.currentPassword}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              ახალი პაროლი
            </label>
            <input
              type="password"
              name="newPassword"
              id="newPassword"
              value={userData.newPassword}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              გაიმეორეთ ახალი პაროლი
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={userData.confirmPassword}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="button"
            onClick={requestPasswordReset}
            disabled={loading || 
              !userData.currentPassword || 
              !userData.newPassword || 
              !userData.confirmPassword || 
              (userData.verificationMethod === 'sms' && !isValidPhoneNumber(userData.phone))}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            style={{ backgroundColor: '#00AEEF' }}
          >
            {loading ? 'იგზავნება...' : 'პაროლის შეცვლა'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="verification_code" className="block text-sm font-medium text-gray-700">
              დადასტურების კოდი {timeLeft > 0 && (
                <span className="text-gray-500 ml-2">
                  ({Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')})
                </span>
              )}
            </label>
            <input
              type="text"
              id="verification_code"
              value={verificationCode}
              onChange={handleVerificationCodeChange}
              maxLength={6}
              placeholder="შეიყვანეთ 6-ნიშნა კოდი"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              pattern="\d*"
              inputMode="numeric"
            />
            {timeLeft > 0 && (
              <button
                type="button"
                onClick={resendCode}
                disabled={loading}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
              >
                კოდის თავიდან გაგზავნა
              </button>
            )}
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

export default PasswordChange;

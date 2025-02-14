import React, { useState, useEffect, useCallback } from 'react';
import { auth } from '../../../../lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, sendPasswordResetEmail } from 'firebase/auth';

const PasswordResetForm = ({ setIsPasswordReset }) => {
  const [method, setMethod] = useState('email'); // 'email' or 'phone'
  const [step, setStep] = useState('initial'); // initial, emailSent, verificationCode, newPassword
  const [userData, setUserData] = useState({
    email: '',
    phone: '',
    password: '',
    password_confirm: '',
    verification_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [timer, setTimer] = useState(null);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const initializeRecaptcha = useCallback(async () => {
    if (method === 'phone') {
      // Clear any existing reCAPTCHA
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      try {
        const recaptchaContainer = document.getElementById('recaptcha-container');
        if (!recaptchaContainer) return;

        window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainer, {
          size: 'normal',
          callback: () => {
            setLoading(false);
            // მოვაშორეთ ავტომატური გამოძახება
          },
          'expired-callback': () => {
            setLoading(true);
            if (window.recaptchaVerifier) {
              window.recaptchaVerifier.clear();
              window.recaptchaVerifier = null;
            }
          }
        });

        await window.recaptchaVerifier.render();
      } catch (error) {
        console.error('Error initializing reCAPTCHA:', error);
        setErrorMessage('reCAPTCHA ინიციალიზაციის შეცდომა');
      }
    }
  }, [method]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (method === 'phone') {
        initializeRecaptcha();
      }
    }, 1000); // Delay initialization to ensure DOM is ready

    return () => {
      clearTimeout(timer);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, [method, initializeRecaptcha]);

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
    setErrorMessage('');
  };

  const startTimer = () => {
    setTimeLeft(60);
    if (timer) clearInterval(timer);
    
    const newTimer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(newTimer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    setTimer(newTimer);
  };

  const requestPasswordReset = async () => {
    if (method === 'email') {
      if (!userData.email) {
        setErrorMessage('გთხოვთ შეიყვანოთ ელ-ფოსტა');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        setErrorMessage('გთხოვთ შეიყვანოთ სწორი ელ-ფოსტის მისამართი');
        return;
      }

      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, userData.email);
        setStep('emailSent');
        startTimer();
        setErrorMessage('');
      } catch (error) {
        console.error('Error requesting password reset:', error);
        setErrorMessage('დაფიქსირდა შეცდომა, სცადეთ თავიდან');
      }
      setLoading(false);
    } else {
      if (!userData.phone) {
        setErrorMessage('გთხოვთ შეიყვანოთ ტელეფონის ნომერი');
        return;
      }

      const phoneRegex = /^\+995[0-9]{9}$/;
      if (!phoneRegex.test(userData.phone)) {
        setErrorMessage('გთხოვთ შეიყვანოთ სწორი ტელეფონის ნომერი (+995xxxxxxxxx)');
        return;
      }

      setLoading(true);
      try {
        if (!window.recaptchaVerifier) {
          await initializeRecaptcha();
          return; // Will be called again after reCAPTCHA is solved
        }

        const verifier = window.recaptchaVerifier;
        const formattedPhone = userData.phone.startsWith('+') ? userData.phone : `+${userData.phone}`;
        
        const result = await signInWithPhoneNumber(auth, formattedPhone, verifier);
        setConfirmationResult(result);
        setStep('verificationCode');
        startTimer();
        setErrorMessage('');
      } catch (error) {
        console.error('Error sending SMS:', error);
        setErrorMessage('SMS-ის გაგზავნა ვერ მოხერხდა. გთხოვთ, სცადოთ თავიდან');
        
        // Reset reCAPTCHA on error
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }
        await initializeRecaptcha();
      }
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!userData.verification_code || userData.verification_code.length !== 6) {
      setErrorMessage('გთხოვთ შეიყვანოთ 6-ნიშნა კოდი');
      return;
    }

    setLoading(true);
    try {
      if (method === 'phone') {
        await confirmationResult.confirm(userData.verification_code);
      } else {
        const response = await fetch('/wp-json/bidspace/v1/verify-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            email: userData.email,
            code: userData.verification_code 
          })
        });
        if (!response.ok) throw new Error('Invalid code');
      }
      setStep('newPassword');
      if (timer) clearInterval(timer);
      setErrorMessage('');
    } catch (error) {
      console.error('Error verifying code:', error);
      setErrorMessage('არასწორი კოდი');
    }
    setLoading(false);
  };

  const updatePassword = async () => {
    if (!userData.password || !userData.password_confirm) {
      setErrorMessage('გთხოვთ შეიყვანოთ ახალი პაროლი');
      return;
    }

    if (userData.password.length < 8) {
      setErrorMessage('პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს');
      return;
    }

    if (userData.password !== userData.password_confirm) {
      setErrorMessage('პაროლები არ ემთხვევა');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/wp-json/bidspace/v1/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [method === 'email' ? 'email' : 'phone']: method === 'email' ? userData.email : userData.phone,
          code: userData.verification_code,
          new_password: userData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('პაროლი წარმატებით შეიცვალა');
        setIsPasswordReset(false);
      } else {
        setErrorMessage(data.message || 'პაროლის შეცვლა ვერ მოხერხდა');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setErrorMessage('დაფიქსირდა შეცდომა, სცადეთ თავიდან');
    }
    setLoading(false);
  };

  const renderMethodSelection = () => (
    <div className="flex flex-col gap-4">
      <h4 className="text-center text-gray-600">აირჩიეთ დადასტურების მეთოდი</h4>
      <div className="flex gap-4">
        <button
          onClick={() => setMethod('email')}
          className={`flex-1 p-4 rounded-full ${method === 'email' ? 'bg-black text-white' : 'border border-gray-600 text-gray-600'}`}
        >
          ელ-ფოსტა
        </button>
        <button
          onClick={() => setMethod('phone')}
          className={`flex-1 p-4 rounded-full ${method === 'phone' ? 'bg-black text-white' : 'border border-gray-600 text-gray-600'}`}
        >
          ტელეფონი
        </button>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 'initial':
        return (
          <>
            {renderMethodSelection()}
            <div className="flex flex-col gap-2.5">
              <label htmlFor={method === 'email' ? 'email' : 'phone'} className="text-sm text-gray-600">
                {method === 'email' ? 'ელ-ფოსტა' : 'ტელეფონის ნომერი'}
              </label>
              <input
                type={method === 'email' ? 'email' : 'tel'}
                id={method === 'email' ? 'email' : 'phone'}
                name={method === 'email' ? 'email' : 'phone'}
                value={method === 'email' ? userData.email : userData.phone}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-600 rounded-2xl"
                placeholder={method === 'email' ? 'შეიყვანეთ ელ-ფოსტა' : 'შეიყვანეთ ნომერი (+995)'}
                required
              />
            </div>
            {method === 'phone' && (
              <>
                <div className="mt-4 flex justify-center">
                  <div id="recaptcha-container" />
                </div>
                <button
                  type="button"
                  onClick={requestPasswordReset}
                  className="w-full text-sm bg-black text-white p-4 rounded-full hover:bg-gray-900 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'გთხოვთ მოიცადოთ...' : 'კოდის გაგზავნა'}
                </button>
              </>
            )}
            {method === 'email' && (
              <button
                type="button"
                onClick={requestPasswordReset}
                className="w-full text-sm bg-black text-white p-4 rounded-full hover:bg-gray-900 transition-colors"
                disabled={loading}
              >
                {loading ? 'გთხოვთ მოიცადოთ...' : 'პაროლის აღდგენის დაწყება'}
              </button>
            )}
          </>
        );

      case 'emailSent':
      case 'verificationCode':
        return (
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
                className="px-3 py-2 border border-gray-600 rounded-2xl"
                placeholder="შეიყვანეთ 6-ნიშნა კოდი"
                maxLength={6}
                required
              />
            </div>
            <button
              type="button"
              onClick={verifyCode}
              className="w-full text-sm bg-black text-white p-4 rounded-full hover:bg-gray-900 transition-colors"
              disabled={loading}
            >
              {loading ? 'გთხოვთ მოიცადოთ...' : 'კოდის დადასტურება'}
            </button>
            {timeLeft === 0 && (
              <button
                type="button"
                onClick={requestPasswordReset}
                className="w-full text-sm border border-gray-600 text-gray-600 p-4 rounded-full hover:bg-gray-50 transition-colors"
              >
                კოდის ხელახლა გაგზავნა
              </button>
            )}
          </>
        );

      case 'newPassword':
        return (
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
                minLength={8}
                required
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
                minLength={8}
                required
              />
            </div>
            <button
              type="button"
              onClick={updatePassword}
              className="w-full text-sm bg-black text-white p-4 rounded-full hover:bg-gray-900 transition-colors"
              disabled={loading}
            >
              {loading ? 'გთხოვთ მოიცადოთ...' : 'პაროლის შეცვლა'}
            </button>
          </>
        );
    }
  };

  return (
    <div className="px-9 pb-9 pt-12 flex flex-col gap-4">
      <button 
        onClick={() => setIsPasswordReset(false)} 
        className="absolute top-3 left-6 text-gray-500 hover:text-gray-700"
      >
        <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      <h3 className="text-xl font-semibold text-center">პაროლის აღდგენა</h3>
      {errorMessage && (
        <p className="text-sm text-red-500 text-center">{errorMessage}</p>
      )}
      
      <div className="flex flex-col gap-4">
        {renderStep()}
        {method === 'phone' && step === 'initial' && (
          <div className="mt-4">
            <div 
              id="recaptcha-container" 
              className="flex justify-center"
              style={{ transform: 'scale(0.9)' }}
            />
          </div>
        )}
        <hr className="my-4" />
        
        <button
          type="button"
          onClick={() => setIsPasswordReset(false)}
          className="font-bold hover:underline text-gray-800"
        >
          უკან დაბრუნება
        </button>
      </div>
    </div>
  );
};

export default PasswordResetForm;

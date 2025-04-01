import React, { useState, useEffect } from 'react';

const PasswordResetForm = ({ setIsPasswordReset }) => {
  const [step, setStep] = useState('initial'); // initial, emailSent, verificationCode, newPassword
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    password_confirm: '',
    verification_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [timer, setTimer] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

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
    setDebugInfo(null);
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
    setErrorMessage('');
    setDebugInfo(null);

    try {
      const response = await fetch('/wp-json/bidspace/v1/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: userData.email 
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'დაფიქსირდა შეცდომა');
      }

      if (data.debug_info) {
        setDebugInfo(data.debug_info);
      }

      setStep('emailSent');
      startTimer();
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setErrorMessage(error.message || 'დაფიქსირდა შეცდომა, სცადეთ თავიდან');
    }
    setLoading(false);
  };

  const verifyCode = async () => {
    if (!userData.verification_code || userData.verification_code.length !== 6) {
      setErrorMessage('გთხოვთ შეიყვანოთ 6-ნიშნა კოდი');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setDebugInfo(null);

    try {
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

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'არასწორი კოდი');
      }

      if (data.debug_info) {
        setDebugInfo(data.debug_info);
      }

      // Move to password step without resetting fields
      setStep('newPassword');
      if (timer) clearInterval(timer);
    } catch (error) {
      console.error('Error verifying code:', error);
      setErrorMessage(error.message || 'არასწორი კოდი');
    }
    setLoading(false);
  };

  const resetPassword = async () => {
    if (!userData.password) {
      setErrorMessage('გთხოვთ შეიყვანოთ ახალი პაროლი');
      return;
    }

    if (userData.password !== userData.password_confirm) {
      setErrorMessage('პაროლები არ ემთხვევა');
      return;
    }

    if (!userData.email || !userData.verification_code) {
      setErrorMessage('მონაცემები არასრულია, სცადეთ თავიდან');
      return;
    }

    // Log the full userData state
    console.log('Current userData state:', {
      email: userData.email,
      code: userData.verification_code,
      password: userData.password,
      password_confirm: userData.password_confirm
    });

    setLoading(true);
    setErrorMessage('');
    setDebugInfo(null);

    try {
      // Add a small delay to ensure all state updates are complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create FormData object
      const formData = new URLSearchParams();
      formData.append('email', userData.email);
      formData.append('code', userData.verification_code);
      formData.append('password', userData.password);
      
      console.log('Sending data to server:', formData.toString());

      const response = await fetch('/wp-json/bidspace/v1/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: formData
      });

      // Log raw response
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));

      const data = await response.json();
      console.log('Full server response:', {
        status: response.status,
        ok: response.ok,
        data: data
      });

      if (!response.ok) {
        if (data.data && data.data.debug) {
          setDebugInfo(data.data.debug);
          console.error('Debug info:', data.data.debug);
        }
        throw new Error(data.message || 'პაროლის შეცვლა ვერ მოხერხდა');
      }

      // If successful, show success message and close the form
      alert('პაროლი წარმატებით შეიცვალა');
      setIsPasswordReset(false);
    } catch (error) {
      console.error('Error resetting password:', error);
      setErrorMessage(error.message || 'პაროლის შეცვლა ვერ მოხერხდა');
    }
    setLoading(false);
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
      {debugInfo && (
        <div className="debug-info" style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
          Debug Info: {JSON.stringify(debugInfo)}
        </div>
      )}
      
      <div className="flex flex-col gap-4">
        {step === 'initial' && (
          <>
            <div className="flex flex-col gap-2.5">
              <label htmlFor="email" className="text-sm text-gray-600">
                ელ-ფოსტა
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-600 rounded-2xl"
                placeholder="შეიყვანეთ ელ-ფოსტა"
                required
              />
            </div>
            <button
              type="button"
              onClick={requestPasswordReset}
              className="w-full text-sm bg-black text-white p-4 rounded-full hover:bg-gray-900 transition-colors"
              disabled={loading}
            >
              {loading ? 'გთხოვთ მოიცადოთ...' : 'პაროლის აღდგენის დაწყება'}
            </button>
          </>
        )}

        {step === 'emailSent' && (
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
        )}

        {step === 'newPassword' && (
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
                minLength={6}
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
                minLength={6}
                required
              />
            </div>
            <button
              type="button"
              onClick={resetPassword}
              className="w-full text-sm bg-black text-white p-4 rounded-full hover:bg-gray-900 transition-colors"
              disabled={loading}
            >
              {loading ? 'გთხოვთ მოიცადოთ...' : 'პაროლის შეცვლა'}
            </button>
          </>
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

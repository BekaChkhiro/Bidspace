import React, { useState, useEffect } from 'react';
import { auth, initializeRecaptcha } from '../../../../lib/firebase';
import { PhoneAuthProvider, signInWithPhoneNumber } from 'firebase/auth';
import Toast from './Toast';

const RegistrationForm = ({ formData, handleInputChange, handleRegister, errorMessage, setIsRegistration }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [phoneVerificationStep, setPhoneVerificationStep] = useState('initial');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      // Cleanup reCAPTCHA on unmount
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, [resendTimer]);

  useEffect(() => {
    return () => {
      // Cleanup reCAPTCHA on component unmount
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear().catch(console.warn);
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const validateStep1 = () => {
    if (!formData.regEmail) {
      alert('გთხოვთ შეიყვანოთ ელ-ფოსტა');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.regEmail)) {
      alert('გთხოვთ შეიყვანოთ სწორი ელ-ფოსტის მისამართი');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.regPhone || !formData.regUsername || !formData.regPersonalNumber) {
      alert('გთხოვთ შეავსოთ ყველა ველი');
      return false;
    }
    const phoneRegex = /^5\d{8}$/;
    if (!phoneRegex.test(formData.regPhone)) {
      alert('გთხოვთ შეიყვანოთ სწორი ტელეფონის ნომერი (5XXXXXXXX)');
      return false;
    }
    if (!/^\d{11}$/.test(formData.regPersonalNumber)) {
      alert('პირადი ნომერი უნდა შედგებოდეს 11 ციფრისგან');
      return false;
    }
    return true;
  };

  const showToast = (message, type = 'error') => {
    setToastMessage(message);
    setToastType(type);
  };

  const handleSendVerificationCode = async (retryCount = 0) => {
    try {
      if (!formData.regPhone) {
        showToast('გთხოვთ შეიყვანოთ ტელეფონის ნომერი');
        return;
      }

      const phoneRegex = /^5\d{8}$/;
      if (!phoneRegex.test(formData.regPhone)) {
        showToast('გთხოვთ შეიყვანოთ სწორი ტელეფონის ნომერი (5XXXXXXXX)');
        return;
      }

      setLoading(true);
      setVerificationError('');

      // Format phone number with proper international format
      const phoneNumber = '+995' + formData.regPhone;
      console.log('Attempting to verify phone number:', phoneNumber);

      try {
        // Clean up any existing reCAPTCHA instances first
        if (window.recaptchaVerifier) {
          await window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }

        // Create a visible reCAPTCHA container for debugging
        const recaptchaContainer = document.createElement('div');
        recaptchaContainer.id = 'recaptcha-container';
        recaptchaContainer.style.position = 'fixed';
        recaptchaContainer.style.bottom = '10px';
        recaptchaContainer.style.right = '10px';
        document.body.appendChild(recaptchaContainer);

        console.log('Initializing reCAPTCHA...');
        const recaptchaVerifier = await initializeRecaptcha('recaptcha-container');
        if (!recaptchaVerifier) {
          throw new Error('reCAPTCHA ინიციალიზაცია ვერ მოხერხდა');
        }
        console.log('reCAPTCHA initialized successfully');

        // Wait for reCAPTCHA to be fully ready
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('Sending verification code...');
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
        
        if (!confirmationResult || !confirmationResult.verificationId) {
          console.error('Invalid confirmation result:', confirmationResult);
          throw new Error('Invalid confirmation result');
        }
        
        console.log('Verification code sent successfully');
        setVerificationId(confirmationResult.verificationId);
        setPhoneVerificationStep('sent');
        setVerificationError('');
        setResendTimer(60);
        showToast('ვერიფიკაციის კოდი გამოგზავნილია', 'success');

      } catch (error) {
        console.error('Error sending verification code:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
        
        // Check if we should retry
        if (retryCount < MAX_RETRIES && 
           (error.code === 'auth/network-request-failed' || 
            error.message?.includes('503') || 
            error.code === 'auth/error-code:-39' ||
            error.code === 'auth/invalid-verification-code' ||
            !error.code)) { // Also retry if no error code (might be network issue)
          
          const nextRetryDelay = RETRY_DELAY * Math.pow(2, retryCount);
          console.log(`Retrying SMS send in ${nextRetryDelay}ms... Attempt ${retryCount + 1} of ${MAX_RETRIES}`);
          
          // Clean up reCAPTCHA before retry
          if (window.recaptchaVerifier) {
            await window.recaptchaVerifier.clear().catch(console.warn);
            window.recaptchaVerifier = null;
          }
          
          setLoading(false);
          await new Promise(resolve => setTimeout(resolve, nextRetryDelay));
          return handleSendVerificationCode(retryCount + 1);
        }
        
        let errorMessage;
        switch (error.code) {
          case 'auth/invalid-phone-number':
            errorMessage = 'არასწორი ტელეფონის ნომერი';
            break;
          case 'auth/quota-exceeded':
            errorMessage = 'მოთხოვნების ლიმიტი ამოწურულია, სცადეთ მოგვიანებით';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'ძალიან ბევრი მოთხოვნა. გთხოვთ მოიცადოთ და სცადოთ მოგვიანებით';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'ქსელის შეცდომა. გთხოვთ შეამოწმოთ ინტერნეტ კავშირი';
            break;
          case 'auth/error-code:-39':
            errorMessage = 'Recaptcha-ს შეცდომა. გთხოვთ განაახლოთ გვერდი და სცადოთ თავიდან';
            break;
          default:
            errorMessage = 'ვერ მოხერხდა კოდის გაგზავნა. გთხოვთ, სცადოთ თავიდან';
        }
        
        showToast(errorMessage);
      } finally {
        // Clean up the reCAPTCHA container
        const recaptchaContainer = document.getElementById('recaptcha-container');
        if (recaptchaContainer) {
          recaptchaContainer.remove();
        }
      }
    } catch (error) {
      console.error('Verification process failed:', error);
      showToast('დაფიქსირდა შეცდომა. გთხოვთ, სცადოთ თავიდან');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      showToast('გთხოვთ შეიყვანოთ 6-ნიშნა კოდი');
      return;
    }

    setLoading(true);
    setVerificationError('');

    try {
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      await auth.signInWithCredential(credential);
      setIsPhoneVerified(true);
      setPhoneVerificationStep('verified');
      setVerificationError('');
      showToast('ნომერი წარმატებით დადასტურდა', 'success');
      handleNextStep();
    } catch (error) {
      console.error('Verification error:', error);
      let errorMessage;
      
      switch (error.code) {
        case 'auth/invalid-verification-code':
          errorMessage = 'არასწორი კოდი';
          break;
        case 'auth/code-expired':
          errorMessage = 'კოდის ვადა გავიდა. გთხოვთ მოითხოვოთ ახალი კოდი';
          setPhoneVerificationStep('initial');
          break;
        default:
          errorMessage = 'დადასტურების შეცდომა. გთხოვთ სცადოთ თავიდან';
      }
      
      showToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      if (!isPhoneVerified && phoneVerificationStep === 'initial') {
        handleSendVerificationCode();
        return;
      } else if (!isPhoneVerified && phoneVerificationStep === 'sent') {
        return;
      }
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const validateForm = (e) => {
    e.preventDefault();
    
    // Validation for required fields
    const requiredFields = {
      regFirstName: 'სახელი',
      regLastName: 'გვარი',
      regEmail: 'ელ-ფოსტა',
      regPhone: 'ტელეფონი',
      regUsername: 'მომხმარებლის სახელი',
      regPersonalNumber: 'პირადი ნომერი',
      regPassword: 'პაროლი',
      regConfirmPassword: 'პაროლის დადასტურება'
    };

    // Check required fields
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field]) {
        alert(`გთხოვთ შეავსოთ ${label}`);
        return;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.regEmail)) {
      alert('გთხოვთ შეიყვანოთ სწორი ელ-ფოსტის მისამართი');
      return;
    }

    // Phone validation (Georgian format)
    const phoneRegex = /^5\d{8}$/;
    if (!phoneRegex.test(formData.regPhone)) {
      alert('გთხოვთ შეიყვანოთ სწორი ტელეფონის ნომერი (5XXXXXXXX)');
      return;
    }

    // Personal number validation
    if (!/^\d{11}$/.test(formData.regPersonalNumber)) {
      alert('პირადი ნომერი უნდა შედგებოდეს 11 ციფრისგან');
      return;
    }

    // Password validation
    if (formData.regPassword.length < 8) {
      alert('პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს');
      return;
    }

    if (formData.regPassword !== formData.regConfirmPassword) {
      alert('პაროლები არ ემთხვევა');
      return;
    }

    // Terms agreement validation
    if (!formData.regTermsAgreed) {
      alert('გთხოვთ დაეთანხმოთ წესებსა და პირობებს');
      return;
    }

    // If all validations pass, proceed with registration
    handleRegister(e);
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center gap-2 mb-4">
      {[1, 2, 3].map(step => (
        <div
          key={step}
          className={`w-3 h-3 rounded-full ${
            currentStep === step ? 'bg-black' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="px-4 sm:px-9 pb-9 pt-12 flex flex-col gap-4">
      <Toast 
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage('')}
      />
      <button 
        onClick={() => setIsRegistration(false)} 
        className="absolute top-3 left-3 sm:left-6 text-gray-500 hover:text-gray-700"
      >
        <svg className="w-7 h-7 sm:w-9 sm:h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      <h3 className="text-lg sm:text-xl font-semibold text-center">რეგისტრაცია</h3>
      {errorMessage && (
        <p className="text-sm text-red-500 text-center">{errorMessage}</p>
      )}
      {renderStepIndicator()}
      
      <form onSubmit={validateForm} className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          {currentStep === 1 && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm text-gray-600">სახელი</label>
                <input
                  name="regFirstName"
                  type="text"
                  value={formData.regFirstName}
                  onChange={handleInputChange}
                  className="px-3 py-2 text-sm sm:text-base border border-gray-600 rounded-2xl"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm text-gray-600">გვარი</label>
                <input
                  name="regLastName"
                  type="text"
                  value={formData.regLastName}
                  onChange={handleInputChange}
                  className="px-3 py-2 text-sm sm:text-base border border-gray-600 rounded-2xl"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm text-gray-600">ელ-ფოსტა</label>
                <input
                  name="regEmail"
                  type="email"
                  value={formData.regEmail}
                  onChange={handleInputChange}
                  className="px-3 py-2 text-sm sm:text-base border border-gray-600 rounded-2xl"
                  required
                />
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm text-gray-600">ტელეფონი</label>
                <div className="flex gap-2">
                  <input
                    name="regPhone"
                    type="tel"
                    value={formData.regPhone}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-600 rounded-2xl"
                    placeholder="5XXXXXXXX"
                    required
                    disabled={loading || phoneVerificationStep === 'sent'}
                  />
                  {!isPhoneVerified && phoneVerificationStep === 'initial' && (
                    <button
                      type="button"
                      id="send-code-button"
                      onClick={handleSendVerificationCode}
                      className="px-4 py-2 bg-black text-white text-sm rounded-2xl disabled:bg-gray-400"
                      disabled={loading || !formData.regPhone || resendTimer > 0}
                    >
                      {loading ? 'იგზავნება...' : resendTimer > 0 ? `${resendTimer}წმ` : 'კოდის გაგზავნა'}
                    </button>
                  )}
                </div>
              </div>
              
              {phoneVerificationStep === 'sent' && !isPhoneVerified && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs sm:text-sm text-gray-600">შეიყვანეთ კოდი</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-600 rounded-2xl"
                      placeholder="XXXXXX"
                      maxLength={6}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      className="px-4 py-2 bg-black text-white text-sm rounded-2xl disabled:bg-gray-400"
                      disabled={loading || verificationCode.length !== 6}
                    >
                      {loading ? 'მოწმდება...' : 'დადასტურება'}
                    </button>
                  </div>
                  {verificationError && (
                    <p className="text-sm text-red-500">{verificationError}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    className="text-sm text-gray-600 underline mt-2 disabled:text-gray-400"
                    disabled={loading || resendTimer > 0}
                  >
                    {resendTimer > 0 ? `კოდის ხელახლა გაგზავნა შესაძლებელია ${resendTimer} წამში` : 'კოდის ხელახლა გაგზავნა'}
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm text-gray-600">მომხმარებლის სახელი</label>
                <input
                  name="regUsername"
                  type="text"
                  value={formData.regUsername}
                  onChange={handleInputChange}
                  className="px-3 py-2 text-sm sm:text-base border border-gray-600 rounded-2xl"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm text-gray-600">პირადი ნომერი</label>
                <input
                  name="regPersonalNumber"
                  type="text"
                  value={formData.regPersonalNumber}
                  onChange={handleInputChange}
                  className="px-3 py-2 text-sm sm:text-base border border-gray-600 rounded-2xl"
                  maxLength={11}
                  required
                />
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm text-gray-600">პაროლი</label>
                <input
                  name="regPassword"
                  type="password"
                  value={formData.regPassword}
                  onChange={handleInputChange}
                  className="px-3 py-2 text-sm sm:text-base border border-gray-600 rounded-2xl"
                  minLength={8}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm text-gray-600">გაიმეორეთ პაროლი</label>
                <input
                  name="regConfirmPassword"
                  type="password"
                  value={formData.regConfirmPassword}
                  onChange={handleInputChange}
                  className="px-3 py-2 text-sm sm:text-base border border-gray-600 rounded-2xl"
                  minLength={8}
                  required
                />
              </div>
              <div className="flex items-start gap-2 mt-2">
                <input
                  type="checkbox"
                  id="regTermsAgreed"
                  name="regTermsAgreed"
                  checked={formData.regTermsAgreed}
                  onChange={handleInputChange}
                  className="h-4 w-4 mt-1"
                  required
                />
                <label htmlFor="regTermsAgreed" className="text-xs sm:text-sm text-gray-600">
                  ვეთანხმები <a href="/terms" className="underline" target="_blank" rel="noopener noreferrer">წესებს და პირობებს</a>
                </label>
              </div>
            </>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-4">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="w-1/2 text-xs sm:text-sm border border-black text-black p-3 sm:p-4 rounded-full hover:bg-gray-100 transition-colors"
            >
              უკან
            </button>
          )}
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className={`${currentStep === 1 ? 'w-full' : 'w-1/2'} text-xs sm:text-sm bg-black text-white p-3 sm:p-4 rounded-full hover:bg-gray-900 transition-colors`}
              disabled={currentStep === 2 && !isPhoneVerified}
            >
              შემდეგი
            </button>
          ) : (
            <button
              type="submit"
              className="w-1/2 text-xs sm:text-sm bg-black text-white p-3 sm:p-4 rounded-full hover:bg-gray-900 transition-colors"
            >
              რეგისტრაცია
            </button>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-800">
            უკვე გაქვთ ანგარიში? {' '}
            <button 
              onClick={() => setIsRegistration(false)} 
              className="font-bold hover:underline"
              type="button"
            >
              შესვლა
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;

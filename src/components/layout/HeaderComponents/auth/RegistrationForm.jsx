import React, { useState } from 'react';
import Toast from './Toast';

const RegistrationForm = ({ formData, handleInputChange, handleRegister, errorMessage, setIsRegistration }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');

  const showToast = (message, type = 'error') => {
    setToastMessage(message);
    setToastType(type);
  };

  const validateStep1 = () => {
    if (!formData.regFirstName || !formData.regLastName || !formData.regEmail) {
      showToast('გთხოვთ შეავსოთ ყველა ველი');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.regEmail)) {
      showToast('გთხოვთ შეიყვანოთ სწორი ელ-ფოსტის მისამართი');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.regPhone || !formData.regUsername || !formData.regPersonalNumber) {
      showToast('გთხოვთ შეავსოთ ყველა ველი');
      return false;
    }
    const phoneRegex = /^5\d{8}$/;
    if (!phoneRegex.test(formData.regPhone)) {
      showToast('გთხოვთ შეიყვანოთ სწორი ტელეფონის ნომერი (5XXXXXXXX)');
      return false;
    }
    if (!/^\d{11}$/.test(formData.regPersonalNumber)) {
      showToast('პირადი ნომერი უნდა შედგებოდეს 11 ციფრისგან');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.regPassword || !formData.regConfirmPassword) {
      showToast('გთხოვთ შეავსოთ ყველა ველი');
      return false;
    }
    if (formData.regPassword.length < 8) {
      showToast('პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს');
      return false;
    }
    if (formData.regPassword !== formData.regConfirmPassword) {
      showToast('პაროლები არ ემთხვევა');
      return false;
    }
    if (!formData.regTermsAgreed) {
      showToast('გთხოვთ დაეთანხმოთ წესებსა და პირობებს');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep === 3 && validateStep3()) {
      handleRegister(e);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
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
      {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />}
      
      {errorMessage && (
        <p className="text-sm text-red-500 text-center">{errorMessage}</p>
      )}
      {renderStepIndicator()}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                <input
                  name="regPhone"
                  type="tel"
                  value={formData.regPhone}
                  onChange={handleInputChange}
                  className="px-3 py-2 text-sm sm:text-base border border-gray-600 rounded-2xl"
                  placeholder="5XXXXXXXX"
                  required
                />
              </div>
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

        <div className="flex gap-3 mt-4">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="w-1/2 text-xs sm:text-sm border border-black text-black p-3 sm:p-4 rounded-full hover:bg-gray-100 transition-colors"
            >
              უკან
            </button>
          )}
          <button
            type={currentStep === 3 ? 'submit' : 'button'}
            onClick={currentStep !== 3 ? handleNext : undefined}
            className={`${currentStep === 1 ? 'w-full' : 'w-1/2'} text-xs sm:text-sm bg-black text-white p-3 sm:p-4 rounded-full hover:bg-gray-900 transition-colors`}
          >
            {currentStep === 3 ? 'რეგისტრაცია' : 'შემდეგი'}
          </button>
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

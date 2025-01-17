import React, { useState } from 'react';

const RegistrationForm = ({ formData, handleInputChange, handleRegister, errorMessage, setIsRegistration }) => {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step validation functions
  const validateStep1 = () => {
    if (!formData.regFirstName || !formData.regLastName || !formData.regEmail) {
      alert('გთხოვთ შეავსოთ ყველა ველი');
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

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
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
    <div className="flex justify-center gap-2 mb-4 sm:hidden">
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
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 ${!window.matchMedia('(max-width: 640px)').matches ? '' : 'hidden sm:grid'}`}>
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
        </div>

        {/* Mobile stepped form */}
        <div className="sm:hidden">
          {currentStep === 1 && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-600">სახელი</label>
                <input
                  name="regFirstName"
                  type="text"
                  value={formData.regFirstName}
                  onChange={handleInputChange}
                  className="px-3 py-2 text-sm border border-gray-600 rounded-2xl"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-600">გვარი</label>
                <input
                  name="regLastName"
                  type="text"
                  value={formData.regLastName}
                  onChange={handleInputChange}
                  className="px-3 py-2 text-sm border border-gray-600 rounded-2xl"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-600">ელ-ფოსტა</label>
                <input
                  name="regEmail"
                  type="email"
                  value={formData.regEmail}
                  onChange={handleInputChange}
                  className="px-3 py-2 text-sm border border-gray-600 rounded-2xl"
                  required
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-600">ტელეფონი</label>
                <input
                  name="regPhone"
                  type="tel"
                  value={formData.regPhone}
                  onChange={handleInputChange}
                  className="px-3 py-2 text-sm border border-gray-600 rounded-2xl"
                  placeholder="5XXXXXXXX"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-600">მომხმარებლის სახელი</label>
                <input
                  name="regUsername"
                  type="text"
                  value={formData.regUsername}
                  onChange={handleInputChange}
                  className="px-3 py-2 text-sm border border-gray-600 rounded-2xl"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-600">პირადი ნომერი</label>
                <input
                  name="regPersonalNumber"
                  type="text"
                  value={formData.regPersonalNumber}
                  onChange={handleInputChange}
                  className="px-3 py-2 text-sm border border-gray-600 rounded-2xl"
                  maxLength={11}
                  required
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-600">პაროლი</label>
                <input
                  name="regPassword"
                  type="password"
                  value={formData.regPassword}
                  onChange={handleInputChange}
                  className="px-3 py-2 text-sm border border-gray-600 rounded-2xl"
                  minLength={8}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-600">გაიმეორეთ პაროლი</label>
                <input
                  name="regConfirmPassword"
                  type="password"
                  value={formData.regConfirmPassword}
                  onChange={handleInputChange}
                  className="px-3 py-2 text-sm border border-gray-600 rounded-2xl"
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
                <label htmlFor="regTermsAgreed" className="text-xs text-gray-600">
                  ვეთანხმები <a href="/terms" className="underline" target="_blank" rel="noopener noreferrer">წესებს და პირობებს</a>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Mobile navigation buttons */}
        <div className="flex gap-3 mt-4 sm:hidden">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="w-1/2 text-xs border border-black text-black p-3 rounded-full hover:bg-gray-100 transition-colors"
            >
              უკან
            </button>
          )}
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className={`${currentStep === 1 ? 'w-full' : 'w-1/2'} text-xs bg-black text-white p-3 rounded-full hover:bg-gray-900 transition-colors`}
            >
              შემდეგი
            </button>
          ) : (
            <button
              type="submit"
              className="w-1/2 text-xs bg-black text-white p-3 rounded-full hover:bg-gray-900 transition-colors"
            >
              რეგისტრაცია
            </button>
          )}
        </div>

        {/* Desktop submit button */}
        <button 
          type="submit" 
          className="hidden sm:block w-full text-sm bg-black text-white p-4 rounded-full hover:bg-gray-900 transition-colors mt-4"
        >
          რეგისტრაცია
        </button>

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

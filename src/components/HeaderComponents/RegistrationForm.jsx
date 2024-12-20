import React from 'react';

const RegistrationForm = ({ formData, handleInputChange, handleRegister, errorMessage, setIsRegistration }) => {
  return (
    <div className="px-9 pb-9 pt-12 flex flex-col gap-4">
      <button 
        onClick={() => setIsRegistration(false)} 
        className="absolute top-3 left-6 text-gray-500 hover:text-gray-700"
      >
        <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      <h3 className="text-xl font-semibold text-center">რეგისტრაცია</h3>
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">სახელი</label>
            <input
              name="regFirstName"
              type="text"
              value={formData.regFirstName}
              onChange={handleInputChange}
              className="px-3 py-2 border border-gray-600 rounded-2xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">გვარი</label>
            <input
              name="regLastName"
              type="text"
              value={formData.regLastName}
              onChange={handleInputChange}
              className="px-3 py-2 border border-gray-600 rounded-2xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">ელ-ფოსტა</label>
            <input
              name="regEmail"
              type="email"
              value={formData.regEmail}
              onChange={handleInputChange}
              className="px-3 py-2 border border-gray-600 rounded-2xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">ტელეფონი</label>
            <input
              name="regPhone"
              type="tel"
              value={formData.regPhone}
              onChange={handleInputChange}
              className="px-3 py-2 border border-gray-600 rounded-2xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">მომხმარებლის სახელი</label>
            <input
              name="regUsername"
              type="text"
              value={formData.regUsername}
              onChange={handleInputChange}
              className="px-3 py-2 border border-gray-600 rounded-2xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">პირადი ნომერი</label>
            <input
              name="regPersonalNumber"
              type="text"
              value={formData.regPersonalNumber}
              onChange={handleInputChange}
              className="px-3 py-2 border border-gray-600 rounded-2xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">პაროლი</label>
            <input
              name="regPassword"
              type="password"
              value={formData.regPassword}
              onChange={handleInputChange}
              className="px-3 py-2 border border-gray-600 rounded-2xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">გაიმეორეთ პაროლი</label>
            <input
              name="regConfirmPassword"
              type="password"
              value={formData.regConfirmPassword}
              onChange={handleInputChange}
              className="px-3 py-2 border border-gray-600 rounded-2xl"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="regTermsAgreed"
            name="regTermsAgreed"
            checked={formData.regTermsAgreed}
            onChange={handleInputChange}
            className="h-4 w-4"
          />
          <label htmlFor="regTermsAgreed" className="text-sm text-gray-600">
            ვეთანხმები წესებს და პირობებს
          </label>
        </div>

        <button 
          type="submit" 
          className="w-full text-sm bg-black text-white p-4 rounded-full hover:bg-gray-900 transition-colors mt-4"
        >
          რეგისტრაცია
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-800">
            უკვე გაქვს ანგარიში? {' '}
            <button 
              onClick={() => setIsRegistration(false)} 
              className="font-bold hover:underline"
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

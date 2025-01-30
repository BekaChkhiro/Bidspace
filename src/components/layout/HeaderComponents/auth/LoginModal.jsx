import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';
import PasswordResetForm from './PasswordResetForm';

const LoginModal = ({ isOpen, onClose }) => {
  const [isRegistration, setIsRegistration] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    regFirstName: '',
    regLastName: '',
    regEmail: '',
    regPhone: '',
    regUsername: '',
    regPersonalNumber: '',
    regPassword: '',
    regConfirmPassword: '',
    regTermsAgreed: false,
    verificationCode: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [verificationError, setVerificationError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.username || !formData.password) {
      setErrorMessage('გთხოვთ შეავსოთ ყველა ველი');
      return;
    }

    try {
      const response = await fetch('/wp-json/custom/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        window.location.reload();
      } else {
        setErrorMessage(data.message || 'ავტორიზაცია ვერ მოხერხდა');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('დაფიქსირდა შეცდომა, სცადეთ თავიდან');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
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

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field]) {
        alert(`გთხოვთ შეავსოთ ${label}`);
        return;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.regEmail)) {
      alert('გთხოვთ შეიყვანოთ სწორი ელ-ფოსტის მისამართი');
      return;
    }

    const phoneRegex = /^5\d{8}$/;
    if (!phoneRegex.test(formData.regPhone)) {
      alert('გთხოვთ შეიყვანოთ სწორი ტელეფონის ნომერი');
      return;
    }

    if (!/^\d{11}$/.test(formData.regPersonalNumber)) {
      alert('პირადი ნომერი უნდა შედგებოდეს 11 ციფრისგან');
      return;
    }

    if (formData.regPassword.length < 8) {
      alert('პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს');
      return;
    }

    if (formData.regPassword !== formData.regConfirmPassword) {
      alert('პაროლები არ ემთხვევა');
      return;
    }

    if (!formData.regTermsAgreed) {
      alert('გთხოვთ დაეთანხმოთ წესებსა და პირობებს');
      return;
    }

    try {
      const response = await fetch('/wp-json/custom/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.regUsername,
          email: formData.regEmail,
          password: formData.regPassword,
          firstName: formData.regFirstName,
          lastName: formData.regLastName,
          phone: formData.regPhone,
          personalNumber: formData.regPersonalNumber
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowVerification(true);
      } else {
        alert(data.message || 'რეგისტრაცია ვერ მოხერხდა');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('დაფიქსირდა შეცდომა, სცადეთ თავიდან');
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/wp-json/custom/v1/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.regEmail,
          code: formData.verificationCode
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('ვერიფიკაცია წარმატებით დასრულდა');
        onClose();
        window.location.reload();
      } else {
        setVerificationError(data.message || 'ვერიფიკაცია ვერ მოხერხდა');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationError('დაფიქსირდა შეცდომა, სცადეთ თავიდან');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-white rounded-3xl w-full max-w-xl overflow-y-auto" 
           style={{ maxHeight: 'calc(100vh - 2rem)' }}>
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 z-50"
        >
          <svg className="w-7 h-7 sm:w-9 sm:h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {isPasswordReset ? (
          <PasswordResetForm setIsPasswordReset={setIsPasswordReset} />
        ) : !isRegistration ? (
          <LoginForm 
            formData={formData}
            handleInputChange={handleInputChange}
            handleLogin={handleLogin}
            errorMessage={errorMessage}
            setIsRegistration={setIsRegistration}
            setIsPasswordReset={setIsPasswordReset}
          />
        ) : !showVerification ? (
          <RegistrationForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleRegister={handleRegister}
            errorMessage={errorMessage}
            setIsRegistration={setIsRegistration}
          />
        ) : (
          <div className="px-4 sm:px-9 pb-9 pt-12 flex flex-col gap-4">
            <h3 className="text-lg sm:text-xl font-semibold text-center">დაადასტურე კოდი</h3>
            <p className="text-xs sm:text-sm text-center">შეიყვანე ელ-ფოსტაზე გამოგზავნილი 6-ციფრიანი კოდი:</p>
            
            <form onSubmit={handleVerification} className="flex flex-col items-center gap-4">
              <input
                name="verificationCode"
                type="text"
                value={formData.verificationCode}
                onChange={handleInputChange}
                maxLength={6}
                className="px-3 py-2 border border-gray-600 rounded-2xl w-36 sm:w-48 text-center text-xl sm:text-2xl tracking-wider"
                placeholder="000000"
              />
              
              {verificationError && (
                <div className="text-red-500 text-xs sm:text-sm">{verificationError}</div>
              )}
              <button 
                type="submit" 
                className="w-full bg-black text-white p-3 sm:p-4 text-xs sm:text-sm rounded-full hover:bg-gray-900 transition-colors"
              >
                დადასტურება
              </button>
              
              <p className="text-xs sm:text-sm text-gray-600 text-center mt-4">
                არ მიგიღიათ კოდი? {' '}
                <button 
                  type="button"
                  onClick={() => handleRegister()}
                  className="font-bold hover:underline"
                >
                  ხელახლა გაგზავნა
                </button>
              </p>
              
              <button
                type="button"
                onClick={() => {
                  setShowVerification(false);
                  setVerificationError('');
                }}
                className="text-xs sm:text-sm text-gray-600 hover:underline mt-2"
              >
                უკან დაბრუნება
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
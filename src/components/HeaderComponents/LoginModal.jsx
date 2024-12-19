import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';
import PasswordResetForm from './PasswordResetForm';

const LoginModal = ({ isOpen, onClose }) => {
  const [isRegistration, setIsRegistration] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    regEmail: '',
    phone: '',
    piradi_nomeri: '',
    regPassword: '',
    regConfirmPassword: '',
    terms: false,
    verificationCode: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [registrationError, setRegistrationError] = useState('');

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
    setRegistrationError('');
    console.log('Starting registration validation...');

    const validationErrors = [];
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.regEmail || !emailRegex.test(formData.regEmail)) {
      validationErrors.push('გთხოვთ შეიყვანოთ სწორი ელ-ფოსტა');
    }

    // Password validation
    if (!formData.regPassword || formData.regPassword.length < 8) {
      validationErrors.push('პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს');
    }

    // Password confirmation validation
    if (formData.regPassword !== formData.regConfirmPassword) {
      validationErrors.push('პაროლები არ ემთხვევა');
    }

    // Phone number validation
    const phoneRegex = /^[0-9]{9}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      validationErrors.push('გთხოვთ შეიყვანოთ სწორი ტელეფონის ნომერი (9 ციფრი)');
    }

    // Personal number validation
    const personalNumberRegex = /^[0-9]{11}$/;
    if (!formData.piradi_nomeri || !personalNumberRegex.test(formData.piradi_nomeri)) {
      validationErrors.push('გთხოვთ შეიყვანოთ სწორი პირადი ნომერი (11 ციფრი)');
    }

    // Terms validation
    if (!formData.terms) {
      validationErrors.push('გთხოვთ დაეთანხმოთ წესებს და პირობებს');
    }

    console.log('Validation errors:', validationErrors);

    if (validationErrors.length > 0) {
      setRegistrationError(validationErrors.join(', '));
      return;
    }

    try {
      console.log('Sending registration request...');
      console.log('Registration data:', {
        email: formData.regEmail,
        password: formData.regPassword,
        phone_number: formData.phone,
        piradi_nomeri: formData.piradi_nomeri
      });

      const response = await fetch('/wp-json/custom/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.regEmail,
          password: formData.regPassword,
          phone_number: formData.phone,
          piradi_nomeri: formData.piradi_nomeri
        })
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        console.error('Registration failed:', responseText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = JSON.parse(responseText);
      console.log('Parsed response:', data);

      if (data.success) {
        console.log('Registration successful');
        setShowVerification(true);
      } else {
        console.log('Registration failed:', data.message);
        setRegistrationError(data.message || 'რეგისტრაცია ვერ მოხერხდა');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationError('დაფიქსირდა შეცდომა, სცადეთ თავიდან');
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setVerificationError('');
    console.log('Starting verification...');

    // Validate verification code format
    const codeRegex = /^\d{6}$/;
    if (!codeRegex.test(formData.verificationCode)) {
      console.log('Invalid verification code format');
      setVerificationError('კოდი უნდა შედგებოდეს 6 ციფრისგან');
      return;
    }

    try {
      console.log('Sending verification request...');
      console.log('Verification data:', {
        email: formData.regEmail,
        code: formData.verificationCode
      });

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

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        console.error('Verification failed:', responseText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = JSON.parse(responseText);
      console.log('Parsed response:', data);

      if (data.success) {
        console.log('Verification successful');
        alert('ვერიფიკაცია წარმატებით დასრულდა');
        onClose();
        window.location.reload();
      } else {
        console.log('Verification failed:', data.message);
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
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-white rounded-3xl w-full max-w-xl mx-4 my-8 overflow-y-auto" 
           style={{ maxHeight: 'calc(100vh - 4rem)' }}>
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-50"
        >
          <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {!isRegistration && !isPasswordReset ? (
          <LoginForm 
            formData={formData}
            handleInputChange={handleInputChange}
            handleLogin={handleLogin}
            errorMessage={errorMessage}
            setIsRegistration={setIsRegistration}
            setIsPasswordReset={setIsPasswordReset}
          />
        ) : isRegistration ? (
          <RegistrationForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleRegister={handleRegister}
            errorMessage={registrationError}
            setIsRegistration={setIsRegistration}
          />
        ) : (
          <PasswordResetForm
            formData={formData}
            handleInputChange={handleInputChange}
            setIsPasswordReset={setIsPasswordReset}
          />
        )}
      </div>
    </div>
  );
};

export default LoginModal;
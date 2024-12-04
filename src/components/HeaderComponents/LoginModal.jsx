import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginModal = ({ isOpen, onClose }) => {
  const [isRegistration, setIsRegistration] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
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

        {!isRegistration ? (
          <div className="px-9 pb-9 pt-12 flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-center">ავტორიზაცია</h3>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2.5">
                <label htmlFor="username" className="text-sm text-gray-600">ელ-ფოსტა</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-600 rounded-2xl"
                />
              </div>

              <div className="flex flex-col gap-2.5">
                <label htmlFor="password" className="text-sm text-gray-600">პაროლი</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-600 rounded-2xl"
                />
              </div>

              {errorMessage && (
                <div className="text-red-500 text-sm text-center">
                  {errorMessage}
                </div>
              )}

              <div className="flex justify-end">
                <Link to="/wp-login.php?action=lostpassword" className="text-sm text-black hover:underline">
                  დაგავიწყდა პაროლი?
                </Link>
              </div>

              <button 
                type="submit" 
                className="w-full text-sm bg-black text-white p-4 rounded-full hover:bg-gray-900 transition-colors"
              >
                შესვლა
              </button>
            </form>

            <hr className="my-4" />

            <div className="text-center">
              <p className="text-sm text-gray-800">
                არ გაქვს ანგარიში? {' '}
                <button 
                  onClick={() => setIsRegistration(true)} 
                  className="font-bold hover:underline"
                >
                  დარეგისტრირდი
                </button>
              </p>
            </div>
          </div>
        ) : !showVerification ? (
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
        ) : (
          <div className="px-9 pb-9 pt-12 flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-center">დაადასტურე კოდი</h3>
            <p className="text-center">შეიყვანე ელ-ფოსტაზე გამოგზავნილი 6-ციფრიანი კოდი:</p>
            
            <form onSubmit={handleVerification} className="flex flex-col items-center gap-4">
              <input
                name="verificationCode"
                type="text"
                value={formData.verificationCode}
                onChange={handleInputChange}
                maxLength={6}
                className="px-3 py-2 border border-gray-600 rounded-2xl w-48 text-center text-2xl tracking-wider"
                placeholder="000000"
              />
              
              {verificationError && (
                <div className="text-red-500 text-sm">{verificationError}</div>
              )}<button 
              type="submit" 
              className="w-full bg-black text-white p-4 rounded-full hover:bg-gray-900 transition-colors"
            >
              დადასტურება
            </button>
            
            <p className="text-sm text-gray-600 text-center mt-4">
              არ მიგიღია კოდი? {' '}
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
              className="text-sm text-gray-600 hover:underline mt-2"
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
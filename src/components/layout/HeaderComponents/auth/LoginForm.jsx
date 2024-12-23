import React from 'react';
import { Link } from 'react-router-dom';

const LoginForm = ({ formData, handleInputChange, handleLogin, errorMessage, setIsRegistration }) => {
  return (
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
  );
};

export default LoginForm;

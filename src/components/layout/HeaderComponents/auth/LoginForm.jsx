import React from 'react';

const LoginForm = ({ formData, handleInputChange, handleLogin, errorMessage, setIsRegistration, setIsPasswordReset }) => {
  const handlePasswordResetClick = (e) => {
    e.preventDefault();
    setIsPasswordReset(true);
  };

  return (
    <div className="px-9 pb-9 pt-12 flex flex-col gap-4">
      <h3 className="text-xl font-semibold text-center">ავტორიზაცია</h3>
      {errorMessage && (
        <p className="text-sm text-red-500 text-center">{errorMessage}</p>
      )}
      
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2.5">
          <label htmlFor="username" className="text-sm text-gray-600">
            მომხმარებლის სახელი
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="px-3 py-2 border border-gray-600 rounded-2xl"
            required
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <label htmlFor="password" className="text-sm text-gray-600">
            პაროლი
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="px-3 py-2 border border-gray-600 rounded-2xl"
            required
          />
        </div>

        <div className="flex justify-end">
        <button
          type="button"
          onClick={handlePasswordResetClick}
          className="text-sm text-gray-600 hover:underline"
        >
          დაგავიწყდა პაროლი?
        </button>
        </div>


        <button 
          type="submit"
          className="w-full text-sm bg-black text-white p-4 rounded-full hover:bg-gray-900 transition-colors"
        >
          შესვლა
        </button>

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
      </form>
    </div>
  );
};

export default LoginForm;

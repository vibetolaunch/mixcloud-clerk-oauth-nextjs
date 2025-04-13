import React from 'react';
import { mixcloudAuthUrl } from '@/utils/mixcloudHelper';

const SignInPage = () => {
  const handleSignIn = () => {
    window.location.href = mixcloudAuthUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white p-10 rounded-2xl shadow-lg text-center max-w-md w-full">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Welcome</h1>
        <button
          onClick={handleSignIn}
          className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-lg font-medium transition duration-300"
        >
          Sign in with Mixcloud
        </button>
      </div>
    </div>
  );
};

export default SignInPage;

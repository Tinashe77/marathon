// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png'; // Replace with Econet logo
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error in component:', err);
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Background Image/Branding */}
      <div className="hidden md:flex md:w-1/2 bg-primary-600 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Econet Marathon" className="h-12 w-auto" />
          <span className="text-white text-2xl font-bold">Econet Marathon</span>
        </div>
        <div className="text-white">
          <h2 className="text-3xl font-bold mb-4">Welcome to Victoria Falls Marathon Admin Portal</h2>
          <p className="text-primary-100">
            Manage your runners, routes, races and communications all in one place.
          </p>
        </div>
        <div className="text-primary-200 text-sm">
          © {new Date().getFullYear()} Econet Wireless. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Econet Marathon" className="h-12 w-auto" />
              <span className="text-primary-600 text-2xl font-bold">Econet Marathon</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 text-center">
                Sign in to Admin Dashboard
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Enter your credentials to access your account
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 flex items-center gap-2">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-150"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-150"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
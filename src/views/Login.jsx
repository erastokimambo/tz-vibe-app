import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Login() {
  const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'phone'
  const [isLogin, setIsLogin] = useState(true);
  
  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Phone state
  const [phoneNumber, setPhoneNumber] = useState('+255');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuthResult = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    // Create profile if it's the first time signing in via Google or Email
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName || 'New User',
        email: user.email,
        createdAt: new Date().toISOString(),
        savedListings: [],
        isAdmin: false
      });
    }
    navigate('/'); // Route back to explore page after login
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleAuthResult(result.user);
    } catch (err) {
      console.error(err);
      setError('Failed to login with Google.');
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await signInWithEmailAndPassword(auth, email, password);
      } else {
        result = await createUserWithEmailAndPassword(auth, email, password);
      }
      await handleAuthResult(result.user);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved
        }
      });
    }
  };

  const handleSendSms = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    // Simple validation
    if (!phoneNumber.startsWith('+')) {
      setError('Please include country code, e.g. +255');
      setLoading(false);
      return;
    }

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
      
      // Reset recaptcha if error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await confirmationResult.confirm(verificationCode);
      await handleAuthResult(result.user);
    } catch (err) {
      console.error(err);
      setError('Invalid verification code.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#38000A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#CD1C18] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#CD1C18] to-[#9B1313] flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-[#CD1C18]/30 mb-6 mt-8">
          Tv
        </div>
        <h2 className="mt-6 text-center text-3xl font-black tracking-tight text-gray-900 dark:text-white">
          {authMethod === 'email' 
            ? (isLogin ? 'Sign in to TzVibe' : 'Create your account') 
            : 'Continue with Phone'}
        </h2>
        
        {authMethod === 'email' && (
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-[#CD1C18] hover:text-[#9B1313]">
              {isLogin ? 'start your free account' : 'sign in to your existing account'}
            </button>
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-[#4a0d13] py-8 px-6 shadow-2xl sm:rounded-3xl sm:px-10 border border-gray-100 dark:border-[#5e1a20]">
          
          {/* Main Auth Form Container */}
          <div className="mb-6">
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-medium text-center">
                {error}
              </div>
            )}
            
            {/* Auth Method Tabs */}
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
              <button
                onClick={() => setAuthMethod('email')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${authMethod === 'email' ? 'bg-white dark:bg-[#38000A] text-gray-900 dark:text-white shadow' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Email
              </button>
              <button
                onClick={() => setAuthMethod('phone')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${authMethod === 'phone' ? 'bg-white dark:bg-[#38000A] text-gray-900 dark:text-white shadow' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Phone
              </button>
            </div>

            {/* Email Form */}
            {authMethod === 'email' && (
              <form className="space-y-6" onSubmit={handleEmailSubmit}>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#CD1C18] focus:border-[#CD1C18] dark:bg-gray-800 dark:text-white sm:text-sm font-medium"
                    placeholder="vibes@tzvibe.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#CD1C18] focus:border-[#CD1C18] dark:bg-gray-800 dark:text-white sm:text-sm font-medium"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#CD1C18] hover:bg-[#9B1313] focus:outline-none transition-all hover:scale-[1.02] disabled:opacity-70"
                >
                  {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Create account')}
                </button>
              </form>
            )}

            {/* Phone Form */}
            {authMethod === 'phone' && (
              <div className="space-y-6">
                {!confirmationResult ? (
                  <form onSubmit={handleSendSms} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#CD1C18] focus:border-[#CD1C18] dark:bg-gray-800 dark:text-white sm:text-sm font-medium"
                        placeholder="+255 7XX XXX XXX"
                      />
                      <p className="mt-2 text-xs text-gray-500">Must include country code (e.g., +255)</p>
                    </div>
                    
                    <button
                      type="submit"
                      id="sign-in-button"
                      disabled={loading || !phoneNumber}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-black dark:bg-gray-700 hover:bg-gray-800 focus:outline-none transition-all hover:scale-[1.02] disabled:opacity-70"
                    >
                      {loading ? 'Sending SMS...' : 'Send Verification Code'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyCode} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        required
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="appearance-none block w-full text-center tracking-widest text-2xl px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#CD1C18] focus:border-[#CD1C18] dark:bg-gray-800 dark:text-white font-bold"
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || verificationCode.length < 6}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#CD1C18] hover:bg-[#9B1313] focus:outline-none transition-all hover:scale-[1.02] disabled:opacity-70"
                    >
                      {loading ? 'Verifying...' : 'Confirm Code'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                         setConfirmationResult(null);
                         setVerificationCode('');
                      }}
                      className="w-full text-sm mt-3 font-bold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition"
                    >
                      Use a different phone number
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-[#4a0d13] text-gray-500 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm text-sm font-bold text-gray-700 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-all hover:scale-[1.02]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Invisible Recaptcha target */}
      <div id="recaptcha-container"></div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ShieldAlert, ArrowRight } from 'lucide-react';
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  const generateCaptcha = () => {
    setCaptchaNum1(Math.floor(Math.random() * 9) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 9) + 1);
    setCaptchaAnswer('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // Google OAuth
  useEffect(() => {
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return;
    const loadGoogleSDK = () => {
      if (window.google?.accounts) { initGoogleButton(); return; }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogleButton;
      document.head.appendChild(script);
    };
    const initGoogleButton = () => {
      if (!googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
        ux_mode: 'popup',
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline', size: 'large', shape: 'rectangular', text: 'signup_with', width: '400',
      });
    };
    loadGoogleSDK();
  }, []);

  const handleGoogleCallback = async ({ credential }) => {
    setLoading(true);
    try {
      await googleLogin(credential);
      toast.success('Registered with Google!');
      navigate('/setup');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-up failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('Please fill in all credentials');
    }
    const total = captchaNum1 + captchaNum2;
    if (parseInt(captchaAnswer, 10) !== total) {
      toast.error('Incorrect CAPTCHA answer. Please try again.');
      generateCaptcha();
      return;
    }

    setLoading(true);
    try {
      await register({ email, password, role });
      toast.success('Registration successful!');
      navigate('/setup');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
      generateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface border border-border p-8 rounded-2xl shadow-xl glass"
      >
        <div className="flex-col-center gap-1 mb-6">
          <h2 className="text-2xl font-extrabold text-text">Create Account</h2>
          <p className="text-sm text-text-muted">Start finding compatible roommates</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Role selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-muted tracking-wider uppercase">I want to register as a:</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className={`btn py-2.5 flex-center gap-2 border ${role === 'student' ? 'btn-primary border-emerald-500' : 'btn-secondary border-border'}`}
                onClick={() => setRole('student')}
              >
                <User size={16} /> Student
              </button>
              <button
                type="button"
                className={`btn py-2.5 flex-center gap-2 border ${role === 'owner' ? 'btn-primary border-emerald-500' : 'btn-secondary border-border'}`}
                onClick={() => setRole('owner')}
              >
                <User size={16} /> House Owner
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-muted tracking-wider uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-text-muted" size={18} />
              <input
                type="email"
                placeholder={role === 'student' ? 'you@college.edu' : 'owner@gmail.com'}
                className="input pl-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {role === 'student' && (
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                💡 Use your college email (.ac.in / .edu) for instant verification. Manual ID verification also available in Settings.
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-muted tracking-wider uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-text-muted" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                className="input pl-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Math CAPTCHA */}
          <div className="flex flex-col gap-1.5 bg-surface-2 p-3.5 rounded-xl border border-border">
            <div className="flex-between">
              <label className="text-xs font-bold text-text flex items-center gap-1">
                <ShieldAlert size={14} className="text-emerald-500" /> Human Check
              </label>
              <span className="text-xs font-extrabold text-emerald-600">
                {captchaNum1} + {captchaNum2} = ?
              </span>
            </div>
            <input
              type="number"
              placeholder="Enter result"
              className="input mt-1.5 text-center font-bold"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3 flex items-center justify-center gap-2 mt-2 shadow-lg"
          >
            {loading ? 'Creating Account...' : 'Sign Up'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-xs font-bold text-text-muted uppercase tracking-wider">Or Register with</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <button
          id="google-register-btn"
          onClick={() => {
            if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
              toast.error('Google sign-in not configured. Use email/password.');
              return;
            }
            window.google?.accounts?.id?.prompt();
          }}
          className="btn btn-secondary w-full py-3 flex items-center justify-center gap-2"
        >
          {import.meta.env.VITE_GOOGLE_CLIENT_ID
            ? <div ref={googleBtnRef} className="w-full flex justify-center" />
            : <><GoogleIcon /> Google Account</>
          }
        </button>

        <p className="text-center text-sm text-text-muted mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Login here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import AuthLayout from './AuthLayout';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Simple validation
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return;
    }
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onLogin({ email, name: email.split('@')[0] });
      setIsLoading(false);
      navigate('/patient-form');
    }, 1500);
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Enter your credentials to access your account"
    >
      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 ml-1" htmlFor="email">
            Email Address
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className={`w-full pl-12 pr-4 py-3 bg-slate-50 border ${errors.email ? 'border-red-300 ring-red-50' : 'border-slate-200 group-focus-within:border-sky-400 group-focus-within:ring-4 group-focus-within:ring-sky-50'} rounded-xl outline-none transition-all`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="password">
              Password
            </label>
            <Link to="#" className="text-xs font-semibold text-sky-600 hover:text-sky-700">
              Forgot password?
            </Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className={`w-full pl-12 pr-4 py-3 bg-slate-50 border ${errors.password ? 'border-red-300 ring-red-50' : 'border-slate-200 group-focus-within:border-sky-400 group-focus-within:ring-4 group-focus-within:ring-sky-50'} rounded-xl outline-none transition-all`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-slate-400 font-medium tracking-wider">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-slate-700"
        >
          Google
        </button>
      </form>

      <p className="mt-8 text-center text-slate-500 font-medium">
        Don't have an account?{' '}
        <Link to="/signup" className="text-sky-600 hover:text-sky-700 font-bold underline decoration-sky-200 underline-offset-4 decoration-2">
          Create one now
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;

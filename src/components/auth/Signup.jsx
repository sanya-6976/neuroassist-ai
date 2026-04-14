import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import AuthLayout from './AuthLayout';

const Signup = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Simple validation
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onLogin({ email: formData.email, name: formData.name });
      setIsLoading(false);
      navigate('/patient-form');
    }, 1500);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <AuthLayout 
      title="Start your journey" 
      subtitle="Join thousands of others on the path to recovery"
    >
      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 ml-1" htmlFor="name">
            Full Name
          </label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              className={`w-full pl-12 pr-4 py-3 bg-slate-50 border ${errors.name ? 'border-red-300 ring-red-50' : 'border-slate-200 group-focus-within:border-emerald-400 group-focus-within:ring-4 group-focus-within:ring-emerald-50'} rounded-xl outline-none transition-all`}
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 ml-1" htmlFor="email">
            Email Address
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className={`w-full pl-12 pr-4 py-3 bg-slate-50 border ${errors.email ? 'border-red-300 ring-red-50' : 'border-slate-200 group-focus-within:border-emerald-400 group-focus-within:ring-4 group-focus-within:ring-emerald-50'} rounded-xl outline-none transition-all`}
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 ml-1" htmlFor="password">
            Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className={`w-full pl-12 pr-4 py-3 bg-slate-50 border ${errors.password ? 'border-red-300 ring-red-50' : 'border-slate-200 group-focus-within:border-emerald-400 group-focus-within:ring-4 group-focus-within:ring-emerald-50'} rounded-xl outline-none transition-all`}
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 mt-4"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Create Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-slate-500 font-medium">
        Already have an account?{' '}
        <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-bold underline decoration-emerald-200 underline-offset-4 decoration-2">
          Sign in instead
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Signup;

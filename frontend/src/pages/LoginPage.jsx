import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, formatApiErrorDetail } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // 🔹 handle change (clean)
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (loading) return;
  setLoading(true);

  try {
    await login({
      email: formData.email,
      password: formData.password,
    });

    toast.success('Welcome back!');
    navigate('/dashboard', { replace: true });

  } catch (error) {
    const errorMsg =
      formatApiErrorDetail(error?.response?.data?.detail) ||
      error?.response?.data?.message ||
      error.message ||
      'Login failed';

    toast.error(errorMsg);

  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* 🔹 Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to continue your journey
          </p>
        </div>

        {/* 🔹 Card */}
        <div className="bg-card p-8 rounded-xl border border-border shadow-sm">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            data-testid="login-form"
          >
            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1"
                placeholder="you@example.com"
                data-testid="login-email-input"
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1"
                placeholder="••••••••"
                data-testid="login-password-input"
              />
            </div>

            {/* Button */}
            <Button
              type="submit"
              className="w-full rounded-full bg-primary hover:bg-[#153425]"
              disabled={loading}
              data-testid="login-submit-btn"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Register link */}
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary hover:underline"
                data-testid="login-register-link"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Back */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground"
            data-testid="back-home-link"
          >
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
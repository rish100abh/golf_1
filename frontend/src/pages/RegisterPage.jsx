import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, formatApiErrorDetail } from '../context/AuthContext';
import api from '../utils/api';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { toast } from 'sonner';
import { motion } from 'framer-motion';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [loading, setLoading] = useState(false);
  const [charities, setCharities] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    charity_id: '',
    charity_percentage: 10,
  });

  // 🔹 fetch charities
  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const { data } = await api.get('/charities');
        setCharities(data || []);
      } catch (error) {
        console.error('Failed to fetch charities:', error);
      }
    };
    fetchCharities();
  }, []);

  useEffect(() => {
  console.log('Charities loaded:', charities.length);
}, [charities]);

  // 🔹 handle change
  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]:
        id === 'charity_percentage'
          ? Number(value) || 10
          : value,
    }));
  };

  // 🔹 submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;
    setLoading(true);

    try {
      await register({
        ...formData,
        charity_id: formData.charity_id || null,
      });

      toast.success('Welcome to The Golf Give!');
      navigate('/dashboard', { replace: true });

    } catch (error) {
      const errorMsg =
        formatApiErrorDetail(error?.response?.data?.detail) ||
        error?.response?.data?.message ||
        error.message ||
        'Registration failed';

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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light tracking-tight mb-2">
            Join The Golf Give
          </h1>
          <p className="text-muted-foreground">
            Start making an impact today
          </p>
        </div>

        {/* Card */}
        <div className="bg-card p-8 rounded-xl border border-border shadow-sm">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            data-testid="register-form"
          >
            {/* Name */}
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1"
                placeholder="John Doe"
              />
            </div>

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
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="mt-1"
                placeholder="••••••••"
              />
            </div>

            {/* Charity */}
            <div>
              <Label>Select Charity (Optional)</Label>
              <Select
                value={formData.charity_id?.toString()}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    charity_id: Number(value),
                  }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a charity" />
                </SelectTrigger>

                <SelectContent>
                  {charities.map((charity) => (
                    <SelectItem
                      key={charity.id}
                      value={charity.id.toString()}
                    >
                      {charity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Percentage */}
            <div>
              <Label htmlFor="charity_percentage">
                Charity Contribution % (Min 10%)
              </Label>
              <Input
                id="charity_percentage"
                type="number"
                min={10}
                max={100}
                value={formData.charity_percentage}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            {/* Button */}
            <Button
              type="submit"
              className="w-full rounded-full bg-primary hover:bg-[#153425]"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Login */}
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
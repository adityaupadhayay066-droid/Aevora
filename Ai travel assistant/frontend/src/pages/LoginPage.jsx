import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, ArrowRight, Lock, Mail, User, Phone, 
  AlertCircle, CheckCircle2, Sparkles, ArrowLeft 
} from 'lucide-react';
import Container from '../components/ui/Container';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const { login, register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!email.trim() || !password.trim()) {
      setFormError('Please enter both email and password.');
      return;
    }

    if (isRegister && !name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    setSubmitting(true);

    try {
      if (isRegister) {
        const res = await register({ name, email, password, phone });
        if (res.success) {
          setFormSuccess('Account created successfully! Redirecting...');
          setTimeout(() => navigate('/'), 1200);
        } else {
          setFormError(res.error || 'Registration failed.');
        }
      } else {
        const res = await login(email, password);
        if (res.success) {
          setFormSuccess('Authentication verified. Welcome back!');
          setTimeout(() => navigate('/'), 900);
        } else {
          setFormError(res.error || 'Invalid email or password.');
        }
      }
    } catch (err) {
      setFormError('Connection error. Please ensure the backend server is reachable.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] pt-32 pb-20 flex items-center justify-center bg-[#0B100D] relative px-4">
      {/* Background Ambience */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=2000&q=80')`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B100D] via-transparent to-[#0B100D]/80 pointer-events-none" />

      <Container className="relative z-10 max-w-md mx-auto">
        {/* Already Logged In State */}
        {isAuthenticated && user ? (
          <GlassCard className="p-8 text-center border border-white/15 bg-[#111A14]/90 backdrop-blur-2xl">
            <div className="w-12 h-12 rounded-full bg-[#315B40]/40 border border-[#91B39A]/40 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6 text-[#91B39A]" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 font-display">
              Already Authenticated
            </h2>
            <p className="text-sm text-[#A6B1A7] mb-6">
              Logged in as <strong className="text-white">{user.name || user.email}</strong>
            </p>
            <div className="flex flex-col gap-3">
              <Button to="/" variant="forest" size="md">
                Continue to Homepage
              </Button>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="p-8 border border-white/15 bg-[#111A14]/90 backdrop-blur-2xl shadow-2xl">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17221A] border border-white/10 text-xs font-semibold text-[#C4A77D] uppercase tracking-wider mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Session Access</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
                {isRegister ? 'Join TravelIQ' : 'Member Sign In'}
              </h1>
              <p className="text-xs text-[#A6B1A7] mt-1.5">
                {isRegister 
                  ? 'Access verified multimodal routing and real-time transit intelligence' 
                  : 'Enter your credentials to access saved corridors and itineraries'}
              </p>
            </div>

            {/* Error / Success Alerts */}
            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#91B39A] mb-1.5 ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C4A77D] pointer-events-none" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Aditya Sharma"
                      required={isRegister}
                      className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#91B39A] mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C4A77D] pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@traveliq.com"
                    required
                    className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#91B39A] mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C4A77D] pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              {isRegister && (
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#91B39A] mb-1.5 ml-1">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C4A77D] pointer-events-none" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="forest"
                size="md"
                className="w-full justify-center mt-2"
                disabled={submitting}
              >
                {submitting ? (
                  <span>Verifying...</span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-6 pt-5 border-t border-white/10 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setFormError('');
                  setFormSuccess('');
                }}
                className="text-xs text-[#A6B1A7] hover:text-white transition-colors cursor-pointer"
              >
                {isRegister ? (
                  <span>Already have a TravelIQ account? <strong className="text-[#C4A77D] underline">Sign In</strong></span>
                ) : (
                  <span>New to TravelIQ? <strong className="text-[#C4A77D] underline">Create an Account</strong></span>
                )}
              </button>
            </div>
          </GlassCard>
        )}
      </Container>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  MapPin,
  DollarSign,
  Briefcase,
  GraduationCap,
  Globe,
  Tag,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetRole = searchParams.get('role');

  const [step, setStep] = useState(presetRole ? 2 : 1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    role: presetRole || '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    /* Candidate fields */
    education: '',
    skills: [],
    experience: '',
    location: '',
    expectedSalary: '',
    jobType: 'full-time',
    /* Company fields */
    companyName: '',
    industry: '',
    companyLocation: '',
    website: '',
    description: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      // Support comma-separated input
      const parts = skillInput.split(',').map((s) => s.trim()).filter(Boolean);
      const newSkills = [...formData.skills];
      for (const part of parts) {
        if (!newSkills.includes(part)) {
          newSkills.push(part);
        }
      }
      updateField('skills', newSkills);
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    updateField(
      'skills',
      formData.skills.filter((s) => s !== skill)
    );
  };

  const validateStep2 = () => {
    if (!formData.name.trim()) return 'Please enter your name.';
    if (!formData.email.trim()) return 'Please enter your email.';
    if (!formData.password) return 'Please enter a password.';
    if (formData.password.length < 6) return 'Password must be at least 6 characters.';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleNext = () => {
    setError('');
    if (step === 2) {
      const validationError = validateStep2();
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    if (formData.role === 'candidate') {
      payload.education = formData.education;
      payload.skills = formData.skills;
      payload.experience = formData.experience;
      payload.location = formData.location;
      payload.expectedSalary = formData.expectedSalary;
      payload.jobType = formData.jobType;
    } else {
      payload.companyName = formData.companyName;
      payload.industry = formData.industry;
      payload.location = formData.companyLocation;
      payload.website = formData.website;
      payload.description = formData.description;
    }

    const result = await register(payload);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard', { state: { isNewProfile: true } });
    } else {
      setError(result.error);
    }
  };

  const totalSteps = 3;
  const progressPercent = (step / totalSteps) * 100;

  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);

  const goNext = () => {
    setDirection(1);
    handleNext();
  };
  const goBack = () => {
    setDirection(-1);
    handleBack();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#020617] flex items-center justify-center px-4 py-12 relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-display font-bold heading-gradient">SmartHire</span>
          </Link>
          <p className="text-slate-400 text-sm">Create your account and start matching.</p>
        </motion.div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex items-center gap-2 text-xs font-medium ${
                  step >= s ? 'text-indigo-400' : 'text-slate-600'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step >= s
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white'
                      : 'bg-white/5 border border-white/10 text-slate-500'
                  }`}
                >
                  {step > s ? <CheckCircle2 className="w-3.5 h-3.5" /> : s}
                </div>
                <span className="hidden sm:inline">
                  {s === 1 ? 'Role' : s === 2 ? 'Account' : 'Profile'}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/20 overflow-hidden"
        >
          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="flex items-center gap-2 px-4 py-3 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait" custom={direction}>
            {/* ── Step 1: Role Selection ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-display font-bold text-white mb-2">Choose Your Role</h2>
                <p className="text-slate-400 text-sm mb-6">How would you like to use SmartHire?</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      updateField('role', 'candidate');
                      setDirection(1);
                      setStep(2);
                    }}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                      formData.role === 'candidate'
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-1">I&apos;m a Candidate</h3>
                    <p className="text-slate-400 text-sm">Looking for my next great opportunity</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateField('role', 'company');
                      setDirection(1);
                      setStep(2);
                    }}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                      formData.role === 'company'
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center mb-4">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-1">I&apos;m Hiring</h3>
                    <p className="text-slate-400 text-sm">Looking to find the best talent</p>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Account Info ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-display font-bold text-white mb-2">Create Your Account</h2>
                <p className="text-slate-400 text-sm mb-6">Enter your basic information.</p>

                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Full name"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="input-field pl-11"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="input-field pl-11"
                      autoComplete="email"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password (min 6 chars)"
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      className="input-field pl-11 pr-11"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      className="input-field pl-11"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <button type="button" onClick={goBack} className="btn-secondary flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button type="button" onClick={goNext} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Role-Specific Profile ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-display font-bold text-white mb-2">
                  {formData.role === 'candidate' ? 'Your Profile' : 'Company Details'}
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  {formData.role === 'candidate'
                    ? 'Tell us about your skills and preferences.'
                    : 'Tell us about your company.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {formData.role === 'candidate' ? (
                    <>
                      <div className="relative">
                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Education (e.g., B.Tech in CS)"
                          value={formData.education}
                          onChange={(e) => updateField('education', e.target.value)}
                          className="input-field pl-11"
                        />
                      </div>

                      {/* Skills tag input */}
                      <div>
                        <div className="relative">
                          <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            placeholder="Type a skill and press Enter"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={addSkill}
                            className="input-field pl-11"
                          />
                        </div>
                        {formData.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.skills.map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/20"
                              >
                                {skill}
                                <button type="button" onClick={() => removeSkill(skill)}>
                                  <X className="w-3 h-3 hover:text-white transition-colors" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Years of experience (e.g., 3)"
                          value={formData.experience}
                          onChange={(e) => updateField('experience', e.target.value)}
                          className="input-field pl-11"
                        />
                      </div>

                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Preferred location"
                          value={formData.location}
                          onChange={(e) => updateField('location', e.target.value)}
                          className="input-field pl-11"
                        />
                      </div>

                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Expected salary (e.g., ₹8,00,000)"
                          value={formData.expectedSalary}
                          onChange={(e) => updateField('expectedSalary', e.target.value)}
                          className="input-field pl-11"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-xs mb-2 font-medium">Job Type</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['full-time', 'part-time', 'internship'].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => updateField('jobType', type)}
                              className={`py-2 rounded-xl text-sm font-medium transition-all duration-300 capitalize ${
                                formData.jobType === type
                                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                  : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Company name"
                          value={formData.companyName}
                          onChange={(e) => updateField('companyName', e.target.value)}
                          className="input-field pl-11"
                        />
                      </div>

                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Industry (e.g., Technology)"
                          value={formData.industry}
                          onChange={(e) => updateField('industry', e.target.value)}
                          className="input-field pl-11"
                        />
                      </div>

                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Location"
                          value={formData.companyLocation}
                          onChange={(e) => updateField('companyLocation', e.target.value)}
                          className="input-field pl-11"
                        />
                      </div>

                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="url"
                          placeholder="Website URL"
                          value={formData.website}
                          onChange={(e) => updateField('website', e.target.value)}
                          className="input-field pl-11"
                        />
                      </div>

                      <textarea
                        placeholder="Company description..."
                        value={formData.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        rows={4}
                        className="input-field resize-none"
                      />
                    </>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={goBack} className="btn-secondary flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Register;

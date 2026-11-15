import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Building2,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  FolderGit2,
  GraduationCap,
  Briefcase,
  MapPin,
  DollarSign,
  Globe,
  Tag,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Profile() {
  const { user } = useAuth();
  const isCandidate = user?.role === 'candidate';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Candidate Profile State
  const [candProfile, setCandProfile] = useState({
    name: '',
    title: '',
    bio: '',
    education: '',
    experience: '',
    location: '',
    expectedSalary: '',
    jobType: 'Full-time',
    availability: 'Immediate',
    skills: [],
    preferredLocations: [],
    projects: [],
  });

  // Company Profile State
  const [compProfile, setCompProfile] = useState({
    companyName: '',
    industry: '',
    location: '',
    website: '',
    description: '',
    size: '1-10',
    founded: '',
  });

  // Tag input temp states
  const [skillInput, setSkillInput] = useState('');
  const [prefLocInput, setPrefLocInput] = useState('');

  // Fetch initial profile
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        if (isCandidate) {
          const res = await api.get('/candidates/profile');
          if (res.data) {
            setCandProfile({
              name: res.data.name || user?.name || '',
              title: res.data.title || '',
              bio: res.data.bio || '',
              education: res.data.education || '',
              experience: res.data.experience || '',
              location: res.data.location || '',
              expectedSalary: res.data.expectedSalary || '',
              jobType: res.data.jobType || 'Full-time',
              availability: res.data.availability || 'Immediate',
              skills: res.data.skills || [],
              preferredLocations: res.data.preferredLocations || [],
              projects: res.data.projects || [],
            });
          }
        } else {
          const res = await api.get('/companies/profile');
          if (res.data) {
            setCompProfile({
              companyName: res.data.companyName || user?.name || '',
              industry: res.data.industry || '',
              location: res.data.location || '',
              website: res.data.website || '',
              description: res.data.description || '',
              size: res.data.size || '1-10',
              founded: res.data.founded || '',
            });
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [isCandidate, user?.name]);

  // Skill tag add/remove
  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const rawVal = skillInput.trim();
      if (!rawVal) return;
      // Support comma-separated input: "React, Node, Python" → 3 tags
      const parts = rawVal.split(',').map((s) => s.trim()).filter(Boolean);
      const newSkills = [...candProfile.skills];
      for (const part of parts) {
        if (!newSkills.includes(part)) {
          newSkills.push(part);
        }
      }
      setCandProfile({ ...candProfile, skills: newSkills });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setCandProfile({
      ...candProfile,
      skills: candProfile.skills.filter((s) => s !== skillToRemove),
    });
  };

  // Preferred location tag add/remove
  const handleAddLocation = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const rawVal = prefLocInput.trim();
      if (!rawVal) return;
      // Support comma-separated input
      const parts = rawVal.split(',').map((s) => s.trim()).filter(Boolean);
      const newLocs = [...candProfile.preferredLocations];
      for (const part of parts) {
        if (!newLocs.includes(part)) {
          newLocs.push(part);
        }
      }
      setCandProfile({ ...candProfile, preferredLocations: newLocs });
      setPrefLocInput('');
    }
  };

  const handleRemoveLocation = (locToRemove) => {
    setCandProfile({
      ...candProfile,
      preferredLocations: candProfile.preferredLocations.filter((l) => l !== locToRemove),
    });
  };

  // Project portfolio handlers
  const handleAddProject = () => {
    const newProject = {
      name: '',
      duration: '',
      role: '',
      techStack: '',
      description: '',
      outcome: '',
      link: '',
    };
    setCandProfile({
      ...candProfile,
      projects: [...candProfile.projects, newProject],
    });
  };

  const handleProjectChange = (index, field, value) => {
    const updated = [...candProfile.projects];
    updated[index][field] = value;
    setCandProfile({ ...candProfile, projects: updated });
  };

  const handleRemoveProject = (index) => {
    const updated = candProfile.projects.filter((_, i) => i !== index);
    setCandProfile({ ...candProfile, projects: updated });
  };

  // Submit
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      if (isCandidate) {
        await api.put('/candidates/profile', candProfile);
      } else {
        await api.put('/companies/profile', compProfile);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to save profile. Please check your data.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Loading your structured profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-8 sm:pt-10 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isCandidate ? 'Candidate Profile Setup' : 'Employer Profile Setup'}</span>
            </div>
            <h1 className="text-3xl font-display font-extrabold tracking-tight">
              {isCandidate ? 'Structured Candidate Profile' : 'Company Job Identity'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {isCandidate
                ? 'One structured profile automatically represents you across multiple job opportunities.'
                : 'Define your company profile to improve matching accuracy and candidate engagement.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="self-start sm:self-center px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Profile saved successfully!</p>
                <p className="text-xs text-emerald-400/80">
                  The matching engine has recalculated your compatibility across active postings.
                </p>
              </div>
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSave} className="space-y-8">
          {/* ================================= CANDIDATE PROFILE ================================= */}
          {isCandidate ? (
            <>
              {/* Section 1: Basic Information */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-6">
                <h2 className="text-lg font-display font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                  <User className="w-5 h-5 text-indigo-400" />
                  <span>Personal & Headline</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Full Name</label>
                    <input
                      type="text"
                      value={candProfile.name}
                      onChange={(e) => setCandProfile({ ...candProfile, name: e.target.value })}
                      placeholder="e.g. Vansh Kumar Jha"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Professional Title</label>
                    <input
                      type="text"
                      value={candProfile.title}
                      onChange={(e) => setCandProfile({ ...candProfile, title: e.target.value })}
                      placeholder="e.g. Full Stack Developer"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Current Location</label>
                    <input
                      type="text"
                      value={candProfile.location}
                      onChange={(e) => setCandProfile({ ...candProfile, location: e.target.value })}
                      placeholder="e.g. Agra, India"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Availability</label>
                    <select
                      value={candProfile.availability}
                      onChange={(e) => setCandProfile({ ...candProfile, availability: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#090d1f] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="Immediate">Immediate</option>
                      <option value="15 Days">Within 15 Days</option>
                      <option value="30 Days">Within 30 Days</option>
                      <option value="60 Days">Within 60 Days</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Professional Bio</label>
                  <textarea
                    rows={3}
                    value={candProfile.bio}
                    onChange={(e) => setCandProfile({ ...candProfile, bio: e.target.value })}
                    placeholder="Briefly describe your passion, strengths, and goals..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Section 2: Education & Experience */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-6">
                <h2 className="text-lg font-display font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                  <span>Education & Experience</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Education / Qualification</label>
                    <input
                      type="text"
                      value={candProfile.education}
                      onChange={(e) => setCandProfile({ ...candProfile, education: e.target.value })}
                      placeholder="e.g. B.Tech Graduate, F.E.T Agra College"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Work Experience</label>
                    <input
                      type="text"
                      value={candProfile.experience}
                      onChange={(e) => setCandProfile({ ...candProfile, experience: e.target.value })}
                      placeholder="e.g. 1 Year / Fresher"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Skills (40% match weight) */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                    <Tag className="w-5 h-5 text-indigo-400" />
                    <span>Skills & Technologies</span>
                  </h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    40% Matching Weight
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      placeholder="Type a skill and press Enter (e.g. React, Node.js, Python, MySQL, Communication)"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Skills tags list */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {candProfile.skills.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No skills added yet. Add at least 3-5 key skills.</p>
                    ) : (
                      candProfile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-600/20 border border-indigo-500/30 text-indigo-200"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="w-3.5 h-3.5 rounded-full hover:bg-white/20 inline-flex items-center justify-center text-slate-400 hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Section 4: Preferences & Salary */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-6">
                <h2 className="text-lg font-display font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                  <DollarSign className="w-5 h-5 text-indigo-400" />
                  <span>Salary & Job Preferences</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Expected Salary (₹ / month)</label>
                    <input
                      type="text"
                      value={candProfile.expectedSalary}
                      onChange={(e) => setCandProfile({ ...candProfile, expectedSalary: e.target.value })}
                      placeholder="e.g. 60000"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Job Type</label>
                    <select
                      value={candProfile.jobType}
                      onChange={(e) => setCandProfile({ ...candProfile, jobType: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#090d1f] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Internship">Internship</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-300">Preferred Work Locations</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={prefLocInput}
                      onChange={(e) => setPrefLocInput(e.target.value)}
                      onKeyDown={handleAddLocation}
                      placeholder="e.g. Agra, Delhi NCR, Remote (Press Enter)"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleAddLocation}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {candProfile.preferredLocations.map((loc, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-600/20 border border-purple-500/30 text-purple-200"
                      >
                        <MapPin className="w-3 h-3 text-purple-400" />
                        <span>{loc}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveLocation(loc)}
                          className="hover:text-white text-slate-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 5: Candidate Project Portfolio (PPT Slide 06) */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                      <FolderGit2 className="w-5 h-5 text-indigo-400" />
                      <span>Project Portfolio Evidence</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Demonstrate practical skills beyond a traditional resume
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddProject}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Add Project</span>
                  </button>
                </div>

                {candProfile.projects.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-white/10 text-center space-y-2">
                    <FolderGit2 className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-sm font-medium text-slate-300">No portfolio projects added yet</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Candidates with verified projects achieve significantly higher employer response rates.
                    </p>
                    <button
                      type="button"
                      onClick={handleAddProject}
                      className="mt-2 px-4 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 text-xs font-semibold"
                    >
                      + Add Sample Project
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {candProfile.projects.map((proj, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-4 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                            Project {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveProject(idx)}
                            className="text-slate-500 hover:text-red-400 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs text-slate-400">Project Title</label>
                            <input
                              type="text"
                              value={proj.name}
                              onChange={(e) => handleProjectChange(idx, 'name', e.target.value)}
                              placeholder="e.g. E-Commerce Website"
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs text-slate-400">Role & Duration</label>
                            <input
                              type="text"
                              value={proj.role}
                              onChange={(e) => handleProjectChange(idx, 'role', e.target.value)}
                              placeholder="e.g. Full Stack Developer (3 Months)"
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs text-slate-400">Tech Stack</label>
                            <input
                              type="text"
                              value={proj.techStack}
                              onChange={(e) => handleProjectChange(idx, 'techStack', e.target.value)}
                              placeholder="e.g. React, Node.js, Express, MySQL"
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs text-slate-400">Live Demo / GitHub Link</label>
                            <input
                              type="text"
                              value={proj.link}
                              onChange={(e) => handleProjectChange(idx, 'link', e.target.value)}
                              placeholder="e.g. https://github.com/..."
                              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-400">What You Built (Responsibilities)</label>
                          <textarea
                            rows={2}
                            value={proj.description}
                            onChange={(e) => handleProjectChange(idx, 'description', e.target.value)}
                            placeholder="Built product pages, user authentication, shopping cart and checkout pipeline..."
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 resize-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-400">Project Outcome & Impact</label>
                          <input
                            type="text"
                            value={proj.outcome}
                            onChange={(e) => handleProjectChange(idx, 'outcome', e.target.value)}
                            placeholder="Working online shopping prototype with end-to-end user flow."
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ================================= COMPANY PROFILE ================================= */
            <>
              <div className="p-6 sm:p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-6">
                <h2 className="text-lg font-display font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                  <span>Company Identity</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Company Name</label>
                    <input
                      type="text"
                      value={compProfile.companyName}
                      onChange={(e) => setCompProfile({ ...compProfile, companyName: e.target.value })}
                      placeholder="e.g. ABC Pvt. Ltd."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Industry Sector</label>
                    <input
                      type="text"
                      value={compProfile.industry}
                      onChange={(e) => setCompProfile({ ...compProfile, industry: e.target.value })}
                      placeholder="e.g. Software & IT Services, FinTech"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Headquarters / Location</label>
                    <input
                      type="text"
                      value={compProfile.location}
                      onChange={(e) => setCompProfile({ ...compProfile, location: e.target.value })}
                      placeholder="e.g. Agra / Delhi NCR"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Website URL</label>
                    <input
                      type="text"
                      value={compProfile.website}
                      onChange={(e) => setCompProfile({ ...compProfile, website: e.target.value })}
                      placeholder="e.g. https://abctech.example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Company Size</label>
                    <select
                      value={compProfile.size}
                      onChange={(e) => setCompProfile({ ...compProfile, size: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#090d1f] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="1-10">1-10 employees (Early Startup)</option>
                      <option value="11-50">11-50 employees (Growth)</option>
                      <option value="51-200">51-200 employees (Mid-sized)</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="500+">500+ employees (Enterprise)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Founded Year</label>
                    <input
                      type="text"
                      value={compProfile.founded}
                      onChange={(e) => setCompProfile({ ...compProfile, founded: e.target.value })}
                      placeholder="e.g. 2021"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">About the Organization</label>
                  <textarea
                    rows={4}
                    value={compProfile.description}
                    onChange={(e) => setCompProfile({ ...compProfile, description: e.target.value })}
                    placeholder="Describe your company's mission, work culture, and what you build..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Bottom Save Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Updating...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Search,
  MapPin,
  DollarSign,
  Plus,
  Clock,
  Building2,
  GraduationCap,
  Sparkles,
  X,
  CheckCircle2,
  Filter,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import AnimatedCard from '../components/AnimatedCard';

export default function Jobs() {
  const { user } = useAuth();
  const isCompany = user?.role === 'company';

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedJobType, setSelectedJobType] = useState('all');

  // Modal State for Posting New Job
  const [modalOpen, setModalOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [postError, setPostError] = useState('');

  // New Job Form State (Matching PPT Slide 07)
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    educationReq: 'Graduate',
    experienceReq: '0–2 Years',
    skillsReq: [],
    location: '',
    salaryMin: '',
    salaryMax: '',
    jobType: 'Full-time',
    joiningPeriod: 'Within 30 days',
  });
  const [skillInput, setSkillInput] = useState('');

  // Fetch jobs
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs');
      setJobs(res.data || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Skill tag add/remove in job posting modal
  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const rawVal = skillInput.trim();
      if (!rawVal) return;
      // Support comma-separated input
      const parts = rawVal.split(',').map((s) => s.trim()).filter(Boolean);
      const newSkills = [...newJob.skillsReq];
      for (const part of parts) {
        if (!newSkills.includes(part)) {
          newSkills.push(part);
        }
      }
      setNewJob({ ...newJob, skillsReq: newSkills });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setNewJob({
      ...newJob,
      skillsReq: newJob.skillsReq.filter((s) => s !== skill),
    });
  };

  // Submit new job
  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!newJob.title) return;
    setPosting(true);
    setPostError('');

    try {
      await api.post('/jobs', newJob);
      setPostSuccess(true);
      fetchJobs();
      setTimeout(() => {
        setPostSuccess(false);
        setModalOpen(false);
        setNewJob({
          title: '',
          description: '',
          educationReq: 'Graduate',
          experienceReq: '0–2 Years',
          skillsReq: [],
          location: '',
          salaryMin: '',
          salaryMax: '',
          jobType: 'Full-time',
          joiningPeriod: 'Within 30 days',
        });
      }, 1500);
    } catch (err) {
      console.error('Create job error:', err);
      setPostError(err.response?.data?.message || 'Failed to post job. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skillsReq?.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation =
      selectedLocation === 'all' ||
      job.location?.toLowerCase().includes(selectedLocation.toLowerCase());

    const matchesType =
      selectedJobType === 'all' ||
      job.jobType?.toLowerCase() === selectedJobType.toLowerCase();

    return matchesSearch && matchesLocation && matchesType;
  });

  // Extract unique locations for filtering
  const locations = Array.from(
    new Set(jobs.map((j) => j.location).filter(Boolean))
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-8 sm:pt-10 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Structured Opportunities</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight">
              {isCompany ? 'Manage & Post Job Requirements' : 'Explore Structured Job Openings'}
            </h1>
            <p className="text-slate-400 text-sm max-w-xl mt-1">
              Every job posting is indexed with standardized qualifications, skills, and salary criteria for intelligent two-way discovery.
            </p>
          </div>

          {isCompany && (
            <button
              onClick={() => setModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all self-start md:self-auto hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Requirement</span>
            </button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col md:flex-row gap-4 items-center">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by job title, company name, or skills (e.g. React, Node.js, Developer)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Location Filter */}
          <div className="w-full md:w-52">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d1f] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="all">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Job Type Filter */}
          <div className="w-full md:w-44">
            <select
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d1f] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="all">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredJobs.length} active opportunities</span>
          <span>Standardized matching profiles active</span>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white/5 border border-white/10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 mx-auto flex items-center justify-center text-indigo-400">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No job openings found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search query or filters. Employers frequently post new requirements.
            </p>
            {isCompany && (
              <button
                onClick={() => setModalOpen(true)}
                className="mt-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
              >
                + Post First Job Requirement
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job, idx) => (
              <AnimatedCard key={job.id || idx} delay={idx * 0.05} className="flex flex-col justify-between p-6">
                <div className="space-y-4">
                  {/* Top: Job Header & Company */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                        {job.jobType || 'Full-time'}
                      </span>
                      <h3 className="text-lg font-display font-bold text-white hover:text-indigo-300 transition-colors">
                        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>{job.companyName || 'ABC Pvt. Ltd.'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="truncate">{job.location || 'Agra'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {job.salaryMin && job.salaryMax
                          ? `₹${Number(job.salaryMin).toLocaleString()} - ₹${Number(job.salaryMax).toLocaleString()}`
                          : 'Competitive'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                      <span className="truncate">{job.educationReq || 'Graduate'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{job.experienceReq || '0–2 Years'}</span>
                    </div>
                  </div>

                  {/* Skills Tags */}
                  {job.skillsReq && job.skillsReq.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {job.skillsReq.slice(0, 4).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white/5 border border-white/10 text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skillsReq.length > 4 && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 text-slate-500">
                          +{job.skillsReq.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Short Description */}
                  {job.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 pt-1">
                      {job.description}
                    </p>
                  )}
                </div>

                {/* Bottom CTA */}
                <div className="pt-5 mt-5 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    {job.joiningPeriod || 'Immediate Joining'}
                  </span>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span>View Requirement Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}

        {/* Modal: Post New Job Requirement Profile (PPT Slide 07) */}
        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModalOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-md"
              />

              {/* Modal Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-[#0b1024] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/60 z-10 my-8 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      Company Job Profile Setup
                    </span>
                    <h2 className="text-xl font-display font-bold text-white mt-0.5">
                      Post Job Requirement Profile
                    </h2>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {postSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Job profile posted successfully! Matching engine triggered.</span>
                  </div>
                )}

                {postError && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                    {postError}
                  </div>
                )}

                <form onSubmit={handleCreateJob} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Job Title / Position</label>
                      <input
                        type="text"
                        value={newJob.title}
                        onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                        placeholder="e.g. Web-Developer"
                        className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Job Type</label>
                      <select
                        value={newJob.jobType}
                        onChange={(e) => setNewJob({ ...newJob, jobType: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#090d1f] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Internship">Internship</option>
                        <option value="Remote">Remote</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Required Education</label>
                      <input
                        type="text"
                        value={newJob.educationReq}
                        onChange={(e) => setNewJob({ ...newJob, educationReq: e.target.value })}
                        placeholder="e.g. Graduate / B.Tech"
                        className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Required Experience</label>
                      <input
                        type="text"
                        value={newJob.experienceReq}
                        onChange={(e) => setNewJob({ ...newJob, experienceReq: e.target.value })}
                        placeholder="e.g. 0–2 Years"
                        className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Job Location</label>
                      <input
                        type="text"
                        value={newJob.location}
                        onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                        placeholder="e.g. Agra / Delhi NCR"
                        className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Joining Period</label>
                      <input
                        type="text"
                        value={newJob.joiningPeriod}
                        onChange={(e) => setNewJob({ ...newJob, joiningPeriod: e.target.value })}
                        placeholder="e.g. Within 30 days"
                        className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Min Salary (₹ / month)</label>
                      <input
                        type="number"
                        value={newJob.salaryMin}
                        onChange={(e) => setNewJob({ ...newJob, salaryMin: e.target.value })}
                        placeholder="e.g. 40000"
                        className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Max Salary (₹ / month)</label>
                      <input
                        type="number"
                        value={newJob.salaryMax}
                        onChange={(e) => setNewJob({ ...newJob, salaryMax: e.target.value })}
                        placeholder="e.g. 60000"
                        className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Skills Requirement Tag Input */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-semibold text-slate-300">
                      Required Skills (40% Weight in Algorithm)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleAddSkill}
                        placeholder="Type skill & press enter (e.g. Communication, MS Excel, Full Stack Developer)"
                        className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {newJob.skillsReq.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 flex items-center gap-1.5"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 pt-2">
                    <label className="text-xs font-semibold text-slate-300">Job Description</label>
                    <textarea
                      rows={3}
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      placeholder="Detail the key responsibilities, team environment, and project scope..."
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-sm font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={posting}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                    >
                      {posting ? 'Indexing...' : 'Publish & Run Matching'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

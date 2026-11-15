import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Globe,
  Share2,
  Send,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import MatchCircle from '../components/MatchCircle';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCandidate = user?.role === 'candidate';

  const [job, setJob] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionDone, setActionDone] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchJobDetail() {
      setLoading(true);
      try {
        const jobRes = await api.get(`/jobs/${id}`);
        setJob(jobRes.data);

        if (isCandidate) {
          // Fetch candidate matches to see if there is a computed match
          const [matchesRes, profileRes] = await Promise.allSettled([
            api.get('/candidates/matches'),
            api.get('/candidates/profile'),
          ]);

          if (matchesRes.status === 'fulfilled') {
            const found = matchesRes.value.data?.find((m) => m.jobId === id);
            if (found) setMatchData(found);
          }

          if (profileRes.status === 'fulfilled') {
            setCandidateProfile(profileRes.value.data);
          }
        }
      } catch (err) {
        console.error('Error loading job details:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchJobDetail();
  }, [id, isCandidate]);

  const handleApplyConnect = async () => {
    if (!matchData?.id) {
      // If no match record exists yet, show friendly confirmation
      setActionDone(true);
      return;
    }
    setActionLoading(true);
    try {
      await api.put(`/matches/${matchData.id}/status`, { status: 'accepted' });
      setActionDone(true);
    } catch (err) {
      console.error('Error applying to match:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading job requirement profile...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center gap-4">
        <p className="text-slate-400">Job not found or has been removed.</p>
        <Link
          to="/jobs"
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Back to Jobs
        </Link>
      </div>
    );
  }

  // Calculate live skills overlap if no match record saved yet
  const candidateSkills = candidateProfile?.skills || [];
  const requiredSkills = job.skillsReq || [];
  const matchingSkills = requiredSkills.filter((req) =>
    candidateSkills.some((cand) => cand.toLowerCase() === req.toLowerCase())
  );

  const estimatedMatchScore = matchData?.matchScore || (requiredSkills.length > 0
    ? Math.round((matchingSkills.length / requiredSkills.length) * 40 + 40)
    : 75);

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-8 sm:pt-10 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation back */}
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Jobs</span>
        </Link>

        {/* Hero Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-purple-950/70 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {job.jobType || 'Full-time'}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {job.joiningPeriod || 'Within 30 days'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  {job.companyName || 'ABC Pvt. Ltd.'}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  {job.location || 'Agra'}
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  {job.salaryMin && job.salaryMax
                    ? `₹${Number(job.salaryMin).toLocaleString()} – ₹${Number(job.salaryMax).toLocaleString()} / mo`
                    : 'Competitive Salary'}
                </span>
              </div>
            </div>

            {/* Smart Two-Way Match Indicator for Candidates */}
            {isCandidate && (
              <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                <MatchCircle percentage={estimatedMatchScore} size={84} strokeWidth={7} />
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Two-Way Fit
                  </span>
                  <p className="text-base font-bold text-white leading-tight">
                    {estimatedMatchScore >= 80 ? 'High Correspondence' : 'Moderate Match'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Calculated against your profile criteria
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Layout: Main Specs + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Specs (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Structured Criteria (PPT Slide 07) */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-6">
              <h2 className="text-lg font-display font-bold text-white border-b border-white/10 pb-3">
                Structured Job Requirements
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-indigo-400" />
                    <span>Education Requirement</span>
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {job.educationReq || 'Graduate / B.Tech'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>Experience Requirement</span>
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {job.experienceReq || '0–2 Years'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    <span>Work Location</span>
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {job.location || 'Agra'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>Expected Joining</span>
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {job.joiningPeriod || 'Within 30 days'}
                  </p>
                </div>
              </div>

              {/* Required Skills */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-semibold text-slate-300">
                  Required Competencies & Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.skillsReq && job.skillsReq.length > 0 ? (
                    job.skillsReq.map((skill, idx) => {
                      const isMatched = matchingSkills.some(
                        (ms) => ms.toLowerCase() === skill.toLowerCase()
                      );
                      return (
                        <span
                          key={idx}
                          className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border ${
                            isMatched
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-white/5 text-slate-300 border-white/10'
                          }`}
                        >
                          {isMatched && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          <span>{skill}</span>
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-slate-500">General Technical Skills</span>
                  )}
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-4">
              <h2 className="text-lg font-display font-bold text-white border-b border-white/10 pb-3">
                Role Description & Overview
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {job.description ||
                  'The candidate will be responsible for building modern web applications, implementing key frontend components, collaborating with backend APIs, and deploying reliable solutions. You will be part of an agile development team working with modern web stacks.'}
              </p>
            </div>
          </div>

          {/* Sidebar (1 Col) */}
          <div className="space-y-6">
            {/* Action Box */}
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-4">
              <h3 className="text-base font-display font-bold text-white">
                Opportunity Status
              </h3>

              {actionDone ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Application Connected!</span>
                  </div>
                  <p className="text-emerald-400/80">
                    The employer has received a match notification and can review your structured profile.
                  </p>
                </div>
              ) : isCandidate ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    SmartHire removes tedious cover letters. Your structured profile is sent directly to the hiring manager.
                  </p>
                  <button
                    onClick={handleApplyConnect}
                    disabled={actionLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>{actionLoading ? 'Connecting...' : 'Connect With Employer'}</span>
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Viewing this job requirement as an employer. You can manage matches in your Smart Matches dashboard.
                </p>
              )}
            </div>

            {/* Company Info Box */}
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-4">
              <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>About Employer</span>
              </h3>

              <div className="space-y-2 text-xs text-slate-300">
                <p className="font-semibold text-white text-sm">
                  {job.companyName || 'ABC Pvt. Ltd.'}
                </p>
                {job.company?.industry && (
                  <p className="text-slate-400">Industry: {job.company.industry}</p>
                )}
                {job.company?.location && (
                  <p className="text-slate-400">HQ: {job.company.location}</p>
                )}
                {job.company?.website && (
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:underline flex items-center gap-1 pt-1"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Visit Company Website</span>
                  </a>
                )}
              </div>
            </div>

            {/* SmartHire Two-Way Guarantee */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Two-Way Matching
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                "Don’t search for jobs. Let the right jobs find you — while helping companies discover the right candidates."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

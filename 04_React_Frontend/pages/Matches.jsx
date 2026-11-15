import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Briefcase,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Filter,
  Building2,
  MapPin,
  DollarSign,
  GraduationCap,
  FolderGit2,
  ExternalLink,
  X,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import MatchCircle from '../components/MatchCircle';
import AnimatedCard from '../components/AnimatedCard';

export default function Matches() {
  const { user } = useAuth();
  const isCandidate = user?.role === 'candidate';

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | high | accepted | shortlisted
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Fetch matches
  const fetchMatches = async () => {
    setLoading(true);
    try {
      const endpoint = isCandidate ? '/candidates/matches' : '/companies/matches';
      const res = await api.get(endpoint);
      setMatches(res.data || []);
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [isCandidate]);

  // Update match status
  const handleUpdateStatus = async (matchId, status) => {
    try {
      await api.put(`/matches/${matchId}/status`, { status });
      // update state locally
      setMatches((prev) =>
        prev.map((m) =>
          m.id === matchId
            ? {
                ...m,
                candidateStatus: isCandidate ? status : m.candidateStatus,
                companyStatus: !isCandidate ? status : m.companyStatus,
              }
            : m
        )
      );
    } catch (err) {
      console.error('Error updating match status:', err);
    }
  };

  // Filter logic
  const filteredMatches = matches.filter((m) => {
    const currentStatus = isCandidate ? m.candidateStatus : m.companyStatus;
    if (filter === 'high') return m.matchScore >= 80;
    if (filter === 'accepted') return currentStatus === 'accepted';
    if (filter === 'shortlisted') return currentStatus === 'shortlisted';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-8 sm:pt-10 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Comparison Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight">
              {isCandidate ? 'Jobs That Found You' : 'Candidates Matched to Requirements'}
            </h1>
            <p className="text-slate-400 text-sm max-w-xl mt-1">
              {isCandidate
                ? 'SmartHire proactively checks opportunities against your stated qualifications, skills, and preferences.'
                : 'Compare candidate qualifications and practical evidence against your required criteria with scored precision.'}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 self-start md:self-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Matches ({matches.length})
            </button>
            <button
              onClick={() => setFilter('high')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === 'high'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              High Fit (≥80%)
            </button>
            <button
              onClick={() => setFilter('accepted')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === 'accepted'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Connected
            </button>
            <button
              onClick={() => setFilter('shortlisted')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === 'shortlisted'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Shortlisted
            </button>
          </div>
        </div>

        {/* Matches List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white/5 border border-white/10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 mx-auto flex items-center justify-center text-indigo-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No matches found in this view</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isCandidate
                ? 'Update your skills, experience, and preferred locations to increase matching probability.'
                : 'Publish or update job profiles to generate new high-compatibility matches.'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredMatches.map((match, idx) => {
              const job = match.job || {};
              const company = match.company || {};
              const candidate = match.candidate || {};
              const currentStatus = isCandidate ? match.candidateStatus : match.companyStatus;
              const isMutual = match.candidateStatus === 'accepted' && match.companyStatus === 'accepted';

              return (
                <AnimatedCard key={match.id || idx} delay={idx * 0.05} className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Circle + Primary Info */}
                    <div className="flex items-start sm:items-center gap-5">
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <MatchCircle percentage={match.matchScore || 0} size={82} strokeWidth={7} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Match Fit
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-display font-bold text-white capitalize">
                            {isCandidate ? job.title || 'Web Developer' : candidate.name || 'Candidate'}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              match.matchScore >= 80
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            }`}
                          >
                            {match.matchScore >= 90 ? 'Exceptional Match' : match.matchScore >= 70 ? 'Strong Fit' : 'Fair Fit'}
                          </span>
                          {isMutual ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-400" />
                              <span>Mutual Match • Chat Unlocked</span>
                            </span>
                          ) : currentStatus && currentStatus !== 'pending' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30">
                              {currentStatus}
                            </span>
                          ) : null}
                        </div>

                        <p className="text-sm text-slate-400 flex items-center gap-2">
                          {isCandidate ? (
                            <>
                              <Building2 className="w-4 h-4 text-indigo-400" />
                              <span className="font-medium text-slate-200">
                                {company.companyName || job.companyName || 'ABC Pvt. Ltd.'}
                              </span>
                            </>
                          ) : (
                            <>
                              <User className="w-4 h-4 text-indigo-400" />
                              <span className="font-medium text-slate-200">
                                {candidate.title || 'Full Stack Developer'}
                              </span>
                              <span>•</span>
                              <span>Target: {job.title}</span>
                            </>
                          )}
                        </p>

                        {/* Attribute tags */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span>{isCandidate ? job.location : candidate.location || 'Agra'}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                            <span>{isCandidate ? job.educationReq : candidate.education || 'Graduate'}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>{isCandidate ? job.experienceReq : candidate.experience || '1 Year'}</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-indigo-300">
                            <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
                            <span>
                              {isCandidate
                                ? `₹${job.salaryMin ? `${Number(job.salaryMin).toLocaleString()} - ` : ''}₹${job.salaryMax ? Number(job.salaryMax).toLocaleString() : ''}`
                                : `Expects: ₹${candidate.expectedSalary ? Number(candidate.expectedSalary).toLocaleString() : '60,000'}`}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/5">
                      {isCandidate ? (
                        <>
                          <Link
                            to={`/jobs/${job.id}`}
                            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white transition-all flex items-center gap-1.5"
                          >
                            <span>View Job</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {isMutual ? (
                            <Link
                              to={`/chat/${match.id}`}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Open Chat</span>
                            </Link>
                          ) : currentStatus !== 'accepted' ? (
                            <button
                              onClick={() => handleUpdateStatus(match.id, 'accepted')}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Accept Match</span>
                            </button>
                          ) : (
                            <span
                              className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium flex items-center gap-1.5"
                              title="Chat unlocks once the employer also accepts this match"
                            >
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>Awaiting Employer</span>
                            </span>
                          )}

                          {currentStatus !== 'rejected' && currentStatus !== 'accepted' && (
                            <button
                              onClick={() => handleUpdateStatus(match.id, 'rejected')}
                              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-300 text-xs font-semibold transition-colors"
                            >
                              Decline
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Employer actions */}
                          <button
                            onClick={() => setSelectedCandidate(candidate)}
                            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white transition-all flex items-center gap-1.5"
                          >
                            <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                            <span>View Portfolio</span>
                          </button>

                          {currentStatus !== 'shortlisted' && (
                            <button
                              onClick={() => handleUpdateStatus(match.id, 'shortlisted')}
                              className="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/30 text-xs font-semibold transition-all"
                            >
                              Shortlist
                            </button>
                          )}

                          {isMutual ? (
                            <Link
                              to={`/chat/${match.id}`}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Open Chat</span>
                            </Link>
                          ) : currentStatus !== 'accepted' ? (
                            <button
                              onClick={() => handleUpdateStatus(match.id, 'accepted')}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Accept & Connect</span>
                            </button>
                          ) : (
                            <span
                              className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium flex items-center gap-1.5"
                              title="Chat unlocks once the candidate also accepts this match"
                            >
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>Awaiting Candidate</span>
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </AnimatedCard>
              );
            })}
          </div>
        )}

        {/* Modal: View Candidate Project Portfolio (PPT Slide 06) */}
        <AnimatePresence>
          {selectedCandidate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCandidate(null)}
                className="fixed inset-0 bg-black/80 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl bg-[#0b1024] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      Candidate Portfolio & Evidence
                    </span>
                    <h2 className="text-2xl font-display font-bold text-white mt-0.5 capitalize">
                      {selectedCandidate.name}
                    </h2>
                    <p className="text-xs text-slate-400">{selectedCandidate.title || 'Technical Specialist'}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Candidate Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white/5 p-4 rounded-xl">
                  <div>
                    <span className="text-slate-500 block">Education</span>
                    <span className="font-semibold text-white">{selectedCandidate.education || 'B.Tech'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Experience</span>
                    <span className="font-semibold text-white">{selectedCandidate.experience || '1 Year'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Location</span>
                    <span className="font-semibold text-white">{selectedCandidate.location || 'Agra'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Salary Expectation</span>
                    <span className="font-semibold text-indigo-300">
                      ₹{selectedCandidate.expectedSalary || '60,000'}
                    </span>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Skills & Competencies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCandidate.skills && selectedCandidate.skills.length > 0 ? (
                      selectedCandidate.skills.map((s, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">No skills declared</span>
                    )}
                  </div>
                </div>

                {/* Projects */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Portfolio Projects
                  </span>
                  {selectedCandidate.projects && selectedCandidate.projects.length > 0 ? (
                    selectedCandidate.projects.map((proj, pIdx) => (
                      <div key={pIdx} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white">{proj.name}</h4>
                          <span className="text-[11px] text-slate-400">{proj.role}</span>
                        </div>
                        {proj.techStack && (
                          <p className="text-xs text-indigo-300">
                            <strong>Tech Stack:</strong> {proj.techStack}
                          </p>
                        )}
                        {proj.description && (
                          <p className="text-xs text-slate-300">{proj.description}</p>
                        )}
                        {proj.outcome && (
                          <p className="text-xs text-emerald-400 font-medium">
                            <strong>Outcome:</strong> {proj.outcome}
                          </p>
                        )}
                        {proj.link && (
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-1"
                          >
                            <span>Live Demo / GitHub Repository</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">No portfolio projects attached.</p>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

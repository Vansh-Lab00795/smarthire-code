import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Briefcase,
  Users,
  Bell,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
  PlusCircle,
  ExternalLink,
  Award,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatsCard from '../components/StatsCard';
import MatchCircle from '../components/MatchCircle';
import AnimatedCard from '../components/AnimatedCard';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const isCandidate = user?.role === 'candidate';
  const isNewProfile = location.state?.isNewProfile || Boolean(user?.isNewUser);

  // Clear new-user status after first view so subsequent visits show "Welcome back"
  useEffect(() => {
    if (user?.isNewUser) {
      api.post('/auth/welcome-seen').catch(() => {});
    }
  }, [user?.isNewUser]);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        if (isCandidate) {
          const [profRes, matchRes, jobRes, notifRes] = await Promise.allSettled([
            api.get('/candidates/profile'),
            api.get('/candidates/matches'),
            api.get('/jobs'),
            api.get('/candidates/notifications'),
          ]);

          if (profRes.status === 'fulfilled') setProfile(profRes.value.data);
          if (matchRes.status === 'fulfilled') setMatches(matchRes.value.data || []);
          if (jobRes.status === 'fulfilled') setJobs(jobRes.value.data || []);
          if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data || []);
        } else {
          const [profRes, matchRes, jobRes, notifRes] = await Promise.allSettled([
            api.get('/companies/profile'),
            api.get('/companies/matches'),
            api.get('/jobs'),
            api.get('/companies/notifications'),
          ]);

          if (profRes.status === 'fulfilled') setProfile(profRes.value.data);
          if (matchRes.status === 'fulfilled') setMatches(matchRes.value.data || []);
          if (jobRes.status === 'fulfilled') {
            const allJobs = jobRes.value.data || [];
            // Filter company's jobs
            const myJobs = allJobs.filter((j) => j.companyUserId === user?.id);
            setJobs(myJobs);
          }
          if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [isCandidate, user?.id]);

  // Calculate profile completeness
  const calculateCompleteness = () => {
    if (!profile) return 30;
    if (isCandidate) {
      let score = 20;
      if (profile.title) score += 15;
      if (profile.education) score += 15;
      if (profile.skills && profile.skills.length > 0) score += 20;
      if (profile.location) score += 10;
      if (profile.expectedSalary) score += 10;
      if (profile.projects && profile.projects.length > 0) score += 10;
      return Math.min(score, 100);
    } else {
      let score = 30;
      if (profile.companyName) score += 20;
      if (profile.industry) score += 20;
      if (profile.location) score += 15;
      if (profile.description) score += 15;
      return Math.min(score, 100);
    }
  };

  const completeness = calculateCompleteness();
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-8 sm:pt-10 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80 border border-white/10 shadow-2xl shadow-indigo-950/50 mt-1"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {isNewProfile
                    ? (isCandidate ? 'Profile Ready • Smart Matching Enabled' : 'Profile Ready • Talent Engine Active')
                    : (isCandidate ? 'Smart Matching Enabled' : 'Talent Engine Active')}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight">
                {isNewProfile ? 'Welcome' : 'Welcome back'},{' '}
                <span className="bg-gradient-to-r from-indigo-300 via-white to-purple-200 bg-clip-text text-transparent capitalize">
                  {user?.name?.trim()}
                </span>
              </h1>
              <p className="text-slate-400 max-w-xl text-sm sm:text-base">
                {isNewProfile
                  ? (isCandidate
                      ? 'Your profile has been created and analyzed against real employer requirements. High-compatibility opportunities will find you proactively.'
                      : 'Your company profile is now active. Post your job requirements to discover pre-evaluated candidates matched against your criteria.')
                  : (isCandidate
                      ? 'Your profile is automatically analyzed against real employer requirements. High-compatibility opportunities find you proactively.'
                      : 'Manage your job requirements and see pre-evaluated candidates matched against your exact criteria.')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isCandidate ? (
                <>
                  <Link
                    to="/profile"
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm font-semibold text-white transition-all flex items-center gap-2"
                  >
                    Edit Profile
                  </Link>
                  <Link
                    to="/matches"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                  >
                    <span>View Matches</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/jobs"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Post New Job</span>
                  </Link>
                  <Link
                    to="/matches"
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm font-semibold text-white transition-all flex items-center gap-2"
                  >
                    Candidate Matches
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            icon={Award}
            label={isCandidate ? 'Profile Completeness' : 'Company Profile'}
            value={`${completeness}%`}
            delay={0.1}
          />
          <StatsCard
            icon={Sparkles}
            label="High-Match Opportunities"
            value={matches.filter((m) => m.matchScore >= 70).length.toString()}
            delay={0.2}
          />
          <StatsCard
            icon={Briefcase}
            label={isCandidate ? 'Available Jobs' : 'Your Job Postings'}
            value={jobs.length.toString()}
            delay={0.3}
          />
          <StatsCard
            icon={Bell}
            label="Unread Notifications"
            value={unreadNotifs.toString()}
            delay={0.4}
          />
        </div>

        {/* Profile Completion Reminder if < 80% */}
        {completeness < 80 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-200">
                  Boost your matching precision by completing your profile
                </p>
                <p className="text-xs text-amber-300/70">
                  {isCandidate
                    ? 'Add projects, skills, and salary expectations to unlock 90%+ match scores.'
                    : 'Detail your company background and industry to attract top talent.'}
                </p>
              </div>
            </div>
            <Link
              to="/profile"
              className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
            >
              Complete Now →
            </Link>
          </motion.div>
        )}

        {/* Main Content Grid: Top Matches + Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Top Matches (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span>{isCandidate ? 'Top Matched Jobs' : 'Top Matched Candidates'}</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Algorithms scored these matches above 60% based on two-way criteria
                </p>
              </div>
              <Link
                to="/matches"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                <span>View all ({matches.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
                ))}
              </div>
            ) : matches.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 mx-auto flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">No matches calculated yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    {isCandidate
                      ? 'Ensure your skills and experience are saved in your profile so our matching engine can link you with employers.'
                      : 'Post a new job requirement profile to trigger automated candidate discovery.'}
                  </p>
                </div>
                <Link
                  to={isCandidate ? '/profile' : '/jobs'}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-md shadow-indigo-600/20"
                >
                  {isCandidate ? 'Update Profile' : 'Post Requirement'}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.slice(0, 4).map((match, idx) => {
                  const job = match.job || {};
                  const company = match.company || {};
                  const candidate = match.candidate || {};

                  return (
                    <AnimatedCard key={match.id || idx} delay={idx * 0.1}>
                      <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                        <div className="flex items-start gap-4">
                          <MatchCircle percentage={match.matchScore || 0} size={70} strokeWidth={6} />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 capitalize">
                                {isCandidate ? job.title || 'Job Opportunity' : candidate.name || 'Candidate'}
                              </h3>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  match.matchScore >= 80
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                }`}
                              >
                                {match.matchScore >= 80 ? 'High Fit' : 'Good Fit'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 capitalize">
                              {isCandidate
                                ? company.companyName || job.companyName || 'Verified Employer'
                                : candidate.title || 'Technical Professional'}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                              {(job.location || candidate.location) && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                  {isCandidate ? job.location : candidate.location}
                                </span>
                              )}
                              {(job.salaryMax || candidate.expectedSalary) && (
                                <span className="flex items-center gap-1 text-indigo-300">
                                  <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
                                  {isCandidate
                                    ? `₹${job.salaryMin ? `${Number(job.salaryMin).toLocaleString()} - ` : ''}₹${job.salaryMax ? Number(job.salaryMax).toLocaleString() : ''}`
                                    : `Expects: ₹${candidate.expectedSalary ? Number(candidate.expectedSalary).toLocaleString() : ''}`}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {isCandidate ? (
                            <Link
                              to={`/jobs/${job.id}`}
                              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white transition-all flex items-center gap-1.5"
                            >
                              <span>View Details</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          ) : (
                            <Link
                              to="/matches"
                              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-md shadow-indigo-600/20"
                            >
                              Review Profile
                            </Link>
                          )}
                        </div>
                      </div>
                    </AnimatedCard>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Quick Status & Relevant Activity (1 Col) */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-4">
              <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Quick Actions</span>
              </h3>

              <div className="space-y-2.5">
                <Link
                  to="/chat"
                  className="block p-3 rounded-xl bg-gradient-to-r from-indigo-900/30 to-purple-900/30 hover:from-indigo-900/50 hover:to-purple-900/50 border border-indigo-500/30 hover:border-indigo-500/50 transition-all text-xs font-semibold text-indigo-200 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Direct Hiring Channels (Chat)</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                </Link>

                {isCandidate ? (
                  <>
                    <Link
                      to="/profile"
                      className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-xs font-medium text-slate-200"
                    >
                      <div className="flex items-center justify-between">
                        <span>Edit Skills & Project Portfolio</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                    </Link>
                    <Link
                      to="/jobs"
                      className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-xs font-medium text-slate-200"
                    >
                      <div className="flex items-center justify-between">
                        <span>Explore All Active Listings</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                    </Link>
                    <Link
                      to="/matches"
                      className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-xs font-medium text-slate-200"
                    >
                      <div className="flex items-center justify-between">
                        <span>Review Two-Way Match Scores</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/jobs"
                      className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-xs font-medium text-slate-200"
                    >
                      <div className="flex items-center justify-between">
                        <span>Post a New Job Profile</span>
                        <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                    </Link>
                    <Link
                      to="/matches"
                      className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-xs font-medium text-slate-200"
                    >
                      <div className="flex items-center justify-between">
                        <span>View Matching Candidates</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                    </Link>
                    <Link
                      to="/profile"
                      className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-xs font-medium text-slate-200"
                    >
                      <div className="flex items-center justify-between">
                        <span>Edit Company Profile</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Recent Notifications Card */}
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-400" />
                  <span>Recent Alerts</span>
                </h3>
                <Link to="/notifications" className="text-xs text-indigo-400 hover:text-indigo-300">
                  All Alerts
                </Link>
              </div>

              {notifications.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">No alerts at the moment.</p>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notif, i) => (
                    <div
                      key={notif.id || i}
                      className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs space-y-1"
                    >
                      <p className="font-medium text-slate-200 leading-snug">{notif.message}</p>
                      <p className="text-[10px] text-slate-500">
                        {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : 'Just now'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SmartHire Two-Way Matching Engine Info Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/30 to-violet-900/20 border border-indigo-500/20 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Matching Algorithm
              </span>
              <h4 className="text-sm font-semibold text-white">How Two-Way Matching Works</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                SmartHire's weighted engine evaluates skills (40%), education (15%), experience (15%), location preferences (15%), and salary expectations (15%) to automatically notify both parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

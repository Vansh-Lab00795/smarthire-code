import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Briefcase,
  User,
  Check,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import AnimatedCard from '../components/AnimatedCard';

export default function Notifications() {
  const { user } = useAuth();
  const isCandidate = user?.role === 'candidate';

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const endpoint = isCandidate ? '/candidates/notifications' : '/companies/notifications';
      const res = await api.get(endpoint);
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [isCandidate]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-8 sm:pt-10 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Bell className="w-3.5 h-3.5" />
              <span>Two-Way Notification Center</span>
            </div>
            <h1 className="text-3xl font-display font-extrabold tracking-tight">
              Activity & Smart Alerts
            </h1>
            <p className="text-slate-400 text-sm max-w-xl mt-1">
              {isCandidate
                ? 'Get notified immediately when your profile satisfies an employer’s requirement criteria.'
                : 'Receive automated alerts the instant a qualified candidate is identified for your openings.'}
            </p>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={markAllRead}
              className="self-start sm:self-center px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5 text-indigo-400" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* Two-Way Flow Highlight (PPT Slide 09) */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-purple-950/60 border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              The SmartHire Difference
            </span>
            <h3 className="text-base font-bold text-white">Traditional vs SmartHire Flow</h3>
            <p className="text-xs text-slate-400">
              Traditional: Search ➔ Apply ➔ Wait 😑 &nbsp;|&nbsp;{' '}
              <strong className="text-indigo-300">SmartHire: Match ➔ Notify ➔ Connect 😎</strong>
            </p>
          </div>
          <Link
            to="/matches"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 flex-shrink-0"
          >
            <span>Review Live Matches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white/5 border border-white/10 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 mx-auto flex items-center justify-center text-indigo-400">
              <Bell className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">No notifications yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isCandidate
                ? 'When employers post positions matching your skills or when high compatibility is scored, you will receive notifications here.'
                : 'When matching candidates are identified for your job requirements, notifications will appear here automatically.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif, idx) => (
              <AnimatedCard
                key={notif.id || idx}
                delay={idx * 0.05}
                className={`p-5 transition-all ${
                  notif.read ? 'opacity-70' : 'bg-white/[0.07] border-indigo-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white leading-snug">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {notif.created_at
                              ? new Date(notif.created_at).toLocaleString()
                              : 'Recent'}
                          </span>
                        </span>
                        {!notif.read && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                            {notif.type === 'chat_message'
                              ? 'New Message'
                              : notif.type === 'mutual_accepted'
                              ? 'Chat Unlocked'
                              : 'New Match Alert'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={
                      notif.type === 'chat_message' || notif.type === 'mutual_accepted'
                        ? `/chat/${notif.matchId || ''}`
                        : '/matches'
                    }
                    className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white flex items-center gap-1 transition-colors flex-shrink-0"
                  >
                    <span>
                      {notif.type === 'chat_message' || notif.type === 'mutual_accepted'
                        ? 'Open Chat'
                        : 'View Match'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

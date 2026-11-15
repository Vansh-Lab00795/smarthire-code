import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  UserPlus,
  FileText,
  GitCompare,
  Sparkles,
  Bell,
  Handshake,
  Target,
  Search,
  LayoutGrid,
  BellRing,
  FolderKanban,
  Link2,
  Users,
  Building2,
  Briefcase,
  CheckCircle2,
  Zap,
  Shield,
  Globe,
} from 'lucide-react';
import Hero3D from '../components/Hero3D';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

/* ──────────────────── Animated Counter ──────────────────── */
function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = parseInt(target, 10);
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ──────────────────── Section Wrapper ──────────────────── */
function Section({ children, className = '', id }) {
  return (
    <section id={id} className={`py-24 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">{children}</div>
    </section>
  );
}

/* ──────────────────── Landing Page ──────────────────── */
function Landing() {
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' },
    }),
  };

  /* ── How it Works Steps ── */
  const steps = [
    { icon: UserPlus, title: 'Create Profile', desc: 'Build your structured professional profile or company page.' },
    { icon: FileText, title: 'Post Requirements', desc: 'Candidates set preferences, companies post detailed job listings.' },
    { icon: GitCompare, title: 'Smart Compare', desc: 'Our algorithm analyzes skills, experience, and preferences.' },
    { icon: Sparkles, title: 'Match Found', desc: 'Two-way matching ensures both sides are a great fit.' },
    { icon: Bell, title: 'Get Notified', desc: 'Instant notifications when a high-quality match is found.' },
    { icon: Handshake, title: 'Connect', desc: 'Both parties connect and move forward together.' },
  ];

  /* ── Features ── */
  const features = [
    { icon: Target, title: 'Two-Way Matching', desc: 'Both candidates and companies are matched based on mutual compatibility, not just one-sided applications.' },
    { icon: Search, title: 'Proactive Discovery', desc: 'Stop searching endlessly. Our AI proactively finds the best opportunities and talent for you.' },
    { icon: LayoutGrid, title: 'Structured Profiles', desc: 'Standardized, comprehensive profiles make comparison fair and thorough for everyone.' },
    { icon: BellRing, title: 'Smart Notifications', desc: 'Get alerted the moment a high-quality match is found. Never miss the perfect opportunity.' },
    { icon: FolderKanban, title: 'Project Portfolio', desc: 'Showcase your real work with detailed project entries including tech stack, role, and outcomes.' },
    { icon: Link2, title: 'Easy Connect', desc: 'Once matched, connect instantly. No endless back-and-forth — just meaningful conversations.' },
  ];

  /* ── Benefits ── */
  const candidateBenefits = [
    'Get matched to jobs that fit your skills and preferences',
    'Showcase projects, not just resumes',
    'Set salary expectations upfront',
    'Receive proactive job recommendations',
    'Track match quality with percentage scores',
  ];

  const companyBenefits = [
    'Find pre-qualified candidates automatically',
    'Post structured job requirements for better matches',
    'Review candidate projects and portfolios',
    'Reduce time-to-hire with smart filtering',
    'Two-way matching ensures candidate interest',
  ];

  /* ── Stats ── */
  const stats = [
    { value: 10000, suffix: '+', label: 'Matches Made' },
    { value: 5000, suffix: '+', label: 'Companies' },
    { value: 50000, suffix: '+', label: 'Candidates' },
    { value: 95, suffix: '%', label: 'Satisfaction Rate' },
  ];

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* ── Nav (transparent for landing) ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#020617]/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-display font-bold heading-gradient">SmartHire</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm px-5 py-2">
              Login
            </Link>
            <Link to="/register" className="btn-primary text-sm px-5 py-2">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <Hero3D />
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } },
            }}
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-slate-300">AI-Powered Employment Matching</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6"
            >
              Don&apos;t Search for Jobs.
              <br />
              <span className="heading-gradient">Let the Right Jobs Find You.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              SmartHire uses intelligent two-way matching to connect candidates with companies. Both sides get matched based on skills, preferences, and compatibility.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register?role=candidate"
                className="btn-primary text-base px-8 py-4 flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <Users className="w-5 h-5" />
                I&apos;m a Candidate
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register?role=company"
                className="btn-secondary text-base px-8 py-4 flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <Building2 className="w-5 h-5" />
                I&apos;m Hiring
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020617] to-transparent z-10" />
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <Section id="how-it-works">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
            How It <span className="heading-gradient">Works</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-slate-400 max-w-xl mx-auto">
            Six simple steps to your perfect match. Our intelligent platform handles the complexity.
          </motion.p>
        </motion.div>

        <div className="relative">
          {/* Timeline line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 lg:gap-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/20 mb-4 mx-auto">
                    <Icon className="w-6 h-6 text-indigo-400" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-600 text-xs text-white font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1">{step.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <Section className="bg-[#0f172a]/50">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
            Powerful <span className="heading-gradient">Features</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-slate-400 max-w-xl mx-auto">
            Everything you need for smarter hiring and job discovery.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -6, boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.15)' }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 transition-colors duration-300 hover:bg-white/[0.08] hover:border-white/20"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/20 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-white font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* ═══════════════════ FOR CANDIDATES / COMPANIES ═══════════════════ */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Candidates */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 lg:p-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-white">For Candidates</h3>
                <p className="text-slate-400 text-sm">Find your dream role effortlessly</p>
              </div>
            </div>
            <ul className="space-y-4">
              {candidateBenefits.map((b, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300 text-sm leading-relaxed">{b}</span>
                </motion.li>
              ))}
            </ul>
            <Link
              to="/register?role=candidate"
              className="btn-primary inline-flex items-center gap-2 mt-8 text-sm"
            >
              Get Started as Candidate
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Companies */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 lg:p-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-white">For Companies</h3>
                <p className="text-slate-400 text-sm">Hire smarter, not harder</p>
              </div>
            </div>
            <ul className="space-y-4">
              {companyBenefits.map((b, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-violet-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300 text-sm leading-relaxed">{b}</span>
                </motion.li>
              ))}
            </ul>
            <Link
              to="/register?role=company"
              className="inline-flex items-center gap-2 mt-8 text-sm bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25 active:scale-95"
            >
              Get Started as Company
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <Section className="bg-[#0f172a]/50">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
              Trusted by <span className="heading-gradient">Thousands</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Our platform connects talent with opportunity at scale.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                custom={i}
                className="text-center p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
              >
                <p className="text-3xl sm:text-4xl font-display font-bold heading-gradient mb-2">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-purple-600/20 border border-indigo-500/20 p-12 sm:p-16 text-center"
        >
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-slate-300">Start Matching Today</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
              Ready to Find Your <span className="heading-gradient">Perfect Match?</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-8 text-lg">
              Join thousands of candidates and companies already using SmartHire to make smarter hiring decisions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-base px-8 py-4 flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-secondary text-base px-8 py-4">
                Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}

export default Landing;

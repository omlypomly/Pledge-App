"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Trophy,
  Users,
  Target,
  CheckCircle2,
  TrendingUp,
  Shield,
  Star,
  ArrowRight,
  Zap,
  Brain,
  Vote,
  Scale,
  Dumbbell,
  Bike,
  PiggyBank,
  Cigarette,
  BookOpen,
  Code2,
  Moon,
  Apple,
  ChevronRight,
  DollarSign,
  Flame,
  Award,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface StatCard {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

interface Step {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface GoalCategory {
  emoji: string;
  icon: React.ReactNode;
  title: string;
  example: string;
  stake: string;
  color: string;
}

interface Testimonial {
  name: string;
  handle: string;
  avatar: string;
  text: string;
  amount: string;
  challenge: string;
  rating: number;
}

/* ─────────────────────────────────────────────
   ANIMATION HELPERS
───────────────────────────────────────────── */
function FadeInWhenVisible({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SlideInWhenVisible({
  children,
  delay = 0,
  direction = "left",
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "left" | "right";
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const x = direction === "left" ? -40 : 40;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   LANDING NAVBAR
───────────────────────────────────────────── */
function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Leaderboard", href: "#leaderboard" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#080810]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/40"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg shadow-violet-500/40">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-violet-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            StakeUp
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-white/60 hover:text-white transition-colors font-medium"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/sign-in"
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="md:hidden bg-[#0d0d1a]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 pb-4 space-y-1"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/sign-in"
              className="block px-3 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg text-center transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="block px-3 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white text-center"
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}

/* ─────────────────────────────────────────────
   HERO SECTION
───────────────────────────────────────────── */
const heroStats: StatCard[] = [
  {
    value: "$2.4M",
    label: "Paid Out",
    icon: <DollarSign className="w-4 h-4" />,
    color: "from-green-500/20 to-emerald-500/10 border-green-500/20",
  },
  {
    value: "94%",
    label: "Completion Rate",
    icon: <TrendingUp className="w-4 h-4" />,
    color: "from-violet-500/20 to-purple-500/10 border-violet-500/20",
  },
  {
    value: "12,000+",
    label: "Challengers",
    icon: <Users className="w-4 h-4" />,
    color: "from-pink-500/20 to-rose-500/10 border-pink-500/20",
  },
];

function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-grid pt-16">
      {/* Background glowing orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full bg-pink-600/8 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-purple-900/10 blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-sm font-medium mb-8"
        >
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span>Real money. Real accountability. Real results.</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.08]"
        >
          Put Your Money{" "}
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Where Your Goals Are
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto text-lg sm:text-xl text-white/55 mb-10 leading-relaxed"
        >
          Challenge yourself and your friends, stake real money, and let financial
          accountability do what willpower alone can't. Hit your milestones — or
          pay the price.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            href="/sign-up"
            className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-base transition-all duration-200 shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5"
          >
            Start a Challenge
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/15 text-white/80 hover:text-white hover:border-white/30 hover:bg-white/5 font-semibold text-base transition-all duration-200"
          >
            See How It Works
            <ChevronRight className="w-4 h-4" />
          </a>
        </motion.div>

        {/* Floating Stats */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {heroStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeInOut",
              }}
              className={cn(
                "flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-br border backdrop-blur-sm",
                stat.color
              )}
            >
              <div className="text-white/50">{stat.icon}</div>
              <div className="text-left">
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/50 font-medium">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080810] to-transparent pointer-events-none" />
    </section>
  );
}

/* ─────────────────────────────────────────────
   HOW IT WORKS SECTION
───────────────────────────────────────────── */
const steps: Step[] = [
  {
    number: "01",
    icon: <Target className="w-6 h-6" />,
    title: "Create a Challenge",
    description:
      "Define your goal, set a deadline, and choose a stake amount. Be specific — lose 20 lbs, run a 5K, finish a course.",
  },
  {
    number: "02",
    icon: <Users className="w-6 h-6" />,
    title: "Invite Friends & Stake",
    description:
      "Share your invite link. Everyone puts in their stake — credit card charged upfront, held securely in escrow.",
  },
  {
    number: "03",
    icon: <CheckCircle2 className="w-6 h-6" />,
    title: "Hit Your Milestones",
    description:
      "Submit evidence at each checkpoint. AI + community verification keeps everyone honest. Miss one — you're eliminated.",
  },
  {
    number: "04",
    icon: <Award className="w-6 h-6" />,
    title: "Winners Split the Pool",
    description:
      "At the end, everyone who completed their challenge splits the prize pool equally. Fail? Your stake goes to the winners.",
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <FadeInWhenVisible className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-sm font-medium mb-4">
            <Zap className="w-3.5 h-3.5" />
            Simple by design
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            How It Works
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Four steps stand between you and a life-changing habit. The stakes
            make sure you follow through.
          </p>
        </FadeInWhenVisible>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <FadeInWhenVisible key={step.number} delay={i * 0.1}>
              <div className="relative group h-full p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-violet-500/30 hover:bg-violet-500/[0.04] transition-all duration-300">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-6 h-px bg-gradient-to-r from-violet-500/40 to-transparent z-10" />
                )}

                {/* Step number */}
                <span className="text-5xl font-black text-white/[0.04] absolute top-4 right-5 select-none">
                  {step.number}
                </span>

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/30 to-purple-600/20 border border-violet-500/25 flex items-center justify-center text-violet-400 mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-violet-500/10">
                  {step.icon}
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{step.description}</p>
              </div>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   GOAL CATEGORIES SECTION
───────────────────────────────────────────── */
const goalCategories: GoalCategory[] = [
  {
    emoji: "💪",
    icon: <Dumbbell className="w-5 h-5" />,
    title: "Fitness & Weight Loss",
    example: "Lose 30 lbs in 6 months",
    stake: "$100/person",
    color: "from-orange-500/10 to-amber-500/5 border-orange-500/15",
  },
  {
    emoji: "🚴",
    icon: <Bike className="w-5 h-5" />,
    title: "Running & Cycling",
    example: "Complete a half-marathon",
    stake: "$75/person",
    color: "from-blue-500/10 to-cyan-500/5 border-blue-500/15",
  },
  {
    emoji: "💰",
    icon: <PiggyBank className="w-5 h-5" />,
    title: "Save Money",
    example: "Save $5,000 in 3 months",
    stake: "$50/person",
    color: "from-green-500/10 to-emerald-500/5 border-green-500/15",
  },
  {
    emoji: "🚭",
    icon: <Cigarette className="w-5 h-5" />,
    title: "Quit Smoking",
    example: "100 smoke-free days",
    stake: "$200/person",
    color: "from-red-500/10 to-rose-500/5 border-red-500/15",
  },
  {
    emoji: "📚",
    icon: <BookOpen className="w-5 h-5" />,
    title: "Read Books",
    example: "Read 24 books this year",
    stake: "$30/person",
    color: "from-purple-500/10 to-violet-500/5 border-purple-500/15",
  },
  {
    emoji: "💻",
    icon: <Code2 className="w-5 h-5" />,
    title: "Learn to Code",
    example: "Ship a full-stack app",
    stake: "$150/person",
    color: "from-violet-500/10 to-indigo-500/5 border-violet-500/15",
  },
  {
    emoji: "🌙",
    icon: <Moon className="w-5 h-5" />,
    title: "Better Sleep",
    example: "8 hrs sleep for 90 days",
    stake: "$60/person",
    color: "from-indigo-500/10 to-blue-500/5 border-indigo-500/15",
  },
  {
    emoji: "🥗",
    icon: <Apple className="w-5 h-5" />,
    title: "Healthy Eating",
    example: "30-day clean eating streak",
    stake: "$80/person",
    color: "from-lime-500/10 to-green-500/5 border-lime-500/15",
  },
];

function ChallengeTypesSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent">
      <div className="max-w-7xl mx-auto">
        <FadeInWhenVisible className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/25 text-pink-300 text-sm font-medium mb-4">
            <Star className="w-3.5 h-3.5" />
            Any goal. Any stakes.
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            What You Can Challenge
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            From fitness to finances, any measurable goal works. If you can
            prove it, you can stake it.
          </p>
        </FadeInWhenVisible>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {goalCategories.map((cat, i) => (
            <FadeInWhenVisible key={cat.title} delay={(i % 4) * 0.08}>
              <div
                className={cn(
                  "group p-5 rounded-2xl bg-gradient-to-br border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10 cursor-pointer",
                  cat.color
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{cat.emoji}</span>
                  <h3 className="font-bold text-white text-sm leading-tight">
                    {cat.title}
                  </h3>
                </div>
                <p className="text-white/60 text-xs mb-3 leading-relaxed">
                  {cat.example}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-violet-300 bg-violet-500/10 px-2.5 py-1 rounded-full">
                    Stake: {cat.stake}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/25 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all duration-200" />
                </div>
              </div>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   VERIFICATION SECTION
───────────────────────────────────────────── */
function VerificationSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <FadeInWhenVisible className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/25 text-green-300 text-sm font-medium mb-4">
            <Shield className="w-3.5 h-3.5" />
            Triple-layer trust system
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Bulletproof Verification
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Every milestone submission goes through three independent layers
            before a winner is declared.
          </p>
        </FadeInWhenVisible>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Layers */}
          <div className="space-y-5">
            {[
              {
                icon: <Brain className="w-6 h-6" />,
                title: "AI Analysis",
                description:
                  "Our model analyses photo/video evidence, checks metadata, and cross-references fitness tracker data for a confidence score.",
                tag: "94% avg confidence",
                color: "violet",
              },
              {
                icon: <Vote className="w-6 h-6" />,
                title: "Community Vote",
                description:
                  "Challenge participants and community members review borderline submissions. Majority rules — democratic and transparent.",
                tag: "Majority rules",
                color: "blue",
              },
              {
                icon: <Scale className="w-6 h-6" />,
                title: "Dispute Resolution",
                description:
                  "If someone challenges a result, our moderation team reviews all evidence within 48 hours and makes a final binding decision.",
                tag: "48hr turnaround",
                color: "pink",
              },
            ].map((item, i) => (
              <SlideInWhenVisible key={item.title} delay={i * 0.12} direction="left">
                <div className="flex gap-4 p-5 rounded-2xl bg-white/[0.025] border border-white/[0.06] hover:border-white/10 transition-colors">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                      item.color === "violet"
                        ? "bg-violet-500/15 text-violet-400"
                        : item.color === "blue"
                        ? "bg-blue-500/15 text-blue-400"
                        : "bg-pink-500/15 text-pink-400"
                    )}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white">{item.title}</h3>
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          item.color === "violet"
                            ? "bg-violet-500/15 text-violet-300"
                            : item.color === "blue"
                            ? "bg-blue-500/15 text-blue-300"
                            : "bg-pink-500/15 text-pink-300"
                        )}
                      >
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </SlideInWhenVisible>
            ))}
          </div>

          {/* Right: Mock AI Verification Card */}
          <SlideInWhenVisible direction="right" delay={0.15}>
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 rounded-3xl bg-violet-600/10 blur-2xl scale-90" />

              <div className="relative p-7 rounded-3xl bg-[#0d0d1a] border border-violet-500/25 shadow-2xl shadow-violet-500/10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-0.5">
                      AI Verification
                    </p>
                    <h3 className="font-bold text-white">Milestone Review</h3>
                  </div>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 text-sm font-semibold">
                    <Brain className="w-3.5 h-3.5" />
                    AI
                  </span>
                </div>

                {/* Submission details */}
                <div className="mb-5 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20 flex items-center justify-center text-lg shrink-0">
                      💪
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Weight Loss — Week 8 Check-in
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        Submitted by Alex M. · 2 minutes ago
                      </p>
                    </div>
                  </div>
                </div>

                {/* Checks */}
                <div className="space-y-3 mb-6">
                  {[
                    { label: "Photo metadata verified", pass: true },
                    { label: "Weight delta plausible (−2.3 lbs)", pass: true },
                    { label: "Fitness tracker sync", pass: true },
                    { label: "Duplicate detection", pass: true },
                    { label: "Timeline consistency", pass: true },
                  ].map((check) => (
                    <div key={check.label} className="flex items-center gap-3">
                      <CheckCircle2
                        className={cn(
                          "w-4 h-4 shrink-0",
                          check.pass ? "text-green-400" : "text-red-400"
                        )}
                      />
                      <span className="text-sm text-white/60">{check.label}</span>
                    </div>
                  ))}
                </div>

                {/* Confidence meter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                      Confidence Score
                    </span>
                    <span className="text-2xl font-black text-green-400">94%</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/[0.05] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                      initial={{ width: 0 }}
                      whileInView={{ width: "94%" }}
                      transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                      viewport={{ once: true }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/25 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Decision */}
                <div className="mt-5 p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-300">
                      Approved — Milestone Passed
                    </p>
                    <p className="text-xs text-white/40">
                      Auto-approved · Above 85% threshold
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SlideInWhenVisible>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   TESTIMONIALS SECTION
───────────────────────────────────────────── */
const testimonials: Testimonial[] = [
  {
    name: "Jordan Rivera",
    handle: "@jordanfit94",
    avatar: "JR",
    text: "I'd tried losing weight for 3 years. StakeUp made it click — having $300 on the line and 5 friends watching every weigh-in is motivation I couldn't manufacture myself. Lost 28 lbs and split $1,800 with two others.",
    amount: "+$600",
    challenge: "Weight Loss — 6mo",
    rating: 5,
  },
  {
    name: "Marcus Chen",
    handle: "@mchen_builds",
    avatar: "MC",
    text: "Me and my coworkers did a 'ship your side project' challenge. $250 each, 8 people, 90 days. The ones who shipped split $1,800. I finally launched my SaaS. Two of us are making money from it now.",
    amount: "+$900",
    challenge: "Build a Project — 90d",
    rating: 5,
  },
  {
    name: "Priya Nair",
    handle: "@priya_saves",
    avatar: "PN",
    text: "I used to be terrible at saving. Put $200 in a StakeUp savings challenge with 4 friends — had to prove monthly bank statements. Saved $6k in 4 months for the first time ever AND won an extra $320.",
    amount: "+$320",
    challenge: "Save $6k — 4mo",
    rating: 5,
  },
  {
    name: "Tyler Brooks",
    handle: "@tylerquits",
    avatar: "TB",
    text: "Quit smoking after 11 years. Every week without a cigarette I had to check in. The $400 stake was terrifying — but that terror is exactly what kept me from lighting up when cravings hit hardest.",
    amount: "+$1,200",
    challenge: "Quit Smoking — 100d",
    rating: 5,
  },
];

function TestimonialsSection() {
  return (
    <section
      id="leaderboard"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent"
    >
      <div className="max-w-7xl mx-auto">
        <FadeInWhenVisible className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-sm font-medium mb-4">
            <Trophy className="w-3.5 h-3.5" />
            Real winners. Real money.
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            They Put It on the Line
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Thousands of challengers have used financial stakes to achieve goals
            they never could with apps and journals alone.
          </p>
        </FadeInWhenVisible>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <FadeInWhenVisible key={t.handle} delay={i * 0.1}>
              <div className="h-full p-6 rounded-2xl bg-white/[0.025] border border-white/[0.07] hover:border-violet-500/20 transition-all duration-300">
                {/* Top bar */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{t.name}</p>
                      <p className="text-xs text-white/35">{t.handle}</p>
                    </div>
                  </div>
                  {/* Win badge */}
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-black text-green-400">{t.amount}</span>
                    <span className="text-[10px] text-white/35 font-medium">{t.challenge}</span>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-white/60 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              </div>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   PRICING SECTION
───────────────────────────────────────────── */
function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <FadeInWhenVisible className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-sm font-medium mb-4">
            <DollarSign className="w-3.5 h-3.5" />
            Simple, transparent pricing
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            No Surprises
          </h2>
          <p className="text-white/50 text-lg max-w-lg mx-auto">
            We take a 10% platform fee from the prize pool when a challenge
            completes. Winners keep the rest. That&apos;s it.
          </p>
        </FadeInWhenVisible>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Tier */}
          <FadeInWhenVisible delay={0.05}>
            <div className="h-full p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col">
              <div className="mb-6">
                <p className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-2">
                  Free
                </p>
                <div className="flex items-end gap-1 mb-3">
                  <span className="text-5xl font-black text-white">$0</span>
                  <span className="text-white/40 mb-2">/month</span>
                </div>
                <p className="text-white/50 text-sm">
                  Everything you need to get started with real accountability.
                </p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {[
                  "1 active challenge at a time",
                  "Up to 10 participants per challenge",
                  "AI verification included",
                  "Basic leaderboard",
                  "Community voting",
                  "10% platform fee on winnings",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white/60">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className="block w-full py-3 rounded-xl border border-white/15 text-white/80 hover:text-white hover:border-white/30 hover:bg-white/5 font-semibold text-sm text-center transition-all duration-200"
              >
                Get Started Free
              </Link>
            </div>
          </FadeInWhenVisible>

          {/* Pro Tier */}
          <FadeInWhenVisible delay={0.15}>
            <div className="h-full p-8 rounded-2xl bg-gradient-to-b from-violet-600/15 to-purple-600/5 border border-violet-500/35 flex flex-col relative overflow-hidden">
              {/* Popular badge */}
              <div className="absolute top-5 right-5">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-semibold shadow-lg shadow-violet-500/30">
                  Most Popular
                </span>
              </div>

              {/* Glow */}
              <div className="absolute top-0 right-0 w-60 h-60 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="mb-6 relative">
                <p className="text-sm font-semibold text-violet-300 uppercase tracking-wider mb-2">
                  Pro
                </p>
                <div className="flex items-end gap-1 mb-3">
                  <span className="text-5xl font-black text-white">$9.99</span>
                  <span className="text-white/40 mb-2">/month</span>
                </div>
                <p className="text-white/50 text-sm">
                  For serious challengers who want unlimited reach and deep insights.
                </p>
              </div>

              <ul className="space-y-3 flex-1 mb-8 relative">
                {[
                  "Unlimited active challenges",
                  "Unlimited participants",
                  "AI verification included",
                  "Advanced analytics & insights",
                  "Priority dispute resolution",
                  "Custom challenge templates",
                  "Private group challenges",
                  "Reduced 7% platform fee",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up?plan=pro"
                className="relative block w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-sm text-center transition-all duration-200 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50"
              >
                Start Pro Free for 7 Days
              </Link>
            </div>
          </FadeInWhenVisible>
        </div>

        {/* Fee explainer */}
        <FadeInWhenVisible delay={0.2}>
          <div className="mt-8 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm mb-0.5">
                How the 10% platform fee works
              </p>
              <p className="text-sm text-white/45 leading-relaxed">
                Example: 8 friends stake $100 each = $800 pool. StakeUp keeps
                $80 (10%). If 3 people complete the challenge, they each get{" "}
                <strong className="text-white/70">$240</strong> — 2.4× their
                stake back. Lose? Your $100 goes to the winners.
              </p>
            </div>
          </div>
        </FadeInWhenVisible>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer() {
  const footerLinks = {
    Product: ["How It Works", "Pricing", "Leaderboard", "Changelog"],
    Company: ["About", "Blog", "Careers", "Press"],
    Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
    Support: ["Help Center", "Discord", "Contact Us", "Status"],
  };

  return (
    <footer className="border-t border-white/[0.06] bg-[#080810]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent">
                StakeUp
              </span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed">
              Accountability challenges with real financial stakes. Put your
              money where your goals are.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white/70 mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/35 hover:text-white/70 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/25">
            © 2026 StakeUp, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-sm text-white/25">
            <span>Built with</span>
            <span className="text-red-400">♥</span>
            <span>for people serious about their goals.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   PAGE ROOT
───────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <LandingNavbar />
      <HeroSection />
      <HowItWorksSection />
      <ChallengeTypesSection />
      <VerificationSection />
      <TestimonialsSection />
      <PricingSection />
      <Footer />
    </div>
  );
}

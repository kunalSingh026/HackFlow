import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Trophy, 
  MapPin, 
  Ticket, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Layers, 
  Compass, 
  Clock 
} from 'lucide-react';

// --- 3D TILT CONTAINER COMPONENT ---
const TiltCard = ({ children, className = '' }) => {
  const cardRef = useRef(null);
  const x = useMotionValue(200);
  const y = useMotionValue(100);

  const rotateX = useTransform(y, [0, 200], [8, -8]);
  const rotateY = useTransform(x, [0, 400], [-8, 8]);

  const handleMouseMove = (event) => {
    const element = cardRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(200);
    y.set(100);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: rotateX,
        rotateY: rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
      className={`glass-card rounded-2xl border border-[rgba(175,172,202,0.15)] bg-[rgba(89,83,136,0.06)] p-6 shadow-2xl transition-all duration-300 ease-out hover:border-[rgba(175,172,202,0.3)] ${className}`}
    >
      <div style={{ transform: 'translateZ(30px)' }} className="h-full">
        {children}
      </div>
    </motion.div>
  );
};

const LandingPage = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  };

  const staggerContainer = {
    initial: {},
    whileInView: { transition: { staggerChildren: 0.1 } },
    viewport: { once: true }
  };

  return (
    <div className="min-h-screen bg-[#08070d] text-[#f7f6f0] selection:bg-[#595388] selection:text-[#f7f6f0]">
      
      {/* ── Navbar ── */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(175,172,202,0.1)] bg-[#08070d]/80 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#595388] shadow-md shadow-[#595388]/30">
              <Layers size={18} className="text-[#f7f6f0]" />
            </div>
            <span className="font-display text-lg font-bold tracking-widest text-[#f7f6f0]">
              HACK<span className="text-[#afacca]">.</span>FLOW
            </span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-[#afacca] transition-colors hover:text-[#f7f6f0]">Features</a>
            <Link to="/events" className="text-sm font-medium text-[#afacca] transition-colors hover:text-[#f7f6f0]">Explore Events</Link>
            <a href="#itinerary" className="text-sm font-medium text-[#afacca] transition-colors hover:text-[#f7f6f0]">Digital Venues</a>
            <a href="#pricing" className="text-sm font-medium text-[#afacca] transition-colors hover:text-[#f7f6f0]">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-[#afacca] transition-colors hover:text-[#f7f6f0]">
              Sign In
            </Link>
            <Link to="/login" className="flex items-center gap-2 rounded-xl bg-[#595388] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#f7f6f0] shadow-lg shadow-[#595388]/30 transition-all duration-300 hover:bg-[#6e67a7] hover:scale-105">
              Host Event
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Ambient Background Glows ── */}
      <div className="absolute top-0 left-0 right-0 h-[600px] overflow-hidden pointer-events-none">
        <div className="absolute -top-[200px] left-1/4 h-[500px] w-[500px] rounded-full bg-[#595388]/15 blur-[120px]" />
        <div className="absolute top-[100px] right-1/4 h-[400px] w-[400px] rounded-full bg-[#afacca]/10 blur-[100px]" />
      </div>

      {/* ── Hero Section ── */}
      <section className="relative mx-auto max-w-7xl px-6 pt-32 pb-24 md:pt-44 md:pb-36">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          
          {/* Left Text */}
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(175,172,202,0.2)] bg-[#595388]/10 px-4 py-1.5 text-xs font-semibold text-[#afacca]"
            >
              <Calendar size={12} className="text-[#afacca]" />
              Unified Event Management
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mt-6 font-display text-5xl font-extrabold leading-[1.08] tracking-tight text-[#f7f6f0] md:text-7xl"
            >
              Host premium hackathons <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#afacca] via-[#595388] to-[#f7f6f0]">
                with zero stress.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-[#afacca]"
            >
              Create public or college-exclusive events. From smart registration limits and team matchmaking to live agendas and scoring panels, HackFlow runs your entire tech event pipeline.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link to="/login" className="group flex items-center gap-2 rounded-xl bg-[#595388] px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-[#f7f6f0] shadow-xl shadow-[#595388]/30 transition-all duration-300 hover:bg-[#6c65a4] hover:shadow-[#595388]/40 hover:-translate-y-0.5">
                Host an Event
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/events" className="flex items-center gap-2 rounded-xl border border-[rgba(175,172,202,0.2)] bg-transparent px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-[#f7f6f0] transition-all duration-300 hover:bg-[rgba(175,172,202,0.05)]">
                Explore Hackathons
                <Compass size={14} />
              </Link>
            </motion.div>

            {/* Quick Stats */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-12 grid grid-cols-3 gap-6 border-t border-[rgba(175,172,202,0.1)] pt-8"
            >
              <div>
                <p className="font-display text-3xl font-bold text-[#f7f6f0]">250+</p>
                <p className="text-xs text-[#afacca] mt-1">Events Hosted</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-[#f7f6f0]">45,000</p>
                <p className="text-xs text-[#afacca] mt-1">Total Registrations</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-[#f7f6f0]">INR 0</p>
                <p className="text-xs text-[#afacca] mt-1">Platform Fees</p>
              </div>
            </motion.div>
          </div>

          {/* Right 3D Tilt Mockup Card (Event Dashboard Mockup) */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <TiltCard className="relative overflow-hidden">
                {/* Event Title Header */}
                <div className="flex items-center justify-between border-b border-[rgba(175,172,202,0.12)] pb-4">
                  <div className="flex flex-col">
                    <span className="font-display font-bold text-sm text-[#f7f6f0]">Global AI Hackathon 2026</span>
                    <span className="text-[10px] text-[#afacca] mt-0.5">Hosted by IIT Bombay Chapter</span>
                  </div>
                  <span className="rounded-md bg-green-500/15 border border-green-500/30 px-2 py-0.5 font-display text-[9px] text-green-400 font-bold uppercase tracking-wider">ONGOING</span>
                </div>

                {/* Dashboard layout inside Mockup */}
                <div className="mt-5 space-y-4">
                  
                  {/* Seat availability Progress */}
                  <div className="rounded-lg bg-[#08070d]/50 p-3 border border-[rgba(175,172,202,0.05)]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#afacca]">Seat Capacity (Registration Status)</span>
                      <span className="font-bold text-[#f7f6f0]">482 / 500 Seats Filled</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-[#595388]/20">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "96.4%" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-1.5 rounded-full bg-[#595388]" 
                      />
                    </div>
                  </div>

                  {/* Quick Metadata Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-[#08070d]/50 p-2.5 border border-[rgba(175,172,202,0.05)]">
                      <span className="block text-[9px] text-[#afacca] uppercase tracking-wider">Registration Mode</span>
                      <span className="text-xs font-bold text-[#f7f6f0] mt-1 block">Hybrid Venue</span>
                    </div>
                    <div className="rounded-lg bg-[#08070d]/50 p-2.5 border border-[rgba(175,172,202,0.05)]">
                      <span className="block text-[9px] text-[#afacca] uppercase tracking-wider">Event Fee</span>
                      <span className="text-xs font-bold text-green-400 mt-1 block">Free Ticket</span>
                    </div>
                  </div>

                  {/* Interactive Active Itinerary milestones */}
                  <div className="rounded-lg bg-[#08070d]/90 p-4 border border-[rgba(175,172,202,0.08)]">
                    <span className="block text-[9px] font-bold text-[#afacca] uppercase tracking-widest mb-2.5">Active Itinerary Timeline</span>
                    <div className="space-y-3 font-display text-[11px]">
                      <div className="flex gap-2.5 items-start">
                        <Clock size={12} className="text-[#afacca] mt-0.5" />
                        <div>
                          <p className="text-[#f7f6f0] font-semibold">Pitching Workshop</p>
                          <p className="text-[10px] text-[#afacca]">10:00 AM - Mentors Lounge Zoom</p>
                        </div>
                      </div>
                      <div className="flex gap-2.5 items-start border-t border-[rgba(175,172,202,0.05)] pt-2.5">
                        <Clock size={12} className="text-[#595388] mt-0.5" />
                        <div>
                          <p className="text-[#afacca]">Final Submission Deadline</p>
                          <p className="text-[10px] text-[#afacca]/60">11:59 PM - Project Portal</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24 border-t border-[rgba(175,172,202,0.05)]">
        <motion.div 
          {...fadeInUp}
          className="text-center"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-[#afacca]">Features</span>
          <h2 className="mt-4 font-display text-4xl font-extrabold text-[#f7f6f0] md:text-5xl">
            Complete Hackathon Architecture.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#afacca]">
            A SaaS command center equipping event hosts with custom registrations, team management, and scoring structures.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          
          <motion.div variants={fadeInUp} className="glass-card glass-card-hover rounded-2xl p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#595388]/20 text-[#f7f6f0] border border-[rgba(175,172,202,0.1)]">
              <Calendar size={20} />
            </div>
            <h3 className="mt-5 font-display text-xl font-bold text-[#f7f6f0]">Easy Event Hosting</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#afacca]">
              Set up detailed descriptions, category tags, banner images, and ticketing settings (seats and pricing details).
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="glass-card glass-card-hover rounded-2xl p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#595388]/20 text-[#f7f6f0] border border-[rgba(175,172,202,0.1)]">
              <Users size={20} />
            </div>
            <h3 className="mt-5 font-display text-xl font-bold text-[#f7f6f0]">Team Formations</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#afacca]">
              Form teams or find team builders. Group participants together and control member limits automatically.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="glass-card glass-card-hover rounded-2xl p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#595388]/20 text-[#f7f6f0] border border-[rgba(175,172,202,0.1)]">
              <Compass size={20} />
            </div>
            <h3 className="mt-5 font-display text-xl font-bold text-[#f7f6f0]">Digital Venue Channels</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#afacca]">
              Configure platform meeting links (Zoom, Google Meet, Discord) and organize direct lounge pathways for mentors and speakers.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="glass-card glass-card-hover rounded-2xl p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#595388]/20 text-[#f7f6f0] border border-[rgba(175,172,202,0.1)]">
              <Clock size={20} />
            </div>
            <h3 className="mt-5 font-display text-xl font-bold text-[#f7f6f0]">Interactive Itinerary</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#afacca]">
              Keep everyone on schedule with live itineraries, speaker alerts, and calendar links embedded into the hacker workspace.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="glass-card glass-card-hover rounded-2xl p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#595388]/20 text-[#f7f6f0] border border-[rgba(175,172,202,0.1)]">
              <ShieldAlert size={20} />
            </div>
            <h3 className="mt-5 font-display text-xl font-bold text-[#f7f6f0]">Exclusive College Portals</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#afacca]">
              Toggle visibility parameters to restrict registrations to pre-approved university domains or specific colleges.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="glass-card glass-card-hover rounded-2xl p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#595388]/20 text-[#f7f6f0] border border-[rgba(175,172,202,0.1)]">
              <Trophy size={20} />
            </div>
            <h3 className="mt-5 font-display text-xl font-bold text-[#f7f6f0]">Judging & Grading Panel</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#afacca]">
              Add designated judges who can evaluate final submissions and assign scoring values inside the secure HackFlow portal.
            </p>
          </motion.div>

        </motion.div>
      </section>

      {/* ── Call to Action ── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <motion.div 
          {...fadeInUp}
          className="relative overflow-hidden rounded-3xl border border-[rgba(175,172,202,0.15)] bg-gradient-to-br from-[#595388]/15 via-transparent to-[#afacca]/5 px-8 py-16 text-center shadow-3xl"
        >
          <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-[#595388]/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-[#afacca]/10 blur-3xl" />
          
          <h2 className="font-display text-3xl font-extrabold text-[#f7f6f0] md:text-5xl">
            Host your next event with HackFlow
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[#afacca]">
            Launch customizable workspaces, invite judges, and manage registrations. No fee required.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/login" className="flex items-center gap-2 rounded-xl bg-[#595388] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#f7f6f0] transition-all duration-300 hover:bg-[#6a63a0] hover:scale-105">
              Launch Event Creator
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[rgba(175,172,202,0.05)] py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-between gap-6 md:flex-row md:justify-between text-xs text-[#afacca]">
          <div>
            <p className="font-semibold text-[#f7f6f0]">© 2026 HackFlow Inc. All rights reserved.</p>
            <p className="mt-1">Designed for university, community, and corporate hackathons.</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#f7f6f0]">Terms</a>
            <a href="#" className="hover:text-[#f7f6f0]">Privacy</a>
            <a href="#" className="hover:text-[#f7f6f0]">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

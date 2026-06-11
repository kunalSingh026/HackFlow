import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  LogOut,
  Users,
  Clock,
  UploadCloud,
  Terminal,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Mail,
} from 'lucide-react';

const PresentationIcon = ({ size = 24, className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect width="18" height="12" x="3" y="4" rx="2" />
    <path d="M7 20h10" />
    <path d="M12 16v4" />
    <path d="M9 8h6" />
    <path d="M9 12h3" />
  </svg>
);

const Github = ({ size = 24, className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Youtube = ({ size = 24, className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

const TeamDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Core state variables
  const [registrations, setRegistrations] = useState([]);
  const [team, setTeam] = useState(null);
  const [allEvents, setAllEvents] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  // Selected registration event
  const [selectedEventId, setSelectedEventId] = useState('');
  const [invitations, setInvitations] = useState([]);
  const [availableParticipants, setAvailableParticipants] = useState([]);
  const [scoutSearchQuery, setScoutSearchQuery] = useState('');
  const [scoutRoleFilter, setScoutRoleFilter] = useState('');
  const [scoutPage, setScoutPage] = useState(1);
  const [scoutTotalPages, setScoutTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    githubLink: '',
    demoVideo: '',
    presentationLink: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Team creation and join request states
  const [newTeamName, setNewTeamName] = useState('');
  const [teamIdToJoin, setTeamIdToJoin] = useState('');
  const [teamActionLoading, setTeamActionLoading] = useState(false);
  const [teamActionStatus, setTeamActionStatus] = useState(null);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim() || !selectedEventId) return;
    setTeamActionLoading(true);
    setTeamActionStatus(null);
    try {
      const res = await api.post(`/teams/event/${selectedEventId}`, { name: newTeamName });
      if (res.data.team) {
        setTeam(res.data.team);
        setTeamActionStatus({
          type: 'success',
          message: res.data.message || 'Team created successfully!',
        });
        setNewTeamName('');
        fetchEventSpecificData();
      }
    } catch (err) {
      setTeamActionStatus({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to create team.',
      });
    } finally {
      setTeamActionLoading(false);
    }
  };

  const handleRequestJoinTeam = async (e) => {
    e.preventDefault();
    if (!teamIdToJoin.trim()) return;
    setTeamActionLoading(true);
    setTeamActionStatus(null);
    try {
      const res = await api.post(`/teams/${teamIdToJoin.trim()}/request`);
      setTeamActionStatus({
        type: 'success',
        message:
          res.data.message || 'Request to join sent successfully! The leader has been notified.',
      });
      setTeamIdToJoin('');
    } catch (err) {
      setTeamActionStatus({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to request to join.',
      });
    } finally {
      setTeamActionLoading(false);
    }
  };

  const handleInviteUser = async (targetUserId) => {
    if (!team) return;
    setTeamActionLoading(true);
    setTeamActionStatus(null);
    try {
      const res = await api.post(`/teams/${team._id}/invite/${targetUserId}`);
      setTeamActionStatus({
        type: 'success',
        message: res.data.message || 'Invitation sent successfully!',
      });
      fetchEventSpecificData();
      fetchAvailableParticipants();
    } catch (err) {
      setTeamActionStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to send invitation.',
      });
    } finally {
      setTeamActionLoading(false);
    }
  };

  const handleAcceptInvite = async (inviteTeamId) => {
    setTeamActionLoading(true);
    setTeamActionStatus(null);
    try {
      const res = await api.post(`/teams/${inviteTeamId}/accept-invite`);
      setTeamActionStatus({
        type: 'success',
        message: res.data.message || 'Joined team successfully!',
      });
      fetchEventSpecificData();
    } catch (err) {
      setTeamActionStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to accept invitation.',
      });
    } finally {
      setTeamActionLoading(false);
    }
  };

  const handleRejectInvite = async (inviteTeamId) => {
    setTeamActionLoading(true);
    setTeamActionStatus(null);
    try {
      const res = await api.post(`/teams/${inviteTeamId}/reject-invite`);
      setTeamActionStatus({
        type: 'success',
        message: res.data.message || 'Declined invitation.',
      });
      fetchEventSpecificData();
    } catch (err) {
      setTeamActionStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to decline invitation.',
      });
    } finally {
      setTeamActionLoading(false);
    }
  };

  // Initialize and fetch core registrations and events
  useEffect(() => {
    const fetchCoreData = async () => {
      try {
        const [regRes, eventsRes] = await Promise.all([
          api.get('/events/my-registrations'),
          api.get('/events?limit=100'),
        ]);

        if (regRes.data.success) {
          const regs = regRes.data.registrations || [];
          setRegistrations(regs);
          if (regs.length > 0) {
            setSelectedEventId(regs[0].event._id || regs[0].event);
          }
        }

        if (eventsRes.data.data) {
          setAllEvents(eventsRes.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching core dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoreData();
  }, []);

  const fetchEventSpecificData = async () => {
    if (!selectedEventId) return;
    try {
      // 1. Fetch team for the selected event
      const teamRes = await api.get(`/teams/my-team?eventId=${selectedEventId}`);
      if (teamRes.data.success && teamRes.data.team) {
        const fetchedTeam = teamRes.data.team;
        setTeam(fetchedTeam);
        setFormData({
          githubLink: fetchedTeam.project?.githubLink || '',
          demoVideo: fetchedTeam.project?.demoVideo || '',
          presentationLink: fetchedTeam.project?.presentationLink || '',
          description: fetchedTeam.project?.description || '',
        });
      } else {
        setTeam(null);
        setFormData({
          githubLink: '',
          demoVideo: '',
          presentationLink: '',
          description: '',
        });
      }

      // 2. Fetch pending invitations for the user
      const invitesRes = await api.get('/teams/invitations');
      if (invitesRes.data.success) {
        setInvitations(invitesRes.data.invitations || []);
      }
    } catch (err) {
      console.error('Error fetching event-specific data:', err);
    }
  };

  useEffect(() => {
    fetchEventSpecificData();
  }, [selectedEventId]);

  const fetchAvailableParticipants = async () => {
    if (!selectedEventId) return;
    try {
      const scoutRes = await api.get(
        `/teams/event/${selectedEventId}/participants?page=${scoutPage}&limit=10`
      );
      if (scoutRes.data.data) {
        setAvailableParticipants(scoutRes.data.data || []);
        if (scoutRes.data.pagination) {
          setScoutTotalPages(scoutRes.data.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Error fetching available participants:', err);
    }
  };

  const isLeader =
    team &&
    (user?._id === team.leader ||
      user?._id === team.leader?._id ||
      user?.id === team.leader ||
      user?.id === team.leader?._id);

  useEffect(() => {
    if (selectedEventId && team && isLeader) {
      fetchAvailableParticipants();
    }
  }, [selectedEventId, team, scoutPage]);

  // Determine active states
  const isParticipating = registrations.length > 0;
  const activeEvent = isParticipating
    ? registrations.find((r) => (r.event._id || r.event) === selectedEventId)?.event ||
      registrations[0].event
    : null;

  // Countdown timer logic
  useEffect(() => {
    if (!activeEvent) return;

    const timer = setInterval(() => {
      const targetTime = new Date(
        activeEvent.phases?.hackingEnd || activeEvent.timing?.endDate
      ).getTime();
      const difference = targetTime - Date.now();

      if (difference <= 0) {
        setTimeRemaining('Submission Closed');
        clearInterval(timer);
      } else {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeRemaining(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeEvent]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (submitStatus) setSubmitStatus(null);
  };

  const handleCopyCode = () => {
    if (!team?.joinCode) return;
    navigator.clipboard.writeText(team.joinCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!team) return;
    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await api.put(`/teams/${team._id}/submit`, formData);
      setSubmitStatus({
        type: 'success',
        message: res.data.message || 'Project submitted successfully! Incredible work.',
      });
      setTeam((prev) => ({
        ...prev,
        project: res.data.project,
      }));
    } catch (err) {
      setSubmitStatus({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Submission failed.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Dynamic fields configuration based on organizer toggles
  const reqConfig = activeEvent?.submissionRequirements || {
    githubLink: true,
    demoVideo: true,
    presentationLink: true,
    description: true,
  };

  // Helper check if project is already submitted
  const isProjectSubmitted =
    team?.project &&
    ((reqConfig.githubLink && team.project.githubLink) ||
      (reqConfig.demoVideo && team.project.demoVideo) ||
      (reqConfig.presentationLink && team.project.presentationLink) ||
      (reqConfig.description && team.project.description));

  // Build the winding road schedule phases
  const getTimelinePhases = () => {
    if (!activeEvent) return [];
    const phases = activeEvent.phases || {};
    const itineraryList = [
      { name: 'Registration Deadline', time: activeEvent.registrationDeadline },
      { name: 'Idea Submission', time: phases.ideaSubmissionEnd },
      { name: 'Shortlist Announcement', time: phases.shortlistAnnouncement },
      { name: 'Hacking Coding Period', time: phases.hackingEnd || activeEvent.timing?.endDate },
      { name: 'Final Judging & Results', time: phases.judgingValedictory },
    ].filter((p) => p.time);

    return itineraryList.map((phase) => {
      const phaseTime = new Date(phase.time).getTime();
      const now = Date.now();
      let status = 'locked';

      if (now > phaseTime) {
        status = 'completed';
      } else if (now <= phaseTime) {
        status = 'active'; // In board-game track, active is the next upcoming milestone
      }

      return {
        ...phase,
        status,
      };
    });
  };

  // Find the exact active phase to highlight
  const rawPhases = getTimelinePhases();
  let firstActiveFound = false;
  const processedPhases = rawPhases.map((phase) => {
    if (phase.status === 'active' && !firstActiveFound) {
      firstActiveFound = true;
      return { ...phase, status: 'active' };
    } else if (phase.status === 'active') {
      return { ...phase, status: 'locked' };
    }
    return phase;
  });

  const nextCarousel = () => {
    if (allEvents.length === 0) return;
    setCarouselIndex((prev) => (prev + 1) % allEvents.length);
  };

  const prevCarousel = () => {
    if (allEvents.length === 0) return;
    setCarouselIndex((prev) => (prev - 1 + allEvents.length) % allEvents.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08070d] text-[#f7f6f0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#595388] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-[#afacca]">
            Retrieving your hack credentials from the grid...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08070d] text-[#f7f6f0] p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ── HEADER ── */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[rgba(175,172,202,0.1)] pb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Terminal className="text-[#afacca]" size={24} />
              <h1 className="font-display text-3xl font-bold tracking-tight">
                Hacker<span className="text-[#595388]">.</span>Space
              </h1>
            </div>
            <p className="text-sm text-[#afacca]">Welcome to the grid, {user?.firstName}.</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 rounded-xl border border-[rgba(175,172,202,0.2)] bg-[#595388]/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#afacca] transition-all duration-300 hover:bg-[#595388]/20 hover:text-white"
            >
              My Profile
            </button>
            <button
              onClick={() => navigate('/events')}
              className="flex items-center gap-2 rounded-xl bg-[#595388] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#f7f6f0] shadow-lg shadow-[#595388]/20 transition-all hover:bg-[#6e67a7]"
            >
              Browse Events
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-[rgba(175,172,202,0.2)] bg-[#595388]/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#afacca] transition-all duration-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
            >
              <LogOut size={14} />
              Disconnect
            </button>
          </div>
        </header>

        {/* ── UNREGISTERED / EXPLORATION STATE ── */}
        {!isParticipating && (
          <div className="space-y-8">
            {/* Carousel Section */}
            <div className="relative overflow-hidden rounded-2xl border border-[rgba(175,172,202,0.15)] bg-gradient-to-r from-[#595388]/20 to-transparent p-8">
              <div className="absolute top-0 right-0 h-64 w-64 -translate-y-1/2 translate-x-1/3 rounded-full bg-[#595388]/10 blur-[80px]" />

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="text-yellow-400" size={20} />
                    Active & Upcoming Hackathons
                  </h2>
                  <p className="text-xs text-[#afacca]">
                    Find your next challenge and join a build team.
                  </p>
                </div>

                {allEvents.length > 1 && (
                  <div className="flex gap-2">
                    <button
                      onClick={prevCarousel}
                      className="p-2 rounded-lg border border-[rgba(175,172,202,0.15)] bg-[#08070d]/50 hover:bg-[#595388]/20 text-[#afacca] transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={nextCarousel}
                      className="p-2 rounded-lg border border-[rgba(175,172,202,0.15)] bg-[#08070d]/50 hover:bg-[#595388]/20 text-[#afacca] transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>

              {allEvents.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[rgba(175,172,202,0.2)] rounded-xl">
                  <p className="text-sm text-[#afacca]">
                    No active hackathons found on the grid right now.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-8 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#afacca] bg-[#08070d]/60 rounded border border-[rgba(175,172,202,0.1)]">
                        {allEvents[carouselIndex].category || 'Hackathon'}
                      </span>
                      <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 rounded border border-emerald-500/20">
                        {allEvents[carouselIndex].mode || 'online'}
                      </span>
                    </div>
                    <h3 className="font-display text-3xl font-bold text-[#f7f6f0]">
                      {allEvents[carouselIndex].title}
                    </h3>
                    <p className="text-sm text-[#afacca] max-w-2xl">
                      {allEvents[carouselIndex].description?.short ||
                        allEvents[carouselIndex].description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs text-[#afacca] pt-2">
                      <div>
                        <span className="font-bold text-[#f7f6f0]">Starts:</span>{' '}
                        {new Date(allEvents[carouselIndex].timing?.startDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-bold text-[#f7f6f0]">Deadline:</span>{' '}
                        {new Date(
                          allEvents[carouselIndex].registrationDeadline
                        ).toLocaleDateString()}
                      </div>
                      {allEvents[carouselIndex].prizes?.totalPrizePool > 0 && (
                        <div className="text-yellow-400 font-bold">
                          Prize Pool: ₹
                          {allEvents[carouselIndex].prizes?.totalPrizePool.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-4 flex justify-end">
                    <button
                      onClick={() => navigate(`/events`)}
                      className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#595388] px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#f7f6f0] shadow-lg shadow-[#595388]/30 transition-all hover:bg-[#6e67a7]"
                    >
                      View Details & Register
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Inactive State Roster Alert */}
            <div className="glass-card p-8 rounded-2xl text-center max-w-xl mx-auto space-y-4">
              <Users size={48} className="text-[#595388] mx-auto opacity-60" />
              <h3 className="font-display text-xl font-bold">Workspace Inactive</h3>
              <p className="text-sm text-[#afacca]">
                You are currently not participating in any active hackathons. Join an event from the
                carousel above or browse the events catalog to unlock final project submissions,
                custom schedules, and team building tools.
              </p>
              <button
                onClick={() => navigate('/events')}
                className="inline-flex items-center gap-2 rounded-xl border border-[rgba(175,172,202,0.2)] bg-[#595388]/10 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#afacca] transition-all duration-300 hover:bg-[#595388]/20 hover:text-white"
              >
                Join a Hackathon
              </button>
            </div>
          </div>
        )}

        {/* ── REGISTERED / ACTIVE HACKER STATE ── */}
        {isParticipating && activeEvent && (
          <div className="space-y-8">
            {/* Event Selector for Multi-Event */}
            {registrations.length > 1 && (
              <div className="flex items-center gap-3 bg-[#595388]/10 p-3.5 rounded-2xl border border-[rgba(175,172,202,0.15)] max-w-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-[#afacca]">
                  Selected Event:
                </span>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="bg-[#08070d] border border-[rgba(175,172,202,0.15)] rounded-xl px-3 py-1.5 text-xs text-[#f7f6f0] focus:outline-none flex-1"
                >
                  {registrations.map((r) => (
                    <option key={r.event._id || r.event} value={r.event._id || r.event}>
                      {r.event.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Event Info Banner & Countdown */}
            <div className="relative overflow-hidden rounded-2xl border border-[rgba(175,172,202,0.15)] bg-gradient-to-r from-[#595388]/20 to-transparent p-8">
              <div className="absolute top-0 right-0 h-64 w-64 -translate-y-1/2 translate-x-1/3 rounded-full bg-[#595388]/10 blur-[80px]" />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#afacca] bg-[#08070d]/50 rounded-lg border border-[rgba(175,172,202,0.1)]">
                      {activeEvent.category || 'Hackathon'}
                    </span>
                    {activeEvent.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#afacca] bg-[#595388]/20 rounded-lg border border-[rgba(175,172,202,0.05)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="font-display text-3xl font-bold">{activeEvent.title}</h2>
                  <p className="text-sm text-[#afacca] mt-1">
                    {activeEvent.description?.short || activeEvent.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-[#08070d]/60 px-6 py-4 rounded-2xl border border-[rgba(175,172,202,0.1)] shrink-0">
                  <Clock className="text-[#afacca]" size={24} />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#afacca] font-bold">
                      Submission Countdown
                    </p>
                    <p className="font-display text-2xl font-bold text-yellow-400">
                      {timeRemaining || 'Loading...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Workspace Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (Span 2): Project submission & team */}
              <div className="lg:col-span-2 space-y-6">
                {/* ── INBOX SECTION ── */}
                {invitations.length > 0 && (
                  <div className="glass-card p-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5">
                    <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4 text-[#f7f6f0]">
                      <Mail className="text-yellow-500" size={18} />
                      Invitations Inbox ({invitations.length})
                    </h3>
                    <div className="space-y-3">
                      {invitations.map((inv) => (
                        <div
                          key={inv._id}
                          className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-[rgba(175,172,202,0.1)] bg-[#08070d]/50 gap-4"
                        >
                          <div>
                            <p className="text-sm font-bold text-white">Join {inv.name}</p>
                            <p className="text-[11px] text-[#afacca]">Event: {inv.event?.title}</p>
                            <p className="text-[10px] text-[#afacca]/80 mt-0.5">
                              Captain: {inv.leader?.firstName} {inv.leader?.lastName}
                            </p>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => handleRejectInvite(inv._id)}
                              className="flex-1 sm:flex-none px-3.5 py-1.5 border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-red-500/20 transition-all"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleAcceptInvite(inv._id)}
                              className="flex-1 sm:flex-none px-3.5 py-1.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-emerald-500/20 transition-all"
                            >
                              Accept
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Project Submission Portal */}
                <div className="glass-card p-6 rounded-2xl border-[rgba(175,172,202,0.3)] shadow-[0_0_30px_-5px_rgba(89,83,136,0.15)]">
                  <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-6 text-[#f7f6f0]">
                    <UploadCloud size={18} className="text-[#595388]" />
                    Final Project Submission Portal
                  </h3>

                  {!team ? (
                    <div className="p-8 text-center border border-dashed border-[rgba(175,172,202,0.2)] rounded-xl">
                      <p className="text-sm text-[#afacca]">
                        You must be in a team to submit a project.
                      </p>
                    </div>
                  ) : isProjectSubmitted ? (
                    /* Project Deployed Read-Only View */
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-xs">
                        <CheckCircle2 size={16} />
                        <span>
                          <strong>Project Deployed!</strong> Your submission is secure. You can
                          review the details below.
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reqConfig.githubLink && team.project?.githubLink && (
                          <a
                            href={team.project.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 rounded-xl border border-[rgba(175,172,202,0.1)] bg-[rgba(89,83,136,0.05)] hover:bg-[rgba(89,83,136,0.1)] transition-all group"
                          >
                            <Github className="text-[#afacca] group-hover:text-white" size={24} />
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-[#afacca]">
                                Source Code
                              </h4>
                              <p className="text-xs text-white truncate max-w-[200px]">
                                {team.project.githubLink}
                              </p>
                            </div>
                          </a>
                        )}

                        {reqConfig.presentationLink && team.project?.presentationLink && (
                          <a
                            href={team.project.presentationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 rounded-xl border border-[rgba(175,172,202,0.1)] bg-[rgba(89,83,136,0.05)] hover:bg-[rgba(89,83,136,0.1)] transition-all group"
                          >
                            <PresentationIcon
                              className="text-[#afacca] group-hover:text-white"
                              size={24}
                            />
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-[#afacca]">
                                Presentation Pitch
                              </h4>
                              <p className="text-xs text-white truncate max-w-[200px]">
                                {team.project.presentationLink}
                              </p>
                            </div>
                          </a>
                        )}

                        {reqConfig.demoVideo && team.project?.demoVideo && (
                          <a
                            href={team.project.demoVideo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 rounded-xl border border-[rgba(175,172,202,0.1)] bg-[rgba(89,83,136,0.05)] hover:bg-[rgba(89,83,136,0.1)] transition-all group"
                          >
                            <Youtube className="text-[#afacca] group-hover:text-white" size={24} />
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-[#afacca]">
                                Video Demo
                              </h4>
                              <p className="text-xs text-white truncate max-w-[200px]">
                                {team.project.demoVideo}
                              </p>
                            </div>
                          </a>
                        )}
                      </div>

                      {reqConfig.description && team.project?.description && (
                        <div className="p-4 rounded-xl border border-[rgba(175,172,202,0.1)] bg-[rgba(8,7,13,0.5)]">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#afacca] mb-2">
                            Project Description
                          </h4>
                          <p className="text-xs text-[#f7f6f0] leading-relaxed whitespace-pre-wrap">
                            {team.project.description}
                          </p>
                        </div>
                      )}

                      {isLeader && (
                        <button
                          onClick={() => {
                            // Clear fields in database to resubmit or allow modifying
                            // Set dynamic check back to input screen
                            setTeam((prev) => ({
                              ...prev,
                              project: {
                                githubLink: '',
                                demoVideo: '',
                                presentationLink: '',
                                description: '',
                              },
                            }));
                          }}
                          className="w-full text-xs font-bold uppercase tracking-widest text-[#afacca] hover:text-white border border-[rgba(175,172,202,0.1)] bg-transparent rounded-xl py-3 hover:bg-[#595388]/10 transition-colors"
                        >
                          Update Submission
                        </button>
                      )}
                    </div>
                  ) : !isLeader ? (
                    /* Member Stylized Block Alert */
                    <div className="p-8 text-center border border-yellow-500/20 bg-yellow-500/5 rounded-xl space-y-3">
                      <ShieldCheck className="text-yellow-500 mx-auto" size={32} />
                      <h4 className="text-sm font-bold text-yellow-500 uppercase tracking-wider">
                        Access Restricted
                      </h4>
                      <p className="text-xs text-[#afacca] max-w-md mx-auto">
                        Only the Team Captain has the clearance to submit or update the project
                        files on the server grid.
                      </p>
                    </div>
                  ) : (
                    /* Active Submission Form for Captain */
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reqConfig.githubLink && (
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-[#afacca] flex items-center gap-1.5">
                              <Github size={12} /> Source Code (GitHub Link) *
                            </label>
                            <input
                              type="url"
                              name="githubLink"
                              placeholder="https://github.com/your-repo"
                              value={formData.githubLink}
                              onChange={handleInputChange}
                              required
                              className="input-field text-sm"
                            />
                          </div>
                        )}
                        {reqConfig.demoVideo && (
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-[#afacca] flex items-center gap-1.5">
                              <Youtube size={12} /> Video Demo (YouTube Link)
                            </label>
                            <input
                              type="url"
                              name="demoVideo"
                              placeholder="https://youtube.com/watch?v=..."
                              value={formData.demoVideo}
                              onChange={handleInputChange}
                              className="input-field text-sm"
                            />
                          </div>
                        )}
                      </div>

                      {reqConfig.presentationLink && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-[#afacca] flex items-center gap-1.5">
                            <PresentationIcon size={12} /> Presentation Link (Slide Deck / PPT) *
                          </label>
                          <input
                            type="url"
                            name="presentationLink"
                            placeholder="https://docs.google.com/presentation/d/... or Canva link"
                            value={formData.presentationLink}
                            onChange={handleInputChange}
                            required
                            className="input-field text-sm"
                          />
                        </div>
                      )}

                      {reqConfig.description && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-[#afacca]">
                            Project Description (Brief Overview) *
                          </label>
                          <textarea
                            name="description"
                            placeholder="Describe your project, technologies used, problems solved, and architecture..."
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            rows="3"
                            className="input-field text-sm resize-y min-h-[80px]"
                          />
                        </div>
                      )}

                      {submitStatus && (
                        <div
                          className={`text-xs border rounded-lg p-3 text-center ${
                            submitStatus.type === 'success'
                              ? 'text-green-400 bg-green-500/10 border-green-500/25'
                              : 'text-red-400 bg-red-500/10 border-red-500/25'
                          }`}
                        >
                          {submitStatus.message}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#595388] text-[#f7f6f0] text-sm font-bold uppercase tracking-wider hover:bg-[#6a63a0] transition-colors shadow-lg shadow-[#595388]/20 disabled:opacity-50"
                      >
                        <UploadCloud size={16} />
                        {submitting ? 'Deploying Project...' : 'Submit Project'}
                      </button>
                    </form>
                  )}
                </div>

                {/* Team Roster Hub / Create & Join Panel */}
                {team ? (
                  <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-display font-bold text-lg flex items-center gap-2">
                        <Users size={18} className="text-[#595388]" />
                        {team.name}
                      </h3>
                      <span className="px-3 py-1 bg-[#595388]/20 text-[#afacca] border border-[rgba(175,172,202,0.1)] text-xs rounded-lg font-semibold">
                        {team.members?.length || 0} / 4 Members
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {team.members?.map((member) => {
                        const isCaptain =
                          member._id === team.leader ||
                          (team.leader && member._id === team.leader._id) ||
                          member.id === team.leader ||
                          (team.leader && member.id === team.leader._id);
                        const initials =
                          `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase();
                        return (
                          <div
                            key={member._id}
                            onClick={() => navigate(`/profile/${member.username}`)}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:border-[#afacca]/45 hover:bg-[#595388]/5 transition-all ${
                              isCaptain
                                ? 'border-[rgba(175,172,202,0.2)] bg-[#595388]/10'
                                : 'border-[rgba(175,172,202,0.05)] bg-[rgba(8,7,13,0.5)]'
                            }`}
                          >
                            {member.profilePicture ? (
                              <img
                                src={member.profilePicture}
                                alt={`${member.firstName} ${member.lastName}`}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                  isCaptain
                                    ? 'bg-gradient-to-br from-[#afacca] to-[#595388] text-[#08070d]'
                                    : 'bg-[#595388]/30 text-[#f7f6f0]'
                                }`}
                              >
                                {initials}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-[#f7f6f0]">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-[10px] uppercase tracking-wider text-[#afacca]">
                                {isCaptain ? 'Team Captain' : 'Team Member'}
                              </p>
                              {member.email && (
                                <p className="text-[10px] text-[#afacca] truncate">
                                  {member.email}
                                </p>
                              )}
                              {member.mobileNumber && (
                                <p className="text-[10px] text-yellow-400 font-mono mt-0.5">
                                  {member.mobileNumber}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 p-3 rounded-xl border border-dashed border-[rgba(175,172,202,0.2)] flex items-center justify-between bg-transparent">
                      <p className="text-xs text-[#afacca]">
                        Invite Code:{' '}
                        <span className="font-mono font-bold text-[#f7f6f0]">{team.joinCode}</span>
                      </p>
                      <button
                        onClick={handleCopyCode}
                        className="text-[10px] font-bold uppercase tracking-wider text-[#afacca] hover:text-[#f7f6f0] transition-colors"
                      >
                        {copySuccess ? 'Copied!' : 'Copy Code'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="glass-card p-6 rounded-2xl space-y-6">
                    <div>
                      <h3 className="font-display font-bold text-lg flex items-center gap-2 text-[#f7f6f0]">
                        <Users size={18} className="text-[#595388]" />
                        Join or Create a Team
                      </h3>
                      <p className="text-xs text-[#afacca] mt-1">
                        Get coordinates or form a crew to submit projects.
                      </p>
                    </div>

                    {teamActionStatus && (
                      <div
                        className={`text-xs border rounded-lg p-3 text-center ${
                          teamActionStatus.type === 'success'
                            ? 'text-green-400 bg-green-500/10 border-green-500/25'
                            : 'text-red-400 bg-red-500/10 border-red-500/25'
                        }`}
                      >
                        {teamActionStatus.message}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Create Team Form */}
                      <form
                        onSubmit={handleCreateTeam}
                        className="space-y-3.5 p-4 rounded-xl border border-[rgba(175,172,202,0.05)] bg-[rgba(8,7,13,0.3)]"
                      >
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                          Create a Team
                        </h4>
                        <div className="flex flex-col gap-1.5">
                          <input
                            type="text"
                            placeholder="Enter team name"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            required
                            className="input-field text-sm"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={teamActionLoading}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#595388] text-[#f7f6f0] text-xs font-bold uppercase tracking-wider hover:bg-[#6a63a0] transition-colors disabled:opacity-50"
                        >
                          {teamActionLoading ? 'Creating...' : 'Create'}
                        </button>
                      </form>

                      {/* Join Team Form */}
                      <form
                        onSubmit={handleRequestJoinTeam}
                        className="space-y-3.5 p-4 rounded-xl border border-[rgba(175,172,202,0.05)] bg-[rgba(8,7,13,0.3)]"
                      >
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                          Request to Join
                        </h4>
                        <div className="flex flex-col gap-1.5">
                          <input
                            type="text"
                            placeholder="Enter Team ID"
                            value={teamIdToJoin}
                            onChange={(e) => setTeamIdToJoin(e.target.value)}
                            required
                            className="input-field text-sm"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={teamActionLoading}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-[rgba(175,172,202,0.2)] bg-[#595388]/10 text-[#afacca] text-xs font-bold uppercase tracking-wider hover:bg-[#595388]/20 hover:text-white transition-colors disabled:opacity-50"
                        >
                          {teamActionLoading ? 'Sending Request...' : 'Send Request'}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* ── SCOUT & RECRUIT SECTION (Captains Only) ── */}
                {team && isLeader && (
                  <div className="glass-card p-6 rounded-2xl space-y-6">
                    <div>
                      <h3 className="font-display font-bold text-lg flex items-center gap-2 text-[#f7f6f0]">
                        <Sparkles className="text-yellow-400" size={18} />
                        Scout & Recruit
                      </h3>
                      <p className="text-xs text-[#afacca] mt-1">
                        Find and recruit registered hackers who are looking for a team.
                      </p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        placeholder="Search by name, skills..."
                        value={scoutSearchQuery}
                        onChange={(e) => setScoutSearchQuery(e.target.value)}
                        className="input-field text-xs flex-1"
                      />
                      <select
                        value={scoutRoleFilter}
                        onChange={(e) => setScoutRoleFilter(e.target.value)}
                        className="input-field text-xs bg-[#08070d] text-[#afacca]"
                      >
                        <option value="">All Roles</option>
                        <option value="Full Stack">Full Stack</option>
                        <option value="Frontend">Frontend</option>
                        <option value="Backend">Backend</option>
                        <option value="UI/UX">UI/UX</option>
                        <option value="AI/ML">AI/ML</option>
                        <option value="Cybersecurity">Cybersecurity</option>
                      </select>
                    </div>

                    {/* List */}
                    <div className="space-y-3">
                      {availableParticipants
                        .filter((p) => {
                          if (!p) return false;
                          const name = `${p.firstName} ${p.lastName} ${p.username}`.toLowerCase();
                          const query = scoutSearchQuery.toLowerCase();
                          const skillsMatch = p.skills?.some((s) =>
                            s.toLowerCase().includes(query)
                          );
                          const roleMatch = scoutRoleFilter
                            ? p.primaryRole === scoutRoleFilter
                            : true;
                          return (name.includes(query) || skillsMatch) && roleMatch;
                        })
                        .map((participant) => {
                          const initials =
                            `${participant.firstName?.[0] || ''}${participant.lastName?.[0] || ''}`.toUpperCase();
                          const alreadyInvited =
                            team.invitedUsers?.includes(participant._id) ||
                            team.invitedUsers?.includes(participant.id);
                          return (
                            <div
                              key={participant._id}
                              className="flex items-center justify-between p-4 rounded-xl border border-[rgba(175,172,202,0.05)] bg-[rgba(8,7,13,0.3)] hover:border-[rgba(175,172,202,0.15)] transition-all"
                            >
                              <div className="flex items-center gap-3">
                                {participant.profilePicture ? (
                                  <img
                                    src={participant.profilePicture}
                                    alt=""
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-[#595388]/30 flex items-center justify-center font-bold text-white text-xs">
                                    {initials}
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-bold text-white">
                                    {participant.firstName} {participant.lastName}
                                  </p>
                                  <p className="text-[10px] text-[#afacca]">
                                    @{participant.username} •{' '}
                                    {participant.primaryRole || 'Developer'}
                                  </p>
                                  {participant.skills && participant.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {participant.skills.slice(0, 3).map((skill) => (
                                        <span
                                          key={skill}
                                          className="px-1.5 py-0.5 text-[8px] bg-[#595388]/20 text-[#afacca] rounded"
                                        >
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleInviteUser(participant._id)}
                                disabled={alreadyInvited || team.members?.length >= 4}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                  alreadyInvited
                                    ? 'bg-transparent border border-[rgba(175,172,202,0.1)] text-[#afacca] cursor-not-allowed'
                                    : 'bg-[#595388] text-white hover:bg-[#6c65a4]'
                                }`}
                              >
                                {alreadyInvited ? 'Invited' : 'Invite'}
                              </button>
                            </div>
                          );
                        })}
                      {availableParticipants.length === 0 && (
                        <p className="text-center text-xs text-[#afacca] italic py-4">
                          No available participants found.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Curly timeline */}
              <div className="space-y-6">
                {/* Winding Schedule Design */}
                <div className="glass-card p-6 rounded-2xl h-full flex flex-col">
                  <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-6">
                    <Clock size={18} className="text-[#595388]" />
                    Interactive Roadmap
                  </h3>

                  <div className="flex-1 board-game-path relative">
                    <div className="board-game-road" />

                    {processedPhases.map((phase, idx) => (
                      <div key={idx} className="path-node-row">
                        <div className="path-node-wrapper group">
                          {/* Circular Glowing Checkpoint Node */}
                          <div className={`node-circle ${phase.status}`}>
                            {phase.status === 'completed' ? (
                              <CheckCircle2 size={20} />
                            ) : (
                              <span>0{idx + 1}</span>
                            )}
                          </div>

                          {/* Detailed Floating Description Tooltip Card */}
                          <div className="node-tooltip-card text-left transition-all duration-300 group-hover:border-[#afacca]/45">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-green-400 flex justify-between">
                              <span>Phase {idx + 1}</span>
                              {phase.status === 'active' && (
                                <span className="text-yellow-400 font-bold animate-pulse">
                                  ● Active
                                </span>
                              )}
                            </p>
                            <h4 className="text-xs font-bold text-[#f7f6f0] mt-0.5">
                              {phase.name}
                            </h4>
                            <p className="text-[10px] text-[#afacca] mt-1 font-mono">
                              {new Date(phase.time).toLocaleDateString()} at{' '}
                              {new Date(phase.time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── HELP DESK (COMMON BOTTOM SECTION) ── */}
        <footer className="pt-6 border-t border-[rgba(175,172,202,0.1)]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[#afacca]/40">
              © 2026 HackFlow Systems. All nodes operational.
            </p>

            <a
              href={activeEvent?.logistics?.discordInvite || 'mailto:support@hackflow.dev'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-3.5 rounded-xl glass-card hover:bg-[rgba(175,172,202,0.1)] transition-colors group cursor-pointer"
            >
              <MessageSquare className="text-[#afacca]" size={18} />
              <span className="text-xs font-bold text-[#f7f6f0]">Need Help?</span>
              <span className="text-[10px] uppercase tracking-widest text-[#afacca] group-hover:text-[#f7f6f0] transition-colors ml-2">
                Open Ticket →
              </span>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TeamDashboard;

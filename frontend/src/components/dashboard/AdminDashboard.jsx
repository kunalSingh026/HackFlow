import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import QRScanner from '../admin/QRScanner';
import {
  LogOut,
  Users,
  ShieldAlert,
  Activity,
  Calendar,
  Video,
  Gavel,
  Upload,
  Bell,
  Edit,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Image as ImageIcon,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [hostedEvents, setHostedEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  // Banner Upload state
  const [bannerFile, setBannerFile] = useState(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerSuccess, setBannerSuccess] = useState('');

  // Announcement state
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [sendingAnn, setSendingAnn] = useState(false);
  const [annSuccess, setAnnSuccess] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch hosted events on mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events?limit=50');
        if (res.data && res.data.data) {
          // Filter events organized by the current user
          const myEvents = res.data.data.filter((e) => {
            const orgId = e.organizer?._id || e.organizer;
            return orgId === user?.id;
          });
          setHostedEvents(myEvents);
          if (myEvents.length > 0) {
            setSelectedEventId(myEvents[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch events.');
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchEvents();
  }, [user]);

  // Fetch details and stats when selected event changes
  const fetchEventData = async (eventId) => {
    if (!eventId) return;
    setStatsLoading(true);
    try {
      const [detailsRes, statsRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/events/${eventId}/stats`),
      ]);
      setSelectedEvent(detailsRes.data.data);
      setStats(statsRes.data.stats);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to synchronize stats for selected event.');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      fetchEventData(selectedEventId);
    }
  }, [selectedEventId]);

  // Handle banner upload
  const handleBannerUpload = async (e) => {
    e.preventDefault();
    if (!bannerFile || !selectedEventId) return;

    setUploadingBanner(true);
    setBannerSuccess('');
    setError('');

    const formData = new FormData();
    formData.append('banner', bannerFile);

    try {
      const res = await api.post(`/events/${selectedEventId}/upload-banner`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setBannerSuccess('Event banner uploaded successfully!');
      setBannerFile(null);
      // Refresh event details to reflect new banner
      if (res.data?.event) {
        setSelectedEvent(res.data.event);
      } else {
        fetchEventData(selectedEventId);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Banner upload failed.');
    } finally {
      setUploadingBanner(false);
    }
  };

  // Handle post announcement
  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim() || !selectedEventId) return;

    setSendingAnn(true);
    setAnnSuccess('');
    setError('');

    try {
      await api.post(`/events/${selectedEventId}/announcements`, {
        title: annTitle,
        content: annContent,
      });
      setAnnSuccess('Announcement broadcasted successfully!');
      setAnnTitle('');
      setAnnContent('');
      // Refresh event details
      fetchEventData(selectedEventId);
    } catch (err) {
      setError(err.response?.data?.message || 'Announcement broadcast failed.');
    } finally {
      setSendingAnn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08070d] text-[#f7f6f0] flex flex-col justify-center items-center">
        <RefreshCw className="animate-spin mb-4 text-[#afacca]" size={36} />
        <p className="text-sm text-[#afacca]">Synchronizing command center specs...</p>
      </div>
    );
  }

  const totalSeats = selectedEvent?.ticketing?.totalSeats || 0;
  const bookedSeats = stats?.totalRegistrations || selectedEvent?.registrationCount || 0;
  const availableSeats =
    selectedEvent?.ticketing?.availableSeats ?? Math.max(0, totalSeats - bookedSeats);
  const fillRate = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#08070d] text-[#f7f6f0] p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ── HEADER ── */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[rgba(175,172,202,0.1)] pb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <ShieldAlert className="text-[#afacca]" size={24} />
              <h1 className="font-display text-3xl font-bold tracking-tight">
                Admin<span className="text-[#595388]">.</span>Ops
              </h1>
            </div>
            <p className="text-sm text-[#afacca]">
              Command Center • Authenticated as {user?.firstName}
            </p>
          </div>

          <div className="flex gap-3">
            {hostedEvents.length > 0 && (
              <button
                onClick={() => setShowScanner(true)}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-600/20 transition-all"
              >
                Scan Tickets
              </button>
            )}
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
              Terminate Session
            </button>
          </div>
        </header>

        {/* ── ERROR DISPLAY ── */}
        {error && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* ── EVENT SELECTOR ── */}
        <div className="glass-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display font-semibold text-white">Select Event to Manage</h3>
            <p className="text-xs text-[#afacca]">
              Switch between your hosted hackathons and events.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="input-field bg-[#08070d] text-sm pr-10"
            >
              {hostedEvents.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.title}
                </option>
              ))}
              {hostedEvents.length === 0 && <option value="">No hosted events found</option>}
            </select>
            {selectedEventId && (
              <button
                onClick={() => navigate(`/admin/edit-event/${selectedEventId}`)}
                className="flex items-center justify-center gap-2 rounded-xl border border-[rgba(175,172,202,0.2)] bg-[#595388]/20 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#595388]/40 transition-all"
              >
                <Edit size={14} />
                Edit Specs
              </button>
            )}
            <button
              onClick={() => navigate('/admin/create-event')}
              className="rounded-xl bg-[#595388] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#f7f6f0] hover:bg-[#6a63a0] transition-colors"
            >
              + Host New
            </button>
          </div>
        </div>

        {selectedEventId ? (
          <>
            {/* ── TOP METRICS ROW ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Capacity Progress metric */}
              <div className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#afacca] font-bold mb-1">
                      Seats Filled
                    </p>
                    <h2 className="text-4xl font-display font-bold text-[#f7f6f0]">
                      {bookedSeats} <span className="text-xs text-[#afacca]">/ {totalSeats}</span>
                    </h2>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-[#595388]/20 flex items-center justify-center border border-[rgba(175,172,202,0.1)]">
                    <TrendingUp className="text-[#afacca]" size={20} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 w-full rounded-full bg-[#595388]/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#595388] to-[#afacca] transition-all duration-500"
                      style={{ width: `${Math.min(100, fillRate)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#afacca]">
                    <span>{fillRate}% Capacity</span>
                    <span>{availableSeats} Remaining</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#afacca] font-bold mb-1">
                    Check-Ins
                  </p>
                  <h2 className="text-4xl font-display font-bold">{stats?.totalCheckedIn || 0}</h2>
                  <p className="text-xs text-green-400 mt-2">Active on grid</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-[#595388]/20 flex items-center justify-center border border-[rgba(175,172,202,0.1)]">
                  <Users className="text-[#afacca]" size={20} />
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl flex items-center justify-between border-[rgba(175,172,202,0.3)] shadow-[0_0_30px_-5px_rgba(89,83,136,0.3)]">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#afacca] font-bold mb-1">
                    Total Teams
                  </p>
                  <h2 className="text-4xl font-display font-bold text-[#f7f6f0]">
                    {stats?.totalTeams || 0}
                  </h2>
                  <p className="text-xs text-[#595388] mt-2 font-semibold">
                    Registered projects: {stats?.projectsSubmitted || 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-[#595388]/20 flex items-center justify-center border border-[rgba(175,172,202,0.1)]">
                  <Activity className="text-[#afacca]" size={20} />
                </div>
              </div>
            </div>

            {/* ── MAIN LOGISTICS GRID ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Comms & Banners */}
              <div className="space-y-6">
                {/* Promo Banner Uploader */}
                <div className="glass-card p-6 rounded-2xl space-y-4">
                  <h3 className="font-display font-bold text-lg flex items-center gap-2">
                    <ImageIcon size={18} className="text-[#595388]" />
                    Promotional Banner
                  </h3>

                  {selectedEvent?.images?.banner ? (
                    <div className="relative rounded-xl overflow-hidden border border-[rgba(175,172,202,0.15)] aspect-[21/9] bg-black/40">
                      <img
                        src={selectedEvent.images.banner}
                        alt="Event Banner"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[rgba(175,172,202,0.2)] p-6 text-center text-xs text-[#afacca]">
                      No promotional banner uploaded yet.
                    </div>
                  )}

                  {bannerSuccess && (
                    <div className="p-3 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 text-xs flex items-center gap-2">
                      <CheckCircle size={14} />
                      <span>{bannerSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleBannerUpload} className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                      className="input-field text-xs flex-1 py-2"
                      required
                    />
                    <button
                      type="submit"
                      disabled={uploadingBanner || !bannerFile}
                      className="flex items-center gap-2 rounded-xl bg-[#595388] px-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#68619d] disabled:opacity-50"
                    >
                      {uploadingBanner ? 'Uploading...' : 'Upload'}
                      <Upload size={12} />
                    </button>
                  </form>
                </div>

                {/* Announcement Broadcasting */}
                <div className="glass-card p-6 rounded-2xl space-y-4">
                  <h3 className="font-display font-bold text-lg flex items-center gap-2">
                    <Bell size={18} className="text-[#595388]" />
                    Broadcast Update
                  </h3>

                  {annSuccess && (
                    <div className="p-3 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 text-xs flex items-center gap-2">
                      <CheckCircle size={14} />
                      <span>{annSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handlePostAnnouncement} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Announcement Title..."
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      className="input-field w-full text-xs"
                      required
                    />
                    <textarea
                      placeholder="Write your update details..."
                      rows={3}
                      value={annContent}
                      onChange={(e) => setAnnContent(e.target.value)}
                      className="input-field w-full text-xs"
                      required
                    />
                    <button
                      type="submit"
                      disabled={sendingAnn || !annTitle.trim() || !annContent.trim()}
                      className="w-full py-2.5 rounded-xl bg-[#595388] text-xs font-bold uppercase tracking-wider text-white hover:bg-[#68619d] transition-all disabled:opacity-50"
                    >
                      {sendingAnn ? 'Sending Broadcast...' : 'Broadcast Announcement'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Moderation & Judging */}
              <div className="space-y-6">
                <div className="glass-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display font-bold text-lg flex items-center gap-2">
                      <Calendar size={18} className="text-[#595388]" />
                      Live Itinerary
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {selectedEvent?.itinerary &&
                      selectedEvent.itinerary.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-3 rounded-xl bg-[rgba(8,7,13,0.5)] border border-[rgba(175,172,202,0.1)]"
                        >
                          <div>
                            <p className="text-sm font-semibold text-[#f7f6f0]">{item.title}</p>
                            <p className="text-xs text-[#afacca] mt-0.5">
                              {new Date(item.startTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              • {item.description || 'No description'}
                            </p>
                          </div>
                        </div>
                      ))}
                    {(!selectedEvent?.itinerary || selectedEvent.itinerary.length === 0) && (
                      <p className="text-xs text-[#afacca] italic">
                        No itinerary rounds scheduled. Add rounds in event specifications.
                      </p>
                    )}
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
                    <Video size={18} className="text-[#595388]" />
                    Venue Information
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-[rgba(8,7,13,0.5)] border border-[rgba(175,172,202,0.1)] space-y-1">
                      <span className="block text-[10px] text-[#afacca] uppercase">
                        Hosting Mode
                      </span>
                      <strong className="text-white uppercase">{selectedEvent?.mode}</strong>
                    </div>
                    {(selectedEvent?.mode === 'offline' || selectedEvent?.mode === 'hybrid') && (
                      <div className="p-3 rounded-xl bg-[rgba(8,7,13,0.5)] border border-[rgba(175,172,202,0.1)] space-y-1">
                        <span className="block text-[10px] text-[#afacca] uppercase">
                          Physical Venue Location
                        </span>
                        <strong className="text-white">
                          {selectedEvent?.venue || 'Not specified'}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="glass-card p-12 rounded-2xl border border-[rgba(175,172,202,0.1)] text-center">
            <h3 className="font-display text-xl font-bold text-white mb-2">No Managed Events</h3>
            <p className="text-sm text-[#afacca]">
              You do not have any published events. Create your first event to access metrics
              tracking, announcements, and banners.
            </p>
          </div>
        )}
        {showScanner && (
          <QRScanner
            onClose={() => setShowScanner(false)}
            selectedEventId={selectedEventId}
            hostedEvents={hostedEvents}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

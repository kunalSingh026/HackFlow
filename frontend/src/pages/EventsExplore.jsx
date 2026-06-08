import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Calendar,
  Search,
  Filter,
  MapPin,
  Trophy,
  Users,
  Clock,
  ExternalLink,
  ChevronRight,
  Layers,
  HelpCircle,
  Mail,
  Globe,
  ArrowRight,
  CheckCircle,
  Tag,
  BookOpen,
  ArrowLeft,
  Share2
} from 'lucide-react';

const EventsExplore = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  // State
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState({ loading: false, success: '', error: '' });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  // Fetch events
  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      // Query parameters for backend search or pagination
      const response = await api.get(`/events?page=${currentPage}&limit=${limit}`);
      if (response.data && response.data.data) {
        setEvents(response.data.data);
        setTotalPages(response.data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentPage]);

  // Fetch single event details if requested
  const handleSelectEvent = async (event) => {
    setDetailLoading(true);
    setRegistrationStatus({ loading: false, success: '', error: '' });
    try {
      const response = await api.get(`/events/${event._id}`);
      setSelectedEvent(response.data.data);
    } catch (err) {
      // Fallback to local item if get single fails
      setSelectedEvent(event);
    } finally {
      setDetailLoading(false);
    }
  };

  // Register for event handler
  const handleRegister = async (eventId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setRegistrationStatus({ loading: true, success: '', error: '' });
    try {
      const response = await api.post(`/events/${eventId}/register`);
      setRegistrationStatus({
        loading: false,
        success: response.data.message || 'Successfully registered!',
        error: ''
      });
      // Optionally re-fetch details or list
      if (selectedEvent && selectedEvent._id === eventId) {
        setSelectedEvent(prev => ({
          ...prev,
          ticketing: {
            ...prev.ticketing,
            availableSeats: Math.max(0, prev.ticketing.availableSeats - 1)
          }
        }));
      }
    } catch (err) {
      setRegistrationStatus({
        loading: false,
        success: '',
        error: err.response?.data?.message || 'Failed to complete registration.'
      });
    }
  };

  // Filter local results
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.tags && event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (event.category && event.category.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesMode = selectedMode === 'All' || event.mode === selectedMode;
    
    return matchesSearch && matchesCategory && matchesMode;
  });

  // Get unique categories for filter
  const categories = ['All', ...new Set(events.map(e => e.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-[#08070d] text-[#f7f6f0] flex flex-col relative selection:bg-[#595388] selection:text-[#f7f6f0]">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 right-0 h-[600px] overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[200px] left-1/4 h-[500px] w-[500px] rounded-full bg-[#595388]/10 blur-[120px]" />
        <div className="absolute top-[100px] right-1/4 h-[400px] w-[400px] rounded-full bg-[#afacca]/8 blur-[100px]" />
      </div>

      {/* Header / Navbar */}
      <nav className="border-b border-[rgba(175,172,202,0.1)] bg-[#08070d]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#595388] shadow-md shadow-[#595388]/30">
              <Layers size={18} className="text-[#f7f6f0]" />
            </div>
            <span className="font-display text-lg font-bold tracking-widest text-[#f7f6f0]">
              HACK<span className="text-[#afacca]">.</span>FLOW
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="text-sm font-medium text-[#afacca] transition-colors hover:text-[#f7f6f0]">
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="text-sm font-medium text-[#afacca] transition-colors hover:text-[#f7f6f0]">
                Sign In
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin/create-event" className="rounded-xl bg-[#595388] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#f7f6f0] shadow-lg shadow-[#595388]/30 transition-all hover:bg-[#6e67a7] hover:scale-105">
                Host Event
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Content wrapper */}
      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-1 z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: List and Filters */}
        <div className={`${selectedEvent ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-6 transition-all duration-500`}>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#afacca]">Explore Hackathons</span>
            <h1 className="mt-2 font-display text-4xl font-extrabold text-white">Active Grid Events</h1>
            <p className="text-sm text-[#afacca] mt-1">Discover, learn, and register for elite engineering events.</p>
          </div>

          {/* Search and Filters panel */}
          <div className="glass-card p-4 rounded-2xl border border-[rgba(175,172,202,0.12)] space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#afacca]" />
                <input
                  type="text"
                  placeholder="Search events, tags, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field !pl-11 w-full text-sm"
                />
              </div>
              
              {/* Mode Select */}
              <div className="flex gap-2">
                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="input-field bg-[#08070d] text-sm"
                >
                  <option value="All">All Modes</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field bg-[#08070d] text-sm"
                >
                  <option value="All">All Categories</option>
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Category Tabs */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-[rgba(175,172,202,0.08)]">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#595388] text-white'
                      : 'bg-[#595388]/10 text-[#afacca] hover:bg-[#595388]/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Loading Grid */}
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="glass-card h-[240px] rounded-2xl border border-[rgba(175,172,202,0.08)] animate-pulse" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="glass-card text-center p-12 rounded-2xl border border-[rgba(175,172,202,0.1)]">
              <BookOpen size={48} className="mx-auto text-[#afacca]/45 mb-4" />
              <h3 className="font-display text-xl font-bold text-white">No Hackathons Found</h3>
              <p className="text-sm text-[#afacca] mt-2">We couldn't find any events matching your current search parameters.</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedMode('All'); }}
                className="mt-5 rounded-xl border border-[rgba(175,172,202,0.15)] px-4 py-2 text-xs font-bold uppercase text-white hover:bg-[rgba(175,172,202,0.05)] transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            /* Events Grid */
            <div className="grid gap-6 md:grid-cols-2">
              {filteredEvents.map(event => {
                const isSelected = selectedEvent && selectedEvent._id === event._id;
                const startDate = event.timing?.startDate ? new Date(event.timing.startDate) : null;
                const formattedDate = startDate ? startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';
                
                return (
                  <motion.div
                    key={event._id}
                    layoutId={`event-card-${event._id}`}
                    onClick={() => handleSelectEvent(event)}
                    className={`glass-card rounded-2xl p-5 cursor-pointer border ${
                      isSelected 
                        ? 'border-[#afacca] bg-[#595388]/15 ring-1 ring-[#afacca]/30' 
                        : 'border-[rgba(175,172,202,0.12)] bg-[rgba(89,83,136,0.04)] hover:border-[rgba(175,172,202,0.25)] hover:bg-[rgba(89,83,136,0.1)]'
                    } transition-all duration-300 relative flex flex-col justify-between`}
                    style={{ minHeight: '230px' }}
                    whileHover={{ y: -3 }}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="rounded-md bg-[#595388]/30 px-2 py-0.5 font-display text-[9px] text-[#afacca] font-bold uppercase tracking-wider">
                          {event.category || 'HACKATHON'}
                        </span>
                        <span className={`rounded-md px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-wider ${
                          event.mode === 'online' 
                            ? 'bg-blue-500/15 border border-blue-500/30 text-blue-400' 
                            : event.mode === 'hybrid' 
                            ? 'bg-purple-500/15 border border-purple-500/30 text-purple-400'
                            : 'bg-green-500/15 border border-green-500/30 text-green-400'
                        }`}>
                          {event.mode || 'offline'}
                        </span>
                      </div>

                      {/* Title & Desc */}
                      <h3 className="font-display font-bold text-lg text-white group-hover:text-[#afacca] transition-colors line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-xs text-[#afacca] mt-2 line-clamp-2 leading-relaxed">
                        {event.description?.short || event.description || 'No short summary provided.'}
                      </p>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="mt-4 pt-4 border-t border-[rgba(175,172,202,0.08)] flex items-center justify-between text-[11px] text-[#afacca]">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        <span>{formattedDate}</span>
                      </div>
                      
                      {event.prizes?.totalPrizePool > 0 && (
                        <div className="flex items-center gap-1 text-green-400 font-semibold font-display">
                          <Trophy size={12} />
                          <span>₹{event.prizes.totalPrizePool.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-xs font-bold text-[#afacca] group-hover:translate-x-1 transition-transform">
                        <span>Details</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-[rgba(175,172,202,0.1)] bg-[#595388]/10 disabled:opacity-40 hover:bg-[#595388]/20 transition-all text-[#afacca] text-xs font-bold"
              >
                Previous
              </button>
              <span className="text-xs font-medium text-[#afacca]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-[rgba(175,172,202,0.1)] bg-[#595388]/10 disabled:opacity-40 hover:bg-[#595388]/20 transition-all text-[#afacca] text-xs font-bold"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Event detail view (Slide-Over panel style) */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              transition={{ type: 'spring', damping: 20 }}
              className="lg:col-span-5 w-full sticky top-[90px] h-[calc(100vh-130px)] overflow-y-auto rounded-2xl glass-card border border-[rgba(175,172,202,0.18)] p-6 space-y-6"
            >
              {/* Back button / header */}
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(175,172,202,0.1)]">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex items-center gap-1.5 text-xs text-[#afacca] hover:text-white transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Grid</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#afacca]">ID: {selectedEvent._id.slice(-6).toUpperCase()}</span>
                </div>
              </div>

              {detailLoading ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#afacca]"></div>
                  <span className="text-xs text-[#afacca]">Synchronizing event specs...</span>
                </div>
              ) : (
                <>
                  {/* Event Banner */}
                  {selectedEvent.images?.banner && (
                    <div className="rounded-xl overflow-hidden border border-[rgba(175,172,202,0.15)] aspect-[21/9] bg-black/40 mb-4">
                      <img 
                        src={selectedEvent.images.banner} 
                        alt={`${selectedEvent.title} Banner`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Event Title & Summary */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-md bg-[#595388]/40 px-2.5 py-0.5 font-display text-[9px] text-[#afacca] font-bold uppercase tracking-wider">
                        {selectedEvent.category}
                      </span>
                      <span className="rounded-md bg-[#08070d] border border-[rgba(175,172,202,0.15)] px-2.5 py-0.5 font-display text-[9px] text-[#afacca] font-bold uppercase tracking-wider">
                        {selectedEvent.mode.toUpperCase()}
                      </span>
                      {(selectedEvent.mode === 'offline' || selectedEvent.mode === 'hybrid') && selectedEvent.venue && (
                        <span className="rounded-md bg-[#595388]/20 border border-[rgba(175,172,202,0.15)] px-2.5 py-0.5 font-display text-[9px] text-[#afacca] font-bold uppercase tracking-wider">
                          📍 {selectedEvent.venue}
                        </span>
                      )}
                    </div>
                    <h2 className="font-display font-bold text-2xl text-white tracking-tight">{selectedEvent.title}</h2>
                    <p className="text-xs text-[#afacca] leading-relaxed">
                      {selectedEvent.description?.short || selectedEvent.description}
                    </p>
                  </div>

                  {/* CTAs / Registration Details */}
                  <div className="p-4 rounded-xl border border-[rgba(175,172,202,0.1)] bg-[#08070d]/50 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#afacca]">Seats Status</span>
                      <span className="font-semibold text-white">
                        {selectedEvent.ticketing?.availableSeats ?? selectedEvent.ticketing?.totalSeats} / {selectedEvent.ticketing?.totalSeats} Available
                      </span>
                    </div>
                    
                    <div className="h-1.5 w-full rounded-full bg-[#595388]/20 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#595388] to-[#afacca]" 
                        style={{ 
                          width: `${((selectedEvent.ticketing?.availableSeats ?? 0) / (selectedEvent.ticketing?.totalSeats ?? 100)) * 100}%` 
                        }}
                      />
                    </div>

                    {/* Registration Deadline Alert */}
                    {selectedEvent.registrationDeadline && (
                      <div className="flex items-center gap-2 text-[10px] text-yellow-400">
                        <Clock size={12} />
                        <span>Deadline: {new Date(selectedEvent.registrationDeadline).toLocaleString()}</span>
                      </div>
                    )}

                    {registrationStatus.success && (
                      <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/10 text-green-400 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle size={14} />
                        <span>{registrationStatus.success}</span>
                      </div>
                    )}

                    {registrationStatus.error && (
                      <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs">
                        {registrationStatus.error}
                      </div>
                    )}

                    {(() => {
                      const isOrganizer = selectedEvent && user && (
                        (selectedEvent.organizer?._id || selectedEvent.organizer) === user.id
                      );
                      
                      if (isOrganizer) {
                        return (
                          <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[rgba(175,172,202,0.2)] bg-[#595388]/20 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-[#595388]/40"
                          >
                            <span>You are the Host (Manage Event)</span>
                            <ArrowRight size={14} />
                          </button>
                        );
                      }
                      
                      return (
                        <button
                          onClick={() => handleRegister(selectedEvent._id)}
                          disabled={registrationStatus.loading || (selectedEvent.ticketing?.availableSeats ?? 0) <= 0}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#595388] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#595388]/30 transition-all hover:bg-[#6a63a0] hover:shadow-[#595388]/50 disabled:opacity-45"
                        >
                          {registrationStatus.loading ? 'Signing Up...' : 'Register / Participate'}
                          <ArrowRight size={14} />
                        </button>
                      );
                    })()}
                  </div>

                  {/* Detail Tabs/Details Content */}
                  <div className="space-y-4 pt-4 border-t border-[rgba(175,172,202,0.1)]">
                    {/* Hacking / Event Timeline info */}
                    <div className="space-y-2">
                      <span className="block text-[10px] font-bold text-[#afacca] uppercase tracking-wider">Hacking Timeline</span>
                      <div className="grid grid-cols-2 gap-3 text-xs font-display">
                        <div className="rounded-lg bg-[#08070d]/30 border border-[rgba(175,172,202,0.06)] p-3">
                          <span className="block text-[9px] text-[#afacca] uppercase">Hacking Starts</span>
                          <span className="block font-semibold mt-1">
                            {selectedEvent.phases?.hackingStart ? new Date(selectedEvent.phases.hackingStart).toLocaleDateString() : 'TBD'}
                          </span>
                        </div>
                        <div className="rounded-lg bg-[#08070d]/30 border border-[rgba(175,172,202,0.06)] p-3">
                          <span className="block text-[9px] text-[#afacca] uppercase">Hacking Ends</span>
                          <span className="block font-semibold mt-1">
                            {selectedEvent.phases?.hackingEnd ? new Date(selectedEvent.phases.hackingEnd).toLocaleDateString() : 'TBD'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Announcements Feed */}
                    {selectedEvent.announcements && selectedEvent.announcements.length > 0 && (
                      <div className="space-y-3 p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                        <span className="block text-[10px] font-bold text-[#afacca] uppercase tracking-wider flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
                          Latest Broadcasts
                        </span>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                          {selectedEvent.announcements.map((ann, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-[rgba(8,7,13,0.5)] border border-[rgba(175,172,202,0.1)] text-xs space-y-1">
                              <div className="flex justify-between items-start gap-2">
                                <strong className="text-white text-xs">{ann.title}</strong>
                                <span className="text-[9px] text-[#afacca] whitespace-nowrap">
                                  {new Date(ann.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                              <p className="text-[#afacca] leading-relaxed text-[11px]">{ann.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Detailed Overview */}
                    {selectedEvent.description?.detailed && (
                      <div className="space-y-1.5">
                        <span className="block text-[10px] font-bold text-[#afacca] uppercase tracking-wider">About this event</span>
                        <p className="text-xs text-[#afacca] leading-relaxed whitespace-pre-wrap">
                          {selectedEvent.description.detailed}
                        </p>
                      </div>
                    )}

                    {/* Prizes */}
                    {selectedEvent.prizes && (selectedEvent.prizes.firstPlace || selectedEvent.prizes.totalPrizePool > 0) && (
                      <div className="space-y-2">
                        <span className="block text-[10px] font-bold text-[#afacca] uppercase tracking-wider">Prizes & Incentives</span>
                        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 space-y-2">
                          <div className="flex items-center gap-1.5 text-yellow-500 font-display font-bold text-sm">
                            <Trophy size={16} />
                            <span>Total Pool: ₹{selectedEvent.prizes.totalPrizePool.toLocaleString()}</span>
                          </div>
                          <div className="space-y-1.5 text-xs text-[#afacca]">
                            {selectedEvent.prizes.firstPlace && <p>🏆 <strong className="text-white">1st Place:</strong> {selectedEvent.prizes.firstPlace}</p>}
                            {selectedEvent.prizes.secondPlace && <p>🥈 <strong className="text-white">2nd Place:</strong> {selectedEvent.prizes.secondPlace}</p>}
                            {selectedEvent.prizes.thirdPlace && <p>🥉 <strong className="text-white">3rd Place:</strong> {selectedEvent.prizes.thirdPlace}</p>}
                          </div>
                          
                          {/* Swag checkboxes */}
                          {selectedEvent.prizes.swagPerks && (
                            <div className="flex flex-wrap gap-2 pt-2 mt-2 border-t border-[rgba(175,172,202,0.1)]">
                              {Object.entries(selectedEvent.prizes.swagPerks).map(([key, val]) => val && (
                                <span key={key} className="text-[9px] bg-[#595388]/20 border border-[#595388]/40 px-2 py-0.5 rounded text-[#afacca] uppercase font-bold tracking-wider">
                                  {key.replace(/([A-Z])/g, ' $1')}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tracks / Themes */}
                    {selectedEvent.tracks && selectedEvent.tracks.length > 0 && (
                      <div className="space-y-2">
                        <span className="block text-[10px] font-bold text-[#afacca] uppercase tracking-wider">Focus Tracks</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedEvent.tracks.map(track => (
                            <span key={track} className="flex items-center gap-1 text-[11px] bg-[#595388]/20 px-2.5 py-1 rounded-lg border border-[#595388]/30">
                              <Tag size={10} className="text-[#afacca]" />
                              <span>{track}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Problem Statements */}
                    {selectedEvent.customProblemStatements && selectedEvent.customProblemStatements.length > 0 && (
                      <div className="space-y-2">
                        <span className="block text-[10px] font-bold text-[#afacca] uppercase tracking-wider">Problem Challenges</span>
                        <div className="space-y-2">
                          {selectedEvent.customProblemStatements.map((prob, idx) => (
                            <div key={idx} className="p-3 rounded-lg border border-[rgba(175,172,202,0.08)] bg-[#08070d]/30 text-xs">
                              <div className="flex justify-between items-center mb-1">
                                <strong className="text-white">{prob.title}</strong>
                                {prob.sponsor && <span className="text-[9px] text-[#afacca] uppercase tracking-wider">Sponsor: {prob.sponsor}</span>}
                              </div>
                              <p className="text-[#afacca] leading-relaxed text-[11px]">{prob.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Eligibility */}
                    {selectedEvent.eligibility && (
                      <div className="space-y-2">
                        <span className="block text-[10px] font-bold text-[#afacca] uppercase tracking-wider">Team & Eligibility Rules</span>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="p-2.5 rounded-lg bg-[#08070d]/30 border border-[rgba(175,172,202,0.06)]">
                            <span className="block text-[9px] text-[#afacca] uppercase">Team Size Limit</span>
                            <span className="block font-semibold mt-1">
                              {selectedEvent.eligibility.minTeamSize === selectedEvent.eligibility.maxTeamSize
                                ? `${selectedEvent.eligibility.minTeamSize} Member`
                                : `${selectedEvent.eligibility.minTeamSize} to ${selectedEvent.eligibility.maxTeamSize} Members`
                              }
                            </span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-[#08070d]/30 border border-[rgba(175,172,202,0.06)]">
                            <span className="block text-[9px] text-[#afacca] uppercase">Inter-College Teams</span>
                            <span className="block font-semibold mt-1">
                              {selectedEvent.eligibility.interCollegeTeams ? 'Allowed' : 'Restricted (Internal)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Organizer / Contact */}
                    {selectedEvent.organizer && (
                      <div className="space-y-2 pt-2 border-t border-[rgba(175,172,202,0.08)]">
                        <span className="block text-[10px] font-bold text-[#afacca] uppercase tracking-wider">Hosted By</span>
                        <div className="flex items-center gap-2.5 text-xs text-[#afacca]">
                          <div className="h-7 w-7 rounded-full bg-[#595388]/30 flex items-center justify-center text-xs font-bold text-white uppercase">
                            {selectedEvent.organizer.firstName?.[0] || 'O'}
                          </div>
                          <div>
                            <p className="text-white font-medium">{selectedEvent.organizer.firstName} {selectedEvent.organizer.lastName}</p>
                            <p className="text-[10px] text-[#afacca]/80">{selectedEvent.organizer.email}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* FAQs */}
                    {selectedEvent.logistics?.faqs && selectedEvent.logistics.faqs.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <span className="block text-[10px] font-bold text-[#afacca] uppercase tracking-wider">FAQ</span>
                        <div className="space-y-2.5">
                          {selectedEvent.logistics.faqs.map((faq, idx) => (
                            <div key={idx} className="space-y-1">
                              <p className="text-xs font-semibold text-white">Q: {faq.question}</p>
                              <p className="text-[11px] text-[#afacca] leading-relaxed">A: {faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgba(175,172,202,0.05)] py-8 z-10 bg-[#08070d]">
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center gap-4 md:flex-row md:justify-between text-xs text-[#afacca]">
          <div>
            <p className="font-semibold text-white">© 2026 HackFlow Inc. All rights reserved.</p>
            <p className="mt-0.5">Host and discover elite engineering workspaces on the grid.</p>
          </div>
          <div className="flex gap-6">
            <Link to="/events" className="hover:text-[#f7f6f0]">All Events</Link>
            <Link to="/dashboard" className="hover:text-[#f7f6f0]">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EventsExplore;

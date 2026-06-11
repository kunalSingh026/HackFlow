import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Gavel,
  Calendar,
  LogOut,
  RefreshCw,
  Clock,
  MapPin,
  Trophy,
  ArrowRight,
} from 'lucide-react';

const JudgeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAssignedEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events/judge/assigned');
      setAssignedEvents(res.data.events || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch assigned events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedEvents();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#08070d] text-[#f7f6f0] p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[rgba(175,172,202,0.1)] pb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Gavel className="text-[#afacca]" size={24} />
              <h1 className="font-display text-3xl font-bold tracking-tight">
                Judge<span className="text-[#595388]">.</span>Ops
              </h1>
            </div>
            <p className="text-sm text-[#afacca]">
              Assigned Hackathons & Evaluations • Authenticated as {user?.firstName}{' '}
              {user?.lastName}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-[rgba(175,172,202,0.2)] bg-[#595388]/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#afacca] transition-all duration-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
          >
            <LogOut size={14} />
            Terminate Session
          </button>
        </header>

        {error && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <RefreshCw className="animate-spin mb-4 text-[#afacca]" size={36} />
            <p className="text-sm text-[#afacca]">Synchronizing evaluation panels...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-xl font-bold">
                Assigned Hackathons ({assignedEvents.length})
              </h2>
              <button
                onClick={fetchAssignedEvents}
                className="flex items-center gap-1.5 text-xs text-[#afacca] hover:text-white transition-colors"
              >
                <RefreshCw size={12} />
                Refresh
              </button>
            </div>

            {assignedEvents.length === 0 ? (
              <div className="glass-card p-12 rounded-2xl border border-[rgba(175,172,202,0.1)] text-center max-w-xl mx-auto space-y-4">
                <Gavel className="mx-auto text-[#595388]" size={48} />
                <h3 className="font-display text-lg font-bold text-white">
                  No Assigned Hackathons
                </h3>
                <p className="text-xs text-[#afacca] leading-relaxed">
                  You are not currently assigned as a judge to any active hackathons. Admins can
                  assign you to events through the HackFlow Admin Portal.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignedEvents.map((event) => {
                  const isCompleted = event.status === 'completed';
                  return (
                    <div
                      key={event._id}
                      className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-[rgba(175,172,202,0.12)] hover:border-[#595388]/50 transition-all duration-300 relative group overflow-hidden"
                    >
                      {/* Ambient background glow on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#595388]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      <div className="space-y-4 relative z-10">
                        {/* Status Tag */}
                        <div className="flex justify-between items-start">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                              isCompleted
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : event.status === 'ongoing'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-[#595388]/20 text-[#afacca] border border-[rgba(175,172,202,0.15)]'
                            }`}
                          >
                            {event.status}
                          </span>
                          <span className="text-[10px] text-[#afacca] uppercase font-semibold">
                            {event.category}
                          </span>
                        </div>

                        {/* Event Title */}
                        <div>
                          <h3 className="font-display text-lg font-bold text-white group-hover:text-glow transition-all">
                            {event.title}
                          </h3>
                          <p className="text-xs text-[#afacca] line-clamp-2 mt-1">
                            {event.description?.short}
                          </p>
                        </div>

                        {/* Specs */}
                        <div className="space-y-2 pt-2 text-xs text-[#afacca]">
                          <div className="flex items-center gap-2">
                            <Clock size={12} className="text-[#595388]" />
                            <span>
                              {new Date(event.timing?.startDate).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })}{' '}
                              -{' '}
                              {new Date(event.timing?.endDate).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={12} className="text-[#595388]" />
                            <span className="capitalize">
                              {event.mode} {event.venue && `• ${event.venue}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="mt-6 pt-4 border-t border-[rgba(175,172,202,0.08)] flex gap-2 relative z-10">
                        <button
                          onClick={() => navigate(`/events/${event._id}/judge`)}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#595388] hover:bg-[#68619d] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-md shadow-[#595388]/10"
                        >
                          <Gavel size={13} />
                          {isCompleted ? 'View Grades' : 'Evaluate Projects'}
                          <ArrowRight size={12} />
                        </button>
                        {isCompleted && (
                          <button
                            onClick={() => navigate(`/events/${event._id}/leaderboard`)}
                            className="flex items-center justify-center p-2.5 rounded-xl border border-[rgba(175,172,202,0.15)] bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-all"
                            title="View Leaderboard"
                          >
                            <Trophy size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JudgeDashboard;

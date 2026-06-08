import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Shield,
  Users,
  Calendar,
  Search,
  UserCheck,
  Ban,
  Lock,
  Eye,
  Send,
  RefreshCw,
  X,
  Check,
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('users');

  // Users State
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [usersLoading, setUsersLoading] = useState(true);

  // Events State
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Judge Assignment Modal State
  const [selectedEventForJudges, setSelectedEventForJudges] = useState(null);
  const [availableJudges, setAvailableJudges] = useState([]);
  const [assignedJudgeIds, setAssignedJudgeIds] = useState([]);
  const [savingJudges, setSavingJudges] = useState(false);

  // Leaderboard Preview Modal State
  const [selectedEventForPreview, setSelectedEventForPreview] = useState(null);
  const [previewLeaderboard, setPreviewLeaderboard] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // General Error / Success
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Protect route
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
      setActionError('Failed to fetch users database.');
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch Events
  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      const res = await api.get('/admin/events');
      setEvents(res.data.events || []);
    } catch (err) {
      console.error(err);
      setActionError('Failed to fetch events database.');
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchEvents();
    }
    setActionError('');
    setActionSuccess('');
  }, [activeTab]);

  // Handle Ban / Unban
  const handleToggleBan = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/ban`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBanned: res.data.isBanned } : u));
      setActionSuccess(res.data.message);
      setActionError('');
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update user ban status.');
    }
  };

  // Handle Role Change
  const handleChangeRole = async (userId, newRole) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: res.data.user.role } : u));
      setActionSuccess(res.data.message);
      setActionError('');
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  // Open Judge Assignment
  const openAssignJudges = (event) => {
    setSelectedEventForJudges(event);
    setAssignedJudgeIds(event.judges.map(j => j._id || j));
    // Filter out all users with the role 'judge' from our users database
    const judgeUsers = users.filter(u => u.role === 'judge') || [];
    if (judgeUsers.length === 0) {
      // If we don't have users loaded, fetch them or extract judges
      api.get('/admin/users').then(res => {
        const judges = res.data.users.filter(u => u.role === 'judge');
        setAvailableJudges(judges);
      });
    } else {
      setAvailableJudges(judgeUsers);
    }
  };

  // Save Judge Assignment
  const handleSaveJudges = async () => {
    if (!selectedEventForJudges) return;
    try {
      setSavingJudges(true);
      const res = await api.put(`/admin/events/${selectedEventForJudges._id}/judges`, {
        judgeIds: assignedJudgeIds
      });
      setActionSuccess(res.data.message);
      setSelectedEventForJudges(null);
      fetchEvents();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to assign judges.');
    } finally {
      setSavingJudges(false);
    }
  };

  // Open Leaderboard Preview
  const openLeaderboardPreview = async (event) => {
    setSelectedEventForPreview(event);
    setPreviewLoading(true);
    try {
      const res = await api.get(`/events/${event._id}/leaderboard`);
      setPreviewLeaderboard(res.data.leaderboard || []);
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || 'Failed to load leaderboard preview.');
      setSelectedEventForPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Publish Leaderboard
  const handlePublishLeaderboard = async () => {
    if (!selectedEventForPreview) return;
    if (!window.confirm(`Are you absolutely sure you want to publish the leaderboard for "${selectedEventForPreview.title}"? This will lock all grading and email all participants!`)) return;

    try {
      setIsPublishing(true);
      const res = await api.put(`/events/${selectedEventForPreview._id}/publish-leaderboard`);
      setActionSuccess(res.data.message);
      setSelectedEventForPreview(null);
      fetchEvents();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to publish leaderboard.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Filtering users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-[#08070d] text-[#f7f6f0] p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[rgba(175,172,202,0.1)] pb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Shield className="text-[#afacca]" size={24} />
              <h1 className="font-display text-3xl font-bold tracking-tight">HQ<span className="text-[#595388]">.</span>Command</h1>
            </div>
            <p className="text-sm text-[#afacca]">Centralized Management Operations Center</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 rounded-xl border border-[rgba(175,172,202,0.2)] bg-[#595388]/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#afacca] transition-all hover:bg-[#595388]/30"
          >
            Dashboard
            <ChevronRight size={12} />
          </button>
        </header>

        {/* Global Notifications */}
        {actionError && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
            {actionError}
          </div>
        )}
        {actionSuccess && (
          <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10 text-green-400 text-sm">
            {actionSuccess}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-[rgba(175,172,202,0.1)] pb-px">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-semibold transition-all ${
              activeTab === 'users'
                ? 'border-[#595388] text-white'
                : 'border-transparent text-[#afacca] hover:text-white'
            }`}
          >
            <Users size={16} />
            User Moderation
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-semibold transition-all ${
              activeTab === 'events'
                ? 'border-[#595388] text-white'
                : 'border-transparent text-[#afacca] hover:text-white'
            }`}
          >
            <Calendar size={16} />
            Event & Judging Control
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'users' ? (
          <div className="space-y-6">
            
            {/* Search and Filters */}
            <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#afacca]" size={16} />
                <input
                  type="text"
                  placeholder="Search users by name, email, username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field w-full pl-10 text-sm"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="input-field bg-[#08070d] text-sm w-full md:w-44 pr-10"
                >
                  <option value="all">All Roles</option>
                  <option value="participant">Participants</option>
                  <option value="judge">Judges</option>
                  <option value="admin">Admins</option>
                </select>
                <button
                  onClick={fetchUsers}
                  className="p-3 rounded-xl border border-[rgba(175,172,202,0.15)] bg-[#595388]/10 text-[#afacca] hover:text-white transition-all"
                  title="Reload list"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {/* Users Table */}
            {usersLoading ? (
              <div className="flex flex-col justify-center items-center py-20">
                <RefreshCw className="animate-spin text-[#afacca]" size={36} />
                <p className="text-xs text-[#afacca] mt-2">Loading users database...</p>
              </div>
            ) : (
              <div className="glass-card rounded-2xl overflow-hidden border border-[rgba(175,172,202,0.12)]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-[rgba(175,172,202,0.1)] bg-[#595388]/10 text-[#afacca] font-bold text-xs uppercase tracking-wider">
                        <th className="py-4 px-6">Name</th>
                        <th className="py-4 px-6">Username</th>
                        <th className="py-4 px-6">Email</th>
                        <th className="py-4 px-6">Role</th>
                        <th className="py-4 px-6 text-center">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(175,172,202,0.08)]">
                      {filteredUsers.map(u => (
                        <tr key={u._id} className="hover:bg-white/[0.02] transition-all">
                          <td className="py-4 px-6 font-semibold text-white">
                            {u.firstName} {u.lastName}
                          </td>
                          <td className="py-4 px-6 text-[#afacca]">@{u.username}</td>
                          <td className="py-4 px-6 text-[#afacca] font-mono text-xs">{u.email}</td>
                          <td className="py-4 px-6">
                            <select
                              value={u.role}
                              onChange={(e) => handleChangeRole(u._id, e.target.value)}
                              disabled={u._id === user?.id}
                              className="bg-[#08070d] text-xs font-semibold rounded-md border border-[rgba(175,172,202,0.2)] px-2 py-1 outline-none text-[#afacca] focus:border-[#595388]"
                            >
                              <option value="participant">Participant</option>
                              <option value="judge">Judge</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              u.isBanned 
                                ? 'bg-red-500/15 text-red-400 border border-red-500/25' 
                                : 'bg-green-500/15 text-green-400 border border-green-500/25'
                            }`}>
                              {u.isBanned ? 'Banned' : 'Active'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => handleToggleBan(u._id)}
                              disabled={u.role === 'admin'}
                              className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold uppercase transition-all duration-300 ${
                                u.isBanned
                                  ? 'bg-green-500/10 text-green-400 hover:bg-green-500/25 border border-green-500/30'
                                  : 'bg-red-500/10 text-red-400 hover:bg-red-500/25 border border-red-500/30'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {u.isBanned ? <UserCheck size={12} /> : <Ban size={12} />}
                              {u.isBanned ? 'Unban' : 'Ban'}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-xs text-[#afacca] italic">
                            No users match the search criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Events & Judging tab */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-semibold text-white">Event Hackathons list</h3>
              <button
                onClick={fetchEvents}
                className="flex items-center gap-1.5 text-xs text-[#afacca] hover:text-white"
              >
                <RefreshCw size={12} />
                Refresh
              </button>
            </div>

            {eventsLoading ? (
              <div className="flex flex-col justify-center items-center py-20">
                <RefreshCw className="animate-spin text-[#afacca]" size={36} />
                <p className="text-xs text-[#afacca] mt-2">Loading events database...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map(event => {
                  const isCompleted = event.status === 'completed';
                  return (
                    <div 
                      key={event._id} 
                      className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-[rgba(175,172,202,0.12)] relative group"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isCompleted 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
                              : event.status === 'ongoing'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                                : 'bg-[#595388]/20 text-[#afacca] border border-[rgba(175,172,202,0.15)]'
                          }`}>
                            {event.status}
                          </span>
                          <span className="text-[10px] text-[#afacca] font-mono">Organized by {event.organizer?.firstName || 'Host'}</span>
                        </div>

                        <div>
                          <h4 className="font-display font-bold text-lg text-white group-hover:text-glow transition-all">{event.title}</h4>
                          <p className="text-xs text-[#afacca] line-clamp-2 mt-1">{event.description?.short}</p>
                        </div>

                        <div className="pt-2 border-t border-white/[0.05] space-y-2">
                          <p className="text-xs text-[#afacca] font-bold uppercase tracking-wider text-[10px]">Assigned Judges ({event.judges?.length || 0})</p>
                          <div className="flex flex-wrap gap-1.5">
                            {event.judges && event.judges.map(j => (
                              <span key={j._id || j} className="text-[10px] px-2 py-1 rounded bg-[#595388]/20 text-[#afacca] border border-[rgba(175,172,202,0.1)]">
                                {j.firstName ? `${j.firstName} ${j.lastName}` : `ID: ${j}`}
                              </span>
                            ))}
                            {(!event.judges || event.judges.length === 0) && (
                              <span className="text-xs text-[#afacca]/60 italic">No judges assigned yet</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-6 pt-4 border-t border-[rgba(175,172,202,0.08)] flex flex-wrap gap-2">
                        <button
                          onClick={() => openAssignJudges(event)}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[rgba(175,172,202,0.2)] bg-[#595388]/10 px-3 py-2 text-xs font-bold uppercase text-[#afacca] hover:bg-[#595388]/25 hover:text-white transition-all"
                        >
                          <UserCheck size={12} />
                          Assign Judges
                        </button>
                        <button
                          onClick={() => openLeaderboardPreview(event)}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#595388] px-3 py-2 text-xs font-bold uppercase text-white hover:bg-[#68619d] transition-all"
                        >
                          <Eye size={12} />
                          Leaderboard ops
                        </button>
                        {isCompleted && (
                          <button
                            onClick={() => navigate(`/events/${event._id}/leaderboard`)}
                            className="flex items-center justify-center p-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-all"
                            title="Public View"
                          >
                            <Award size={13} />
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

        {/* Modal: Assign Judges */}
        {selectedEventForJudges && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass-card w-full max-w-md rounded-2xl border border-[rgba(175,172,202,0.2)] p-6 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-2 border-b border-[rgba(175,172,202,0.1)]">
                <div>
                  <h3 className="font-display font-bold text-lg text-white">Assign Judges</h3>
                  <p className="text-xs text-[#afacca] mt-0.5">{selectedEventForJudges.title}</p>
                </div>
                <button
                  onClick={() => setSelectedEventForJudges(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-[#afacca] hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-[#afacca] leading-relaxed">
                  Select judges who will evaluate submissions for this event. Users must have the role **Judge** to appear in this list.
                </p>
                <div className="space-y-2 border border-[rgba(175,172,202,0.12)] rounded-xl p-3 bg-black/40 max-h-56 overflow-y-auto">
                  {availableJudges.map(judge => {
                    const isChecked = assignedJudgeIds.includes(judge._id);
                    return (
                      <label 
                        key={judge._id} 
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.03] cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-white">{judge.firstName} {judge.lastName}</span>
                          <span className="text-[10px] text-[#afacca]">@{judge.username}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAssignedJudgeIds(prev => [...prev, judge._id]);
                            } else {
                              setAssignedJudgeIds(prev => prev.filter(id => id !== judge._id));
                            }
                          }}
                          className="w-4 h-4 accent-[#595388]"
                        />
                      </label>
                    );
                  })}
                  {availableJudges.length === 0 && (
                    <p className="text-xs text-[#afacca]/60 italic text-center py-4">
                      No users with the role 'judge' found. Go to User Moderation to promote a user to judge first.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[rgba(175,172,202,0.1)]">
                <button
                  onClick={() => setSelectedEventForJudges(null)}
                  className="rounded-xl border border-[rgba(175,172,202,0.2)] bg-transparent hover:bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#afacca] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveJudges}
                  disabled={savingJudges}
                  className="rounded-xl bg-[#595388] hover:bg-[#68619d] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors disabled:opacity-50"
                >
                  {savingJudges ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Leaderboard Preview & Publishing */}
        {selectedEventForPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass-card w-full max-w-2xl rounded-2xl border border-[rgba(175,172,202,0.2)] p-6 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-2 border-b border-[rgba(175,172,202,0.1)]">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-yellow-400" size={16} />
                    <h3 className="font-display font-bold text-lg text-white">Leaderboard Console</h3>
                  </div>
                  <p className="text-xs text-[#afacca] mt-0.5">{selectedEventForPreview.title}</p>
                </div>
                <button
                  onClick={() => setSelectedEventForPreview(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-[#afacca] hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {previewLoading ? (
                <div className="flex flex-col justify-center items-center py-10">
                  <RefreshCw className="animate-spin text-[#afacca] mb-2" size={24} />
                  <p className="text-xs text-[#afacca]">Calculating scores...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Status Indicator */}
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-[rgba(175,172,202,0.1)]">
                    <div>
                      <span className="text-[10px] text-[#afacca] uppercase block font-bold">Grading Status</span>
                      <strong className="text-xs text-white">
                        {selectedEventForPreview.status === 'completed' 
                          ? 'Grading Locked & Published' 
                          : 'Live Scoring (Active)'}
                      </strong>
                    </div>
                    {selectedEventForPreview.status !== 'completed' && (
                      <button
                        onClick={handlePublishLeaderboard}
                        disabled={isPublishing}
                        className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                      >
                        {isPublishing ? 'Publishing...' : 'Publish Leaderboard'}
                        <Send size={12} />
                      </button>
                    )}
                  </div>

                  {/* Leaderboard Rankings List */}
                  <div className="space-y-2">
                    <p className="text-xs text-[#afacca] font-bold uppercase tracking-wider text-[10px]">Rankings Preview</p>
                    <div className="border border-[rgba(175,172,202,0.12)] rounded-xl overflow-hidden bg-black/40">
                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-[#595388]/15 text-[#afacca] font-bold">
                              <th className="py-2.5 px-4">Rank</th>
                              <th className="py-2.5 px-4">Team</th>
                              <th className="py-2.5 px-4">Github Link</th>
                              <th className="py-2.5 px-4 text-center">Judges Graded</th>
                              <th className="py-2.5 px-4 text-right">Avg Score</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[rgba(175,172,202,0.08)]">
                            {previewLeaderboard.map((team, idx) => (
                              <tr key={team.teamId} className="hover:bg-white/[0.02]">
                                <td className="py-3 px-4 font-bold text-white">#{idx + 1}</td>
                                <td className="py-3 px-4 font-semibold text-white">{team.teamName}</td>
                                <td className="py-3 px-4 text-[#afacca] font-mono text-[10px]">
                                  {team.projectDetails?.githubLink ? (
                                    <a href={team.projectDetails.githubLink} target="_blank" rel="noreferrer" className="underline hover:text-white">
                                      Link
                                    </a>
                                  ) : '-'}
                                </td>
                                <td className="py-3 px-4 text-center text-[#afacca] font-semibold">{team.judgesCount}</td>
                                <td className="py-3 px-4 text-right text-yellow-400 font-bold font-mono text-sm">{team.averageScore} / 100</td>
                              </tr>
                            ))}
                            {previewLeaderboard.length === 0 && (
                              <tr>
                                <td colSpan={5} className="py-6 text-center text-[#afacca] italic">
                                  No teams have been graded yet.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-[rgba(175,172,202,0.1)]">
                <button
                  onClick={() => setSelectedEventForPreview(null)}
                  className="rounded-xl border border-[rgba(175,172,202,0.2)] bg-transparent hover:bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#afacca] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;

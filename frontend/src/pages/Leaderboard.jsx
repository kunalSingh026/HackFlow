import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { motion } from 'framer-motion';
import {
  Trophy,
  Award,
  Video,
  FileText,
  Clock,
  RefreshCw,
  Home,
  ChevronRight,
  Medal,
  Crown
} from 'lucide-react';

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

const Leaderboard = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [leaderboard, setLeaderboard] = useState([]);
  const [eventTitle, setEventTitle] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events/${eventId}/leaderboard`);
      setLeaderboard(res.data.leaderboard || []);
      setEventTitle(res.data.event || '');
      setIsPublished(res.data.isPublished);
      setError('');
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setIsPublished(false);
        setEventTitle(err.response.data.event || 'Hackathon Event');
      } else {
        setError('Failed to load event leaderboard.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [eventId]);

  // Extract Podium Teams
  const podiumTeams = leaderboard.slice(0, 3);
  const remainingTeams = leaderboard.slice(3);

  // Map podium indices for visual placement: [2nd, 1st, 3rd]
  const visualPodium = [];
  if (podiumTeams[1]) visualPodium.push({ ...podiumTeams[1], spot: 2 }); // 2nd Place
  if (podiumTeams[0]) visualPodium.push({ ...podiumTeams[0], spot: 1 }); // 1st Place
  if (podiumTeams[2]) visualPodium.push({ ...podiumTeams[2], spot: 3 }); // 3rd Place

  return (
    <div className="min-h-screen bg-[#08070d] text-[#f7f6f0] p-6 md:p-10 relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="ambient-glow glow-top-right" />
      <div className="ambient-glow glow-bottom-left" style={{ background: 'radial-gradient(circle, rgba(89, 83, 136, 0.12) 0%, transparent 60%)' }} />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation header */}
        <div className="flex justify-between items-center border-b border-[rgba(175,172,202,0.1)] pb-4">
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <Trophy className="text-yellow-500 text-glow" size={20} />
              <span>Leaderboard</span>
            </h1>
            <p className="text-xs text-[#afacca]">{eventTitle || 'Loading event details...'}</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-xs text-[#afacca] hover:text-white transition-colors"
          >
            <Home size={13} />
            <span>Dashboard</span>
            <ChevronRight size={10} />
          </button>
        </div>

        {error ? (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm max-w-md mx-auto text-center">
            {error}
          </div>
        ) : loading ? (
          <div className="flex flex-col justify-center items-center py-24">
            <RefreshCw className="animate-spin text-[#afacca] mb-4" size={36} />
            <p className="text-sm text-[#afacca]">Calibrating rankings & evaluations...</p>
          </div>
        ) : !isPublished && (user?.role !== 'admin') ? (
          /* Unpublished / Pending state */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-12 rounded-3xl border border-[rgba(175,172,202,0.15)] text-center max-w-xl mx-auto space-y-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#595388]/10 to-transparent pointer-events-none" />
            <Clock className="mx-auto text-[#afacca] animate-pulse" size={64} />
            <div className="space-y-2 relative z-10">
              <h2 className="font-display text-2xl font-bold text-white">Standby... Results are pending release</h2>
              <p className="text-sm text-[#afacca] leading-relaxed max-w-md mx-auto">
                The event organizer is currently finalizing scores and grading feedback. 
                Rankings will go live immediately once published. Stay tuned!
              </p>
            </div>
            <div className="pt-4 relative z-10">
              <button 
                onClick={fetchLeaderboard}
                className="rounded-xl bg-[#595388] hover:bg-[#6e67a7] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-md shadow-[#595388]/20"
              >
                Refresh Standings
              </button>
            </div>
          </motion.div>
        ) : (
          /* Leaderboard Live View */
          <div className="space-y-12">
            
            {/* Admin Preview Header notice */}
            {!isPublished && (user?.role === 'admin') && (
              <div className="p-3 rounded-xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 text-xs text-center font-bold">
                ⚠️ ADMIN CONTROL: Viewing PREVIEW standings before going live.
              </div>
            )}

            {/* Podium Section */}
            {podiumTeams.length > 0 && (
              <div className="flex flex-col items-center justify-center pt-8 space-y-2">
                <div className="flex items-end justify-center w-full max-w-3xl gap-4 md:gap-8 px-4 h-80">
                  {visualPodium.map(team => {
                    const is1st = team.spot === 1;
                    const is2nd = team.spot === 2;
                    const is3rd = team.spot === 3;

                    return (
                      <motion.div
                        key={team.teamId}
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: team.spot * 0.15 }}
                        className={`flex flex-col justify-end w-full max-w-[200px] h-full ${
                          is1st ? 'z-10' : 'z-0'
                        }`}
                      >
                        {/* Team Info Card */}
                        <div className="text-center pb-3 space-y-1">
                          <div className="mx-auto flex justify-center mb-1">
                            {is1st && <Crown className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] animate-bounce" size={28} />}
                            {is2nd && <Medal className="text-slate-300 drop-shadow-[0_0_6px_rgba(203,213,225,0.4)]" size={24} />}
                            {is3rd && <Medal className="text-amber-600 drop-shadow-[0_0_6px_rgba(217,119,6,0.4)]" size={22} />}
                          </div>
                          <h3 className="font-display font-bold text-sm md:text-base text-white truncate px-1">
                            {team.teamName}
                          </h3>
                          <span className="text-[10px] text-[#afacca] uppercase tracking-wider block truncate max-w-[150px] mx-auto">
                            {team.projectDetails?.description || 'Project'}
                          </span>
                          <span className="text-xs md:text-sm font-bold font-mono text-yellow-400">
                            {team.averageScore}
                          </span>
                        </div>

                        {/* Visual Pedestal */}
                        <div 
                          className={`rounded-t-2xl flex flex-col items-center justify-between py-4 border-t ${
                            is1st
                              ? 'h-48 bg-gradient-to-b from-yellow-500/20 to-[#595388]/15 border-yellow-500/40 shadow-[0_0_30px_-5px_rgba(234,179,8,0.2)]'
                              : is2nd
                                ? 'h-36 bg-gradient-to-b from-slate-400/20 to-[#595388]/10 border-slate-400/30'
                                : 'h-28 bg-gradient-to-b from-amber-600/20 to-[#595388]/5 border-amber-600/20'
                          }`}
                        >
                          <span className={`text-4xl font-display font-extrabold ${
                            is1st ? 'text-yellow-400' : is2nd ? 'text-slate-300' : 'text-amber-600'
                          }`}>
                            {team.spot}
                          </span>
                          
                          {/* Links in Pedestal */}
                          <div className="flex gap-1.5 justify-center">
                            {team.projectDetails?.githubLink && (
                              <a href={team.projectDetails.githubLink} target="_blank" rel="noreferrer" className="p-1 rounded bg-black/40 hover:bg-black/80 text-[#afacca] hover:text-white transition-all">
                                <Github size={11} />
                              </a>
                            )}
                            {team.projectDetails?.demoVideo && (
                              <a href={team.projectDetails.demoVideo} target="_blank" rel="noreferrer" className="p-1 rounded bg-black/40 hover:bg-black/80 text-[#afacca] hover:text-white transition-all">
                                <Video size={11} />
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Standings Table Section */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg">Overall Standings</h3>
              <div className="glass-card rounded-2xl overflow-hidden border border-[rgba(175,172,202,0.12)]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-[rgba(175,172,202,0.1)] bg-[#595388]/15 text-[#afacca] font-bold text-xs uppercase tracking-wider">
                        <th className="py-3.5 px-6">Rank</th>
                        <th className="py-3.5 px-6">Team Name</th>
                        <th className="py-3.5 px-6">Project Concept</th>
                        <th className="py-3.5 px-6 text-center">Judges Graded</th>
                        <th className="py-3.5 px-6 text-right">Weighted Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(175,172,202,0.08)]">
                      {leaderboard.map((team, idx) => {
                        const isTop3 = idx < 3;
                        return (
                          <tr 
                            key={team.teamId} 
                            className={`transition-all ${
                              isTop3 
                                ? 'bg-[#595388]/5 font-semibold' 
                                : 'hover:bg-white/[0.01]'
                            }`}
                          >
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                idx === 0 
                                  ? 'bg-yellow-400 text-black font-extrabold'
                                  : idx === 1
                                    ? 'bg-slate-300 text-black'
                                    : idx === 2
                                      ? 'bg-amber-600 text-white'
                                      : 'text-[#afacca]'
                              }`}>
                                {idx + 1}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-white">{team.teamName}</td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-[#afacca] max-w-xs truncate block">
                                  {team.projectDetails?.description || 'No description provided'}
                                </span>
                                <div className="flex gap-1.5 flex-shrink-0">
                                  {team.projectDetails?.githubLink && (
                                    <a href={team.projectDetails.githubLink} target="_blank" rel="noreferrer" className="text-[#afacca] hover:text-white transition-colors">
                                      <Github size={12} />
                                    </a>
                                  )}
                                  {team.projectDetails?.demoVideo && (
                                    <a href={team.projectDetails.demoVideo} target="_blank" rel="noreferrer" className="text-[#afacca] hover:text-white transition-colors">
                                      <Video size={12} />
                                    </a>
                                  )}
                                  {team.projectDetails?.presentationLink && (
                                    <a href={team.projectDetails.presentationLink} target="_blank" rel="noreferrer" className="text-[#afacca] hover:text-white transition-colors">
                                      <FileText size={12} />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-center text-[#afacca]">{team.judgesCount}</td>
                            <td className="py-4 px-6 text-right font-bold text-yellow-400 font-mono">
                              {team.averageScore} <span className="text-[10px] text-[#afacca] font-normal">/ 100</span>
                            </td>
                          </tr>
                        );
                      })}
                      {leaderboard.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-xs text-[#afacca] italic">
                            No ranked projects found.
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
      </div>
    </div>
  );
};

export default Leaderboard;

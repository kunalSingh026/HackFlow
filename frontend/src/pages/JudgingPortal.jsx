import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Gavel,
  Video,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Sliders,
  ChevronLeft,
  MessageSquare,
  Sparkles,
  X
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

const JudgingPortal = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [submissions, setSubmissions] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [eventStatus, setEventStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Grading Modal State
  const [gradingTeam, setGradingTeam] = useState(null);
  const [scores, setScores] = useState({}); // e.g., { "Design": 8, "Impact": 9 }
  const [feedback, setFeedback] = useState('');
  const [submittingGrade, setSubmittingGrade] = useState(false);
  const [gradeSuccess, setGradeSuccess] = useState('');

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events/${eventId}/submissions`);
      setSubmissions(res.data.submissions || []);
      setCriteria(res.data.judgingCriteria || []);
      setEventStatus(res.data.eventStatus || 'ongoing');
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch event submissions. Access may be restricted.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [eventId]);

  const openGradingModal = (team) => {
    setGradingTeam(team);
    setGradeSuccess('');
    setError('');

    // Prepopulate scores if already graded
    if (team.isGraded && team.grade && Array.isArray(team.grade.scores)) {
      const initialScores = {};
      team.grade.scores.forEach(s => {
        initialScores[s.criteriaName] = s.score;
      });
      setScores(initialScores);
      setFeedback(team.grade.feedback || '');
    } else {
      // Default all criteria to 5/10
      const defaultScores = {};
      const activeCriteria = criteria.length > 0 ? criteria : [{ criteriaName: "Overall Quality", weightage: 100 }];
      activeCriteria.forEach(c => {
        defaultScores[c.criteriaName] = 5;
      });
      setScores(defaultScores);
      setFeedback('');
    }
  };

  const handleScoreChange = (criteriaName, value) => {
    setScores(prev => ({
      ...prev,
      [criteriaName]: parseFloat(value)
    }));
  };

  // Live calculation of weighted score out of 100
  const calculateLiveWeightedScore = () => {
    let totalWeighted = 0;
    let totalWeight = 0;
    const activeCriteria = criteria.length > 0 ? criteria : [{ criteriaName: "Overall Quality", weightage: 100 }];

    activeCriteria.forEach(c => {
      const score = scores[c.criteriaName] ?? 5;
      totalWeighted += score * c.weightage;
      totalWeight += c.weightage;
    });

    if (totalWeight === 0) return 0;
    return Math.round((totalWeighted / totalWeight) * 10);
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!gradingTeam) return;

    // Convert scores object to format expected by backend
    const scoresArray = Object.keys(scores).map(name => ({
      criteriaName: name,
      score: scores[name]
    }));

    try {
      setSubmittingGrade(true);
      setError('');
      const res = await api.post(`/teams/${gradingTeam._id}/evaluate`, {
        scores: scoresArray,
        feedback
      });

      setGradeSuccess('Evaluation submitted successfully!');
      // Refresh list to show updated status
      await fetchSubmissions();
      setTimeout(() => {
        setGradingTeam(null);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit evaluation.');
    } finally {
      setSubmittingGrade(false);
    }
  };

  // Metrics
  const totalSubmissions = submissions.length;
  const gradedCount = submissions.filter(s => s.isGraded).length;
  const pendingCount = totalSubmissions - gradedCount;
  const progressPercent = totalSubmissions > 0 ? Math.round((gradedCount / totalSubmissions) * 100) : 0;
  const isLocked = eventStatus === 'completed';

  return (
    <div className="min-h-screen bg-[#08070d] text-[#f7f6f0] p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Back navigation & Title */}
        <div className="space-y-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-xs text-[#afacca] hover:text-white transition-colors"
          >
            <ChevronLeft size={14} />
            Back to Dashboard
          </button>

          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[rgba(175,172,202,0.1)] pb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Gavel className="text-[#afacca]" size={24} />
                <h1 className="font-display text-3xl font-bold tracking-tight">Judging<span className="text-[#595388]">.</span>Portal</h1>
              </div>
              <p className="text-sm text-[#afacca]">Assess hackathon projects, input metrics, and submit evaluations</p>
            </div>
            {isLocked && (
              <span className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-400">
                <Clock size={12} />
                Grading Locked
              </span>
            )}
          </header>
        </div>

        {error && !gradingTeam && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <RefreshCw className="animate-spin text-[#afacca] mb-4" size={36} />
            <p className="text-sm text-[#afacca]">Retrieving successfully submitted projects...</p>
          </div>
        ) : (
          <>
            {/* Tracking Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
                <p className="text-[10px] uppercase tracking-widest text-[#afacca] font-bold">Total Submissions</p>
                <h2 className="text-3xl font-display font-bold text-white mt-2">{totalSubmissions}</h2>
              </div>
              <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
                <p className="text-[10px] uppercase tracking-widest text-green-400 font-bold">Evaluated</p>
                <h2 className="text-3xl font-display font-bold text-green-400 mt-2">{gradedCount}</h2>
              </div>
              <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
                <p className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">Pending</p>
                <h2 className="text-3xl font-display font-bold text-amber-400 mt-2">{pendingCount}</h2>
              </div>
              <div className="glass-card p-5 rounded-2xl flex flex-col justify-between border-[rgba(175,172,202,0.2)]">
                <div className="flex justify-between items-center text-[10px] text-[#afacca] font-bold uppercase tracking-widest">
                  <span>Progress</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full bg-[#595388]/10 h-3 rounded-full overflow-hidden mt-3 border border-white/[0.03]">
                  <div 
                    className="bg-gradient-to-r from-[#595388] to-[#afacca] h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Submissions Grid */}
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold">Projects Grid</h2>
              {totalSubmissions === 0 ? (
                <div className="glass-card p-12 rounded-2xl border border-[rgba(175,172,202,0.1)] text-center text-xs text-[#afacca] italic">
                  No submissions have been registered for this event yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {submissions.map(team => {
                    const isGraded = team.isGraded;
                    return (
                      <div 
                        key={team._id} 
                        className={`glass-card rounded-2xl p-6 flex flex-col justify-between border ${
                          isGraded 
                            ? 'border-green-500/20 shadow-lg shadow-green-950/5' 
                            : 'border-[rgba(175,172,202,0.12)]'
                        } hover:border-[#595388]/40 transition-all duration-300 relative group`}
                      >
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              isGraded 
                                ? 'bg-green-500/15 text-green-400 border border-green-500/20' 
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                            }`}>
                              {isGraded ? `Graded: ${Math.round(team.grade?.totalScore)}/100` : 'Pending Score'}
                            </span>
                            <span className="text-[10px] text-[#afacca] font-mono">#{team.joinCode}</span>
                          </div>

                          <div>
                            <h3 className="font-display text-lg font-bold text-white group-hover:text-glow transition-all">
                              {team.name}
                            </h3>
                            <p className="text-xs text-[#afacca] line-clamp-3 mt-1.5 leading-relaxed">
                              {team.project?.description || 'No project description provided.'}
                            </p>
                          </div>

                          {/* Member List */}
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#afacca]/80">Team members</span>
                            <div className="flex flex-wrap gap-1 text-[10px] text-[#afacca]">
                              {team.members?.map(m => (
                                <span key={m._id} className="bg-white/5 px-2 py-0.5 rounded">
                                  {m.firstName} {m.lastName}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Project Submission Links */}
                          <div className="flex gap-2 pt-2 text-[#afacca]">
                            {team.project?.githubLink && (
                              <a 
                                href={team.project.githubLink} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition-all"
                                title="GitHub Repository"
                              >
                                <Github size={14} />
                              </a>
                            )}
                            {team.project?.demoVideo && (
                              <a 
                                href={team.project.demoVideo} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition-all"
                                title="Demo Video Link"
                              >
                                <Video size={14} />
                              </a>
                            )}
                            {team.project?.presentationLink && (
                              <a 
                                href={team.project.presentationLink} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition-all"
                                title="Presentation Slides"
                              >
                                <FileText size={14} />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Grading Action Button */}
                        <div className="mt-6 pt-4 border-t border-[rgba(175,172,202,0.08)]">
                          <button
                            onClick={() => openGradingModal(team)}
                            className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                              isLocked
                                ? 'bg-white/5 text-[#afacca] cursor-default'
                                : isGraded
                                  ? 'border border-green-500/20 bg-green-500/5 text-green-400 hover:bg-green-500/10'
                                  : 'bg-[#595388] text-white hover:bg-[#68619d] shadow-md shadow-[#595388]/10'
                            }`}
                          >
                            <Sliders size={12} />
                            {isLocked ? 'View Grade Details' : isGraded ? 'Edit Evaluation' : 'Score Project'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Modal: Dynamic Grading Form */}
        {gradingTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass-card w-full max-w-lg rounded-2xl border border-[rgba(175,172,202,0.2)] p-6 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-2 border-b border-[rgba(175,172,202,0.1)]">
                <div>
                  <h3 className="font-display font-bold text-lg text-white">Project Evaluation</h3>
                  <p className="text-xs text-[#afacca] mt-0.5">Scoring {gradingTeam.name}</p>
                </div>
                <button
                  onClick={() => setGradingTeam(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-[#afacca] hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {gradeSuccess && (
                <div className="p-3 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 text-xs flex items-center gap-2">
                  <CheckCircle size={14} />
                  <span>{gradeSuccess}</span>
                </div>
              )}
              {error && (
                <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmitEvaluation} className="space-y-6">
                
                {/* Dynamically Map Criteria */}
                <div className="space-y-5">
                  <p className="text-xs text-[#afacca] font-bold uppercase tracking-wider text-[10px]">Judging Criteria Dimensions</p>
                  
                  {(criteria.length > 0 ? criteria : [{ criteriaName: "Overall Quality", weightage: 100 }]).map(crit => {
                    const score = scores[crit.criteriaName] ?? 5;
                    return (
                      <div key={crit.criteriaName} className="space-y-2 p-4 rounded-xl bg-black/30 border border-white/[0.03]">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-white">{crit.criteriaName}</span>
                          <span className="text-[10px] text-[#afacca] font-mono font-bold">Weightage: {crit.weightage}%</span>
                        </div>
                        <div className="flex gap-4 items-center">
                          <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            value={score}
                            onChange={(e) => handleScoreChange(crit.criteriaName, e.target.value)}
                            disabled={isLocked || submittingGrade}
                            className="flex-1 accent-[#595388] cursor-pointer"
                          />
                          <span className="text-sm font-bold font-mono text-[#afacca] w-8 text-right bg-white/5 py-0.5 px-2 rounded">
                            {score}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Score Output & Calculator */}
                <div className="p-4 rounded-xl bg-[#595388]/10 border border-[rgba(175,172,202,0.15)] flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-[#afacca] uppercase block font-bold">Calculated Score</span>
                    <span className="text-xs text-white">Weighted dynamic sum</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="text-yellow-400" size={14} />
                    <span className="text-2xl font-display font-bold text-yellow-400 font-mono">
                      {calculateLiveWeightedScore()}
                    </span>
                    <span className="text-xs text-[#afacca] mt-2 font-mono">/ 100</span>
                  </div>
                </div>

                {/* Feedback Comment */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#afacca] flex items-center gap-1.5">
                    <MessageSquare size={13} />
                    Qualitative Feedback (Optional)
                  </label>
                  <textarea
                    placeholder="Enter notes on technical feasibility, design finesse, and team presentation..."
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    disabled={isLocked || submittingGrade}
                    className="input-field w-full text-xs"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-[rgba(175,172,202,0.1)]">
                  <button
                    type="button"
                    onClick={() => setGradingTeam(null)}
                    className="rounded-xl border border-[rgba(175,172,202,0.2)] bg-transparent hover:bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#afacca] transition-colors"
                  >
                    Cancel
                  </button>
                  {!isLocked && (
                    <button
                      type="submit"
                      disabled={submittingGrade || Object.keys(scores).length === 0}
                      className="rounded-xl bg-[#595388] hover:bg-[#68619d] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors disabled:opacity-50"
                    >
                      {submittingGrade ? 'Saving...' : 'Submit Grades'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default JudgingPortal;

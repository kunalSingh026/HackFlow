import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Calendar,
  Layers,
  Award,
  Settings,
  HelpCircle,
  Plus,
  Trash2,
  ArrowLeft,
  Loader,
  Users
} from 'lucide-react';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Main Event Form State
  const [eventData, setEventData] = useState({
    title: '',
    shortDesc: '',
    detailedDesc: '',
    category: 'Hackathon',
    mode: 'offline',
    totalSeats: 100,
    tags: '',
    isPublic: true,
    venue: '',

    // Timelines
    registrationStart: '',
    registrationEnd: '',
    ideaSubmissionEnd: '',
    shortlistAnnouncement: '',
    hackingStart: '',
    hackingEnd: '',
    judgingValedictory: '',
    mentoringRounds: [],

    // Tracks & Problems
    tracks: [],
    customProblemStatements: [],

    // Prizes
    totalPrizePool: 0,
    firstPlace: '',
    secondPlace: '',
    thirdPlace: '',
    specialCategories: [],
    swagPerks: {
      tshirts: false,
      meals: false,
      cloudCredits: false,
      certificates: false
    },

    // Judging Rubric
    judgingCriteria: [],

    // Eligibility Constraints
    institutionPolicy: 'open',
    interCollegeTeams: true,
    minTeamSize: 1,
    maxTeamSize: 4,

    // Logistics
    discordInvite: '',
    whatsappInvite: '',
    faqs: [],

    // Project Submission Toggles
    submissionRequirements: {
      githubLink: true,
      demoVideo: true,
      presentationLink: true,
      description: true
    }
  });

  // Track Dynamic Inputs state helper
  const [newTrackTag, setNewTrackTag] = useState('');

  // Handle Basic Inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Swag perks handler
  const handleSwagChange = (e) => {
    const { name, checked } = e.target;
    setEventData(prev => ({
      ...prev,
      swagPerks: {
        ...prev.swagPerks,
        [name]: checked
      }
    }));
  };

  // Submission requirements toggles handler
  const handleSubmissionRequirementsChange = (e) => {
    const { name, checked } = e.target;
    setEventData(prev => ({
      ...prev,
      submissionRequirements: {
        ...prev.submissionRequirements,
        [name]: checked
      }
    }));
  };

  // Dynamic Array Adders / Removers
  const addMentoringRound = () => {
    setEventData(prev => ({
      ...prev,
      mentoringRounds: [
        ...prev.mentoringRounds,
        { roundNumber: prev.mentoringRounds.length + 1, time: '', details: '' }
      ]
    }));
  };

  const removeMentoringRound = (index) => {
    setEventData(prev => ({
      ...prev,
      mentoringRounds: prev.mentoringRounds.filter((_, i) => i !== index)
    }));
  };

  const handleMentoringChange = (index, field, value) => {
    const updated = [...eventData.mentoringRounds];
    updated[index][field] = value;
    setEventData(prev => ({ ...prev, mentoringRounds: updated }));
  };

  // Tracks tags handler
  const addTrackTag = () => {
    if (newTrackTag.trim() && !eventData.tracks.includes(newTrackTag.trim())) {
      setEventData(prev => ({
        ...prev,
        tracks: [...prev.tracks, newTrackTag.trim()]
      }));
      setNewTrackTag('');
    }
  };

  const removeTrackTag = (tag) => {
    setEventData(prev => ({
      ...prev,
      tracks: prev.tracks.filter(t => t !== tag)
    }));
  };

  // Custom Problem Statements handler
  const addProblemStatement = () => {
    setEventData(prev => ({
      ...prev,
      customProblemStatements: [
        ...prev.customProblemStatements,
        { title: '', description: '', sponsor: '' }
      ]
    }));
  };

  const removeProblemStatement = (index) => {
    setEventData(prev => ({
      ...prev,
      customProblemStatements: prev.customProblemStatements.filter((_, i) => i !== index)
    }));
  };

  const handleProblemChange = (index, field, value) => {
    const updated = [...eventData.customProblemStatements];
    updated[index][field] = value;
    setEventData(prev => ({ ...prev, customProblemStatements: updated }));
  };

  // Special category prizes handler
  const addSpecialPrize = () => {
    setEventData(prev => ({
      ...prev,
      specialCategories: [
        ...prev.specialCategories,
        { categoryName: '', prizeDescription: '' }
      ]
    }));
  };

  const removeSpecialPrize = (index) => {
    setEventData(prev => ({
      ...prev,
      specialCategories: prev.specialCategories.filter((_, i) => i !== index)
    }));
  };

  const handleSpecialPrizeChange = (index, field, value) => {
    const updated = [...eventData.specialCategories];
    updated[index][field] = value;
    setEventData(prev => ({ ...prev, specialCategories: updated }));
  };

  // Judging criteria handler
  const addJudgingCriteria = () => {
    setEventData(prev => ({
      ...prev,
      judgingCriteria: [
        ...prev.judgingCriteria,
        { criteriaName: '', weightage: 0 }
      ]
    }));
  };

  const removeJudgingCriteria = (index) => {
    setEventData(prev => ({
      ...prev,
      judgingCriteria: prev.judgingCriteria.filter((_, i) => i !== index)
    }));
  };

  const handleJudgingCriteriaChange = (index, field, value) => {
    const updated = [...eventData.judgingCriteria];
    updated[index][field] = field === 'weightage' ? Number(value) : value;
    setEventData(prev => ({ ...prev, judgingCriteria: updated }));
  };

  // FAQs handler
  const addFaq = () => {
    setEventData(prev => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        { question: '', answer: '' }
      ]
    }));
  };

  const removeFaq = (index) => {
    setEventData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  const handleFaqChange = (index, field, value) => {
    const updated = [...eventData.faqs];
    updated[index][field] = value;
    setEventData(prev => ({ ...prev, faqs: updated }));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Pre-validations
    if (!eventData.title.trim()) {
      setError('Event Title is required.');
      setLoading(false);
      return;
    }

    // Chronological validation
    const dates = {
      registrationStart: eventData.registrationStart,
      registrationEnd: eventData.registrationEnd,
      ideaSubmissionEnd: eventData.ideaSubmissionEnd,
      shortlistAnnouncement: eventData.shortlistAnnouncement,
      hackingStart: eventData.hackingStart,
      hackingEnd: eventData.hackingEnd,
      judgingValedictory: eventData.judgingValedictory
    };

    const keys = [
      'registrationStart',
      'registrationEnd',
      'ideaSubmissionEnd',
      'shortlistAnnouncement',
      'hackingStart',
      'hackingEnd',
      'judgingValedictory'
    ];

    for (let i = 0; i < keys.length; i++) {
      const currentVal = dates[keys[i]];
      if (!currentVal) continue;
      
      for (let j = i + 1; j < keys.length; j++) {
        const nextVal = dates[keys[j]];
        if (!nextVal) continue;
        
        if (new Date(currentVal) > new Date(nextVal)) {
          const formatLabel = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          setError(`${formatLabel(keys[i])} must be scheduled before ${formatLabel(keys[j])}.`);
          setLoading(false);
          return;
        }
      }
    }

    if (eventData.mentoringRounds && eventData.mentoringRounds.length > 0) {
      let lastTime = eventData.hackingStart || eventData.registrationStart;
      for (let i = 0; i < eventData.mentoringRounds.length; i++) {
        const round = eventData.mentoringRounds[i];
        if (!round.time) continue;
        if (lastTime && new Date(round.time) < new Date(lastTime)) {
          setError(`Mentoring Round ${i + 1} must be scheduled after ${lastTime === eventData.hackingStart ? 'Hacking Coding Start' : 'previous step/round'}.`);
          setLoading(false);
          return;
        }
        lastTime = round.time;
      }
      
      if (eventData.hackingEnd) {
        const lastRound = eventData.mentoringRounds[eventData.mentoringRounds.length - 1];
        if (lastRound.time && new Date(lastRound.time) > new Date(eventData.hackingEnd)) {
          setError(`Mentoring Round ${eventData.mentoringRounds.length} must be scheduled before Hacking Coding Freeze.`);
          setLoading(false);
          return;
        }
      }
    }

    // Check sum of weightages if judging rubric has items
    if (eventData.judgingCriteria.length > 0) {
      const sum = eventData.judgingCriteria.reduce((acc, curr) => acc + curr.weightage, 0);
      if (sum !== 100) {
        setError(`Judging weightage sum must equal exactly 100%. Current sum: ${sum}%`);
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        title: eventData.title,
        description: {
          short: eventData.shortDesc,
          detailed: eventData.detailedDesc
        },
        category: eventData.category,
        tags: eventData.tags.split(',').map(t => t.trim()).filter(Boolean),
        mode: eventData.mode,
        venue: (eventData.mode === 'offline' || eventData.mode === 'hybrid') ? eventData.venue : '',
        ticketing: {
          isFree: true,
          ticketPrice: 0,
          currency: 'INR',
          totalSeats: Number(eventData.totalSeats),
          availableSeats: Number(eventData.totalSeats),
          maxTicketsPerUser: 1
        },
        visibility: {
          isPublic: eventData.isPublic,
          allowedColleges: []
        },
        phases: {
          registrationStart: eventData.registrationStart || undefined,
          registrationEnd: eventData.registrationEnd || undefined,
          ideaSubmissionEnd: eventData.ideaSubmissionEnd || undefined,
          shortlistAnnouncement: eventData.shortlistAnnouncement || undefined,
          hackingStart: eventData.hackingStart || undefined,
          hackingEnd: eventData.hackingEnd || undefined,
          mentoringRounds: eventData.mentoringRounds,
          judgingValedictory: eventData.judgingValedictory || undefined
        },
        tracks: eventData.tracks,
        customProblemStatements: eventData.customProblemStatements,
        prizes: {
          totalPrizePool: Number(eventData.totalPrizePool),
          firstPlace: eventData.firstPlace,
          secondPlace: eventData.secondPlace,
          thirdPlace: eventData.thirdPlace,
          specialCategories: eventData.specialCategories,
          swagPerks: eventData.swagPerks
        },
        judgingCriteria: eventData.judgingCriteria,
        eligibility: {
          institutionPolicy: eventData.institutionPolicy,
          interCollegeTeams: eventData.interCollegeTeams,
          minTeamSize: Number(eventData.minTeamSize),
          maxTeamSize: Number(eventData.maxTeamSize)
        },
        submissionRequirements: eventData.submissionRequirements,
        logistics: {
          discordInvite: eventData.discordInvite,
          whatsappInvite: eventData.whatsappInvite,
          faqs: eventData.faqs
        }
      };

      await api.post('/events', payload);
      setSuccess('Gated hackathon event created successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to construct event on the grid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08070d] text-[#f7f6f0] p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation / Header */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="p-2.5 rounded-xl border border-[rgba(175,172,202,0.1)] bg-[#595388]/10 hover:bg-[#595388]/20 transition-all text-[#afacca]"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Deploy Hackathon Event</h1>
            <p className="text-xs text-[#afacca]">Specify timelines, tracks, criteria, and logistics</p>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10 text-green-400 text-sm">
            {success}
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex overflow-x-auto gap-2 p-1 bg-[#595388]/10 border border-[rgba(175,172,202,0.1)] rounded-xl">
          {[
            { id: 'basic', label: 'Basic Info', icon: Settings },
            { id: 'timeline', label: 'Timelines', icon: Calendar },
            { id: 'tracks', label: 'Tracks & Problems', icon: Layers },
            { id: 'prizes', label: 'Prizes & Rubric', icon: Award },
            { id: 'logistics', label: 'Eligibility & Links', icon: HelpCircle }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-[#595388] text-[#f7f6f0]' 
                    : 'text-[#afacca] hover:bg-[#595388]/20'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 rounded-2xl border border-[rgba(175,172,202,0.15)] space-y-6">
          
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg text-white border-b border-[rgba(175,172,202,0.1)] pb-2 mb-4">Event Basics</h3>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Hackathon Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Global AI Synergy Hackathon"
                  value={eventData.title}
                  onChange={handleInputChange}
                  className="input-field text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={eventData.category}
                    onChange={handleInputChange}
                    className="input-field text-sm"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Hosting Mode</label>
                  <select
                    name="mode"
                    value={eventData.mode}
                    onChange={handleInputChange}
                    className="input-field text-sm bg-[#08070d]"
                  >
                    <option value="offline">Offline (On-Campus)</option>
                    <option value="online">Online (Virtual)</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              {(eventData.mode === 'offline' || eventData.mode === 'hybrid') && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Venue / Physical Location</label>
                  <input
                    type="text"
                    name="venue"
                    placeholder="e.g. Main Seminar Hall, Block C, Campus"
                    value={eventData.venue}
                    onChange={handleInputChange}
                    className="input-field text-sm"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Total Seats (Max Teams/Individuals)</label>
                  <input
                    type="number"
                    name="totalSeats"
                    value={eventData.totalSeats}
                    onChange={handleInputChange}
                    min="1"
                    className="input-field text-sm"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Tags (Comma Separated)</label>
                  <input
                    type="text"
                    name="tags"
                    placeholder="AI, Web3, FinTech"
                    value={eventData.tags}
                    onChange={handleInputChange}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Short Description (Max 150 chars)</label>
                <input
                  type="text"
                  name="shortDesc"
                  maxLength="150"
                  placeholder="A concise subtitle or snippet about the event..."
                  value={eventData.shortDesc}
                  onChange={handleInputChange}
                  className="input-field text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Detailed Overview & Guidelines</label>
                <textarea
                  name="detailedDesc"
                  rows="5"
                  placeholder="Describe your hackathon, rules, requirements, timelines..."
                  value={eventData.detailedDesc}
                  onChange={handleInputChange}
                  className="input-field text-sm"
                  required
                />
              </div>

              <div className="flex items-center gap-3 mt-4">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={eventData.isPublic}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded bg-[#08070d] border-[rgba(175,172,202,0.2)] text-[#595388]"
                />
                <label htmlFor="isPublic" className="text-xs font-semibold text-[#afacca] cursor-pointer select-none font-semibold">
                  Make event public (Visible to all users immediately)
                </label>
              </div>

              {/* Project Submission Toggles */}
              <div className="pt-4 border-t border-[rgba(175,172,202,0.1)]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca] mb-2 block">Project Submission Requirements</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-[rgba(8,7,13,0.5)] border border-[rgba(175,172,202,0.1)] rounded-xl">
                  {[
                    { name: 'githubLink', label: 'GitHub Repository' },
                    { name: 'demoVideo', label: 'YouTube Video Demo' },
                    { name: 'presentationLink', label: 'Slide Deck / PPT' },
                    { name: 'description', label: 'Project Description' }
                  ].map(req => (
                    <div key={req.name} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`req-${req.name}`}
                        name={req.name}
                        checked={eventData.submissionRequirements[req.name]}
                        onChange={handleSubmissionRequirementsChange}
                        className="h-4 w-4 rounded bg-[#08070d] border-[rgba(175,172,202,0.2)] text-[#595388]"
                      />
                      <label htmlFor={`req-${req.name}`} className="text-xs text-[#afacca] cursor-pointer select-none">
                        {req.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIMELINES */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg text-white border-b border-[rgba(175,172,202,0.1)] pb-2 mb-4">Distinct Phases</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Registration Opens</label>
                  <input
                    type="datetime-local"
                    name="registrationStart"
                    value={eventData.registrationStart}
                    onChange={handleInputChange}
                    className="input-field text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Registration Closes</label>
                  <input
                    type="datetime-local"
                    name="registrationEnd"
                    value={eventData.registrationEnd}
                    onChange={handleInputChange}
                    min={eventData.registrationStart}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Idea/Abstract Submission Deadline</label>
                  <input
                    type="datetime-local"
                    name="ideaSubmissionEnd"
                    value={eventData.ideaSubmissionEnd}
                    onChange={handleInputChange}
                    min={eventData.registrationEnd || eventData.registrationStart}
                    className="input-field text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Shortlist Announcement Date</label>
                  <input
                    type="datetime-local"
                    name="shortlistAnnouncement"
                    value={eventData.shortlistAnnouncement}
                    onChange={handleInputChange}
                    min={eventData.ideaSubmissionEnd || eventData.registrationEnd || eventData.registrationStart}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Hacking Coding Start</label>
                  <input
                    type="datetime-local"
                    name="hackingStart"
                    value={eventData.hackingStart}
                    onChange={handleInputChange}
                    min={eventData.shortlistAnnouncement || eventData.ideaSubmissionEnd || eventData.registrationEnd || eventData.registrationStart}
                    className="input-field text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Hacking Coding Freeze</label>
                  <input
                    type="datetime-local"
                    name="hackingEnd"
                    value={eventData.hackingEnd}
                    onChange={handleInputChange}
                    min={eventData.hackingStart || eventData.shortlistAnnouncement || eventData.ideaSubmissionEnd || eventData.registrationEnd || eventData.registrationStart}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Judging & Valedictory Slot</label>
                <input
                  type="datetime-local"
                  name="judgingValedictory"
                  value={eventData.judgingValedictory}
                  onChange={handleInputChange}
                  min={eventData.hackingEnd || eventData.hackingStart || eventData.shortlistAnnouncement || eventData.ideaSubmissionEnd || eventData.registrationEnd || eventData.registrationStart}
                  className="input-field text-sm"
                />
              </div>

              {/* Mentoring Rounds Section */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Mentoring Rounds Checkpoints</h4>
                  <button
                    type="button"
                    onClick={addMentoringRound}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#afacca] hover:text-white transition-colors bg-[#595388]/20 px-2 py-1 rounded border border-[rgba(175,172,202,0.1)]"
                  >
                    <Plus size={10} /> Add Checkpoint
                  </button>
                </div>

                {eventData.mentoringRounds.map((round, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-3 p-3 rounded-xl border border-[rgba(175,172,202,0.1)] bg-[rgba(8,7,13,0.5)] items-end">
                    <div className="w-12 text-center text-xs font-bold text-[#afacca]">Round {idx + 1}</div>
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-[#afacca]">Date & Time</label>
                      <input
                        type="datetime-local"
                        value={round.time}
                        onChange={(e) => handleMentoringChange(idx, 'time', e.target.value)}
                        min={idx > 0 ? eventData.mentoringRounds[idx - 1].time : (eventData.hackingStart || eventData.registrationStart)}
                        className="input-field text-xs py-1.5"
                      />
                    </div>
                    <div className="flex-[2] flex flex-col gap-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-[#afacca]">Details / Focus</label>
                      <input
                        type="text"
                        placeholder="e.g. Design review, Architecture check"
                        value={round.details}
                        onChange={(e) => handleMentoringChange(idx, 'details', e.target.value)}
                        className="input-field text-xs py-1.5"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMentoringRound(idx)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 3: TRACKS & PROBLEMS */}
          {activeTab === 'tracks' && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg text-white border-b border-[rgba(175,172,202,0.1)] pb-2 mb-4">Tracks & Problem Statements</h3>

              {/* Tracks Tags */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Domain Tracks / Categories</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. FinTech, Healthcare, Web3"
                    value={newTrackTag}
                    onChange={(e) => setNewTrackTag(e.target.value)}
                    className="input-field text-sm flex-1"
                  />
                  <button
                    type="button"
                    onClick={addTrackTag}
                    className="px-4 py-2 bg-[#595388] text-white rounded-xl text-xs font-bold uppercase hover:bg-[#68619d] transition-colors"
                  >
                    Add Track
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {eventData.tracks.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-xs bg-[#595388]/30 px-3 py-1 rounded-full border border-[#595388]/50">
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => removeTrackTag(tag)}
                        className="text-red-400 hover:text-red-300 ml-1 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {eventData.tracks.length === 0 && (
                    <p className="text-xs text-[#afacca] italic">No tracks added. Type a track and click "Add Track".</p>
                  )}
                </div>
              </div>

              {/* Custom Problem Statements */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Specific Problem Statements</h4>
                  <button
                    type="button"
                    onClick={addProblemStatement}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#afacca] hover:text-white transition-colors bg-[#595388]/20 px-2 py-1 rounded border border-[rgba(175,172,202,0.1)]"
                  >
                    <Plus size={10} /> Add Challenge
                  </button>
                </div>

                {eventData.customProblemStatements.map((prob, idx) => (
                  <div key={idx} className="space-y-3 p-4 rounded-xl border border-[rgba(175,172,202,0.1)] bg-[rgba(8,7,13,0.5)] relative">
                    <button
                      type="button"
                      onClick={() => removeProblemStatement(idx)}
                      className="absolute top-4 right-4 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-[#afacca]">Statement Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Decentralized Identity Verification"
                          value={prob.title}
                          onChange={(e) => handleProblemChange(idx, 'title', e.target.value)}
                          className="input-field text-xs py-1.5"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-[#afacca]">Sponsor/Issuer</label>
                        <input
                          type="text"
                          placeholder="e.g. Coinbase or College Dept"
                          value={prob.sponsor}
                          onChange={(e) => handleProblemChange(idx, 'sponsor', e.target.value)}
                          className="input-field text-xs py-1.5"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-[#afacca]">Detailed Description</label>
                      <textarea
                        rows="2"
                        placeholder="Detailed requirements, criteria, resources..."
                        value={prob.description}
                        onChange={(e) => handleProblemChange(idx, 'description', e.target.value)}
                        className="input-field text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 4: PRIZES & JUDGING */}
          {activeTab === 'prizes' && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg text-white border-b border-[rgba(175,172,202,0.1)] pb-2 mb-4">Prizes & Judging Rubric</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Total Prize Pool (Numeric Value)</label>
                  <input
                    type="number"
                    name="totalPrizePool"
                    value={eventData.totalPrizePool}
                    onChange={handleInputChange}
                    className="input-field text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">1st Place Reward Details</label>
                  <input
                    type="text"
                    name="firstPlace"
                    placeholder="e.g. $5,000 cash prize + internship offer"
                    value={eventData.firstPlace}
                    onChange={handleInputChange}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">2nd Place Reward Details</label>
                  <input
                    type="text"
                    name="secondPlace"
                    placeholder="e.g. $3,000 cash prize"
                    value={eventData.secondPlace}
                    onChange={handleInputChange}
                    className="input-field text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">3rd Place Reward Details</label>
                  <input
                    type="text"
                    name="thirdPlace"
                    placeholder="e.g. $1,500 cash prize"
                    value={eventData.thirdPlace}
                    onChange={handleInputChange}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              {/* Special category prizes */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Special Category Prizes</h4>
                  <button
                    type="button"
                    onClick={addSpecialPrize}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#afacca] hover:text-white transition-colors bg-[#595388]/20 px-2 py-1 rounded border border-[rgba(175,172,202,0.1)]"
                  >
                    <Plus size={10} /> Add Special Prize
                  </button>
                </div>

                {eventData.specialCategories.map((spec, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-3 p-3 rounded-xl border border-[rgba(175,172,202,0.1)] bg-[rgba(8,7,13,0.5)] items-end">
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-[#afacca]">Category Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Best UI/UX, Best Sponsor API"
                        value={spec.categoryName}
                        onChange={(e) => handleSpecialPrizeChange(idx, 'categoryName', e.target.value)}
                        className="input-field text-xs py-1.5"
                      />
                    </div>
                    <div className="flex-[2] flex flex-col gap-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-[#afacca]">Prize Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Smart Watch & Cloud Credits"
                        value={spec.prizeDescription}
                        onChange={(e) => handleSpecialPrizeChange(idx, 'prizeDescription', e.target.value)}
                        className="input-field text-xs py-1.5"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSpecialPrize(idx)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Swag Perks Checklist */}
              <div className="pt-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca] mb-2 block">Participant Swag & Perks</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-[rgba(8,7,13,0.5)] border border-[rgba(175,172,202,0.1)] rounded-xl">
                  {[
                    { name: 'tshirts', label: 'Free T-Shirts' },
                    { name: 'meals', label: 'Free Meals/Snacks' },
                    { name: 'cloudCredits', label: 'Cloud Credits' },
                    { name: 'certificates', label: 'Participation Certificates' }
                  ].map(swag => (
                    <div key={swag.name} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`swag-${swag.name}`}
                        name={swag.name}
                        checked={eventData.swagPerks[swag.name]}
                        onChange={handleSwagChange}
                        className="h-4 w-4 rounded bg-[#08070d] border-[rgba(175,172,202,0.2)] text-[#595388]"
                      />
                      <label htmlFor={`swag-${swag.name}`} className="text-xs text-[#afacca] cursor-pointer select-none">
                        {swag.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Judging Evaluation Rubric */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Judging Evaluation Rubric (Must equal 100%)</h4>
                  <button
                    type="button"
                    onClick={addJudgingCriteria}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#afacca] hover:text-white transition-colors bg-[#595388]/20 px-2 py-1 rounded border border-[rgba(175,172,202,0.1)]"
                  >
                    <Plus size={10} /> Add Criterion
                  </button>
                </div>

                {eventData.judgingCriteria.map((crit, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-3 p-3 rounded-xl border border-[rgba(175,172,202,0.1)] bg-[rgba(8,7,13,0.5)] items-end">
                    <div className="flex-[3] flex flex-col gap-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-[#afacca]">Criteria / Dimension Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Technical Complexity, Design, Originality"
                        value={crit.criteriaName}
                        onChange={(e) => handleJudgingCriteriaChange(idx, 'criteriaName', e.target.value)}
                        className="input-field text-xs py-1.5"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-[#afacca]">Weightage (%)</label>
                      <input
                        type="number"
                        placeholder="e.g. 30"
                        min="1"
                        max="100"
                        value={crit.weightage || ''}
                        onChange={(e) => handleJudgingCriteriaChange(idx, 'weightage', e.target.value)}
                        className="input-field text-xs py-1.5"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeJudgingCriteria(idx)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 5: ELIGIBILITY & LOGISTICS */}
          {activeTab === 'logistics' && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg text-white border-b border-[rgba(175,172,202,0.1)] pb-2 mb-4">Eligibility & Support Channels</h3>

              {/* Institution and Team limits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Institution Policy</label>
                  <select
                    name="institutionPolicy"
                    value={eventData.institutionPolicy}
                    onChange={handleInputChange}
                    className="input-field text-sm bg-[#08070d]"
                  >
                    <option value="open">Open to all universities/campuses</option>
                    <option value="internal">Only internal students from our college</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 h-full pt-4">
                  <input
                    type="checkbox"
                    id="interCollegeTeams"
                    name="interCollegeTeams"
                    checked={eventData.interCollegeTeams}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded bg-[#08070d] border-[rgba(175,172,202,0.2)] text-[#595388]"
                  />
                  <label htmlFor="interCollegeTeams" className="text-xs text-[#afacca] cursor-pointer select-none font-semibold">
                    Allow inter-college teams (cross-campus mixes)
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Minimum Team Size</label>
                  <input
                    type="number"
                    name="minTeamSize"
                    value={eventData.minTeamSize}
                    onChange={handleInputChange}
                    min="1"
                    className="input-field text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Maximum Team Size</label>
                  <input
                    type="number"
                    name="maxTeamSize"
                    value={eventData.maxTeamSize}
                    onChange={handleInputChange}
                    min="1"
                    className="input-field text-sm"
                  />
                </div>
              </div>

              {/* Social Channels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Discord Invitation URL</label>
                  <input
                    type="url"
                    name="discordInvite"
                    placeholder="https://discord.gg/invitecode"
                    value={eventData.discordInvite}
                    onChange={handleInputChange}
                    className="input-field text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">WhatsApp Support Group URL</label>
                  <input
                    type="url"
                    name="whatsappInvite"
                    placeholder="https://chat.whatsapp.com/invitecode"
                    value={eventData.whatsappInvite}
                    onChange={handleInputChange}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              {/* Dynamic FAQ list */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Event FAQ Section</h4>
                  <button
                    type="button"
                    onClick={addFaq}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#afacca] hover:text-white transition-colors bg-[#595388]/20 px-2 py-1 rounded border border-[rgba(175,172,202,0.1)]"
                  >
                    <Plus size={10} /> Add FAQ
                  </button>
                </div>

                {eventData.faqs.map((faq, idx) => (
                  <div key={idx} className="space-y-2 p-3 rounded-xl border border-[rgba(175,172,202,0.1)] bg-[rgba(8,7,13,0.5)] relative">
                    <button
                      type="button"
                      onClick={() => removeFaq(idx)}
                      className="absolute top-2 right-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-[#afacca]">Question</label>
                      <input
                        type="text"
                        placeholder="e.g. Will food and hardware be provided?"
                        value={faq.question}
                        onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                        className="input-field text-xs py-1.5"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-[#afacca]">Answer</label>
                      <textarea
                        rows="2"
                        placeholder="e.g. Yes, we will provide meals and standard power supplies, but bring your own laptops and adapters."
                        value={faq.answer}
                        onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)}
                        className="input-field text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* Form Action buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-[rgba(175,172,202,0.1)]">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl border border-[rgba(175,172,202,0.2)] bg-[#595388]/10 hover:bg-[#595388]/20 transition-all text-xs font-bold uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#595388] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#6b64a2] transition-colors shadow-lg shadow-[#595388]/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader size={12} className="animate-spin" />
                  Deploying...
                </>
              ) : (
                'Create & Launch Event'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default CreateEvent;

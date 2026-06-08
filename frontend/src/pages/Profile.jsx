import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Globe,
  Award,
  BookOpen,
  User as UserIcon,
  Tag,
  Settings,
  Mail,
  ArrowLeft,
  Loader,
  CheckCircle,
  Plus,
  Trash2,
  Trophy,
  ExternalLink,
  Zap,
  Terminal,
  Activity
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

const Linkedin = ({ size = 24, className = '', ...props }) => (
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
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);


const Profile = () => {
  const { username: urlUsername } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  
  // Is this the user's own profile?
  const isOwnProfile = !urlUsername || (currentUser && currentUser.username === urlUsername);
  
  // State
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    professionalHeadline: '',
    primaryRole: 'Full Stack',
    experienceLevel: 'Intermediate',
    skills: '',
    techStackTags: [],
    githubUrl: '',
    linkedinUrl: '',
    leetcodeUrl: '',
    codeforcesUrl: '',
    portfolioUrl: '',
    university: '',
    graduationYear: '',
    degree: '',
    mobileNumber: ''
  });
  
  const [newTagInput, setNewTagInput] = useState('');
  const [profilePictureFile, setProfilePictureFile] = useState(null);

  // OTP Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [currentMockOtp, setCurrentMockOtp] = useState('');

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError('');
    setOtpSuccess('');
    try {
      const response = await api.post('/users/verify-mobile', { otp: otpInput });
      setOtpSuccess(response.data.message || 'Verified successfully!');
      setProfileUser(response.data.user);
      setTimeout(() => {
        setShowOtpModal(false);
        setOtpInput('');
        setOtpSuccess('');
      }, 1500);
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Verification failed.');
    }
  };

  const handleResendOtp = async () => {
    setOtpError('');
    setOtpSuccess('');
    try {
      const response = await api.post('/users/resend-mobile-otp');
      setOtpSuccess('OTP resent successfully!');
      if (response.data.mockOtp) {
        setCurrentMockOtp(response.data.mockOtp);
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  // Fetch Profile Data
  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      if (isOwnProfile) {
        // Fetch current logged-in user profile specs from /auth/me or direct endpoint
        const response = await api.get('/auth/me');
        if (response.data && response.data.user) {
          const u = response.data.user;
          setProfileUser(u);
          populateForm(u);
        } else {
          setError('Failed to fetch account.');
        }
      } else {
        // Fetch public profile by username
        const response = await api.get(`/users/profile/${urlUsername}`);
        if (response.data && response.data.user) {
          setProfileUser(response.data.user);
        } else {
          setError('Profile not found.');
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Could not retrieve profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [urlUsername, isOwnProfile]);

  const populateForm = (u) => {
    setFormData({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      bio: u.bio || '',
      professionalHeadline: u.professionalHeadline || '',
      primaryRole: u.primaryRole || 'Full Stack',
      experienceLevel: u.experienceLevel || 'Intermediate',
      skills: u.skills ? u.skills.join(', ') : '',
      techStackTags: u.techStackTags || [],
      githubUrl: u.links?.githubUrl || '',
      linkedinUrl: u.links?.linkedinUrl || '',
      leetcodeUrl: u.links?.leetcodeUrl || '',
      codeforcesUrl: u.links?.codeforcesUrl || '',
      portfolioUrl: u.links?.portfolioUrl || '',
      university: u.education?.university || '',
      graduationYear: u.education?.graduationYear || '',
      degree: u.education?.degree || '',
      mobileNumber: u.mobileNumber || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Tech stack tag managers
  const handleAddTag = () => {
    const cleanTag = newTagInput.trim();
    if (cleanTag && !formData.techStackTags.includes(cleanTag)) {
      setFormData(prev => ({
        ...prev,
        techStackTags: [...prev.techStackTags, cleanTag]
      }));
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      techStackTags: prev.techStackTags.filter(t => t !== tagToRemove)
    }));
  };

  // Submit Profile Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const submitData = new FormData();
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('bio', formData.bio);
      submitData.append('professionalHeadline', formData.professionalHeadline);
      submitData.append('primaryRole', formData.primaryRole);
      submitData.append('experienceLevel', formData.experienceLevel);
      submitData.append('skills', formData.skills);
      submitData.append('techStackTags', JSON.stringify(formData.techStackTags));
      submitData.append('mobileNumber', formData.mobileNumber);
      submitData.append('links', JSON.stringify({
        githubUrl: formData.githubUrl,
        linkedinUrl: formData.linkedinUrl,
        leetcodeUrl: formData.leetcodeUrl,
        codeforcesUrl: formData.codeforcesUrl,
        portfolioUrl: formData.portfolioUrl
      }));
      submitData.append('education', JSON.stringify({
        university: formData.university,
        graduationYear: formData.graduationYear ? Number(formData.graduationYear) : undefined,
        degree: formData.degree
      }));

      if (profilePictureFile) {
        submitData.append('profilePicture', profilePictureFile);
      }

      const response = await api.put('/users/profile', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess('Profile updated successfully!');
      setProfileUser(response.data.user);
      populateForm(response.data.user);
      setProfilePictureFile(null);
      setEditMode(false);

      if (response.data.mockOtp) {
        setCurrentMockOtp(response.data.mockOtp);
        setShowOtpModal(true);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !editMode) {
    return (
      <div className="min-h-screen bg-[#08070d] text-[#f7f6f0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="animate-spin text-[#afacca]" size={32} />
          <p className="text-sm text-[#afacca]">Retrieving profile credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08070d] text-[#f7f6f0] flex flex-col relative selection:bg-[#595388] selection:text-[#f7f6f0]">
      {/* Glow Backdrops */}
      <div className="absolute top-0 left-0 right-0 h-[500px] overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[200px] left-1/3 h-[450px] w-[450px] rounded-full bg-[#595388]/12 blur-[100px]" />
        <div className="absolute top-[100px] right-1/4 h-[350px] w-[350px] rounded-full bg-[#afacca]/8 blur-[90px]" />
      </div>

      {/* Navbar */}
      <nav className="border-b border-[rgba(175,172,202,0.1)] bg-[#08070d]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#595388]">
              <Terminal size={18} className="text-[#f7f6f0]" />
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
          </div>
        </div>
      </nav>

      {/* Main Grid content */}
      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-1 z-10 space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#afacca] hover:text-white transition-all bg-[#595388]/10 hover:bg-[#595388]/20 px-3 py-1.5 rounded-lg border border-[rgba(175,172,202,0.08)]"
          >
            <ArrowLeft size={14} /> Back
          </button>
          
          {isOwnProfile && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 rounded-xl bg-[#595388] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#595388]/20 hover:bg-[#6c65a4] transition-all"
            >
              <Settings size={14} /> Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 text-sm">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* PROFILE PREVIEW COLUMN */}
          <div className={`${editMode ? 'lg:col-span-4' : 'lg:col-span-12'} space-y-6 transition-all duration-300`}>
            {profileUser && (
              <div className="glass-card rounded-3xl border border-[rgba(175,172,202,0.15)] bg-gradient-to-b from-[#595388]/10 via-transparent to-transparent p-6 md:p-8 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-48 w-48 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#595388]/15 blur-[60px]" />
                
                {/* Header Profile Identity block */}
                <div className="flex flex-col md:flex-row md:items-center gap-6 pb-6 border-b border-[rgba(175,172,202,0.1)] justify-between">
                  <div className="flex items-center gap-5">
                    {profileUser.profilePicture ? (
                      <img 
                        src={profileUser.profilePicture} 
                        alt={profileUser.firstName} 
                        className="h-20 w-20 rounded-2xl object-cover border-2 border-[#595388]/60 shadow-lg shadow-[#595388]/10"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-2xl bg-[#595388]/30 flex items-center justify-center font-display font-extrabold text-2xl text-white shadow-lg border border-[rgba(175,172,202,0.15)]">
                        {`${profileUser.firstName?.[0] || ''}${profileUser.lastName?.[0] || ''}`.toUpperCase()}
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <h2 className="font-display font-bold text-2xl text-white">{profileUser.firstName} {profileUser.lastName}</h2>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#595388]/30 border border-[#595388]/50 text-[#afacca]">
                          {profileUser.experienceLevel || 'Intermediate'}
                        </span>
                      </div>
                      <p className="text-xs text-[#afacca]">@{profileUser.username}</p>
                      
                      {profileUser.professionalHeadline && (
                        <p className="text-xs font-semibold text-[#f7f6f0] mt-1.5 italic">
                          " {profileUser.professionalHeadline} "
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Primary Roles */}
                  <div className="flex flex-col md:items-end gap-1.5">
                    <span className="text-[9px] text-[#afacca] uppercase tracking-widest font-bold">Primary Role</span>
                    <span className="rounded-lg bg-[#595388] text-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#595388]/30 border border-[#afacca]/20">
                      {profileUser.primaryRole || 'Full Stack'}
                    </span>
                  </div>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#08070d]/60 border border-[rgba(175,172,202,0.06)] text-center">
                  <div className="space-y-1">
                    <span className="block text-[9px] text-[#afacca] uppercase tracking-widest">Global Rank</span>
                    <span className="block font-display text-lg font-bold text-white">#42</span>
                  </div>
                  <div className="space-y-1 border-l border-[rgba(175,172,202,0.08)]">
                    <span className="block text-[9px] text-[#afacca] uppercase tracking-widest">Events</span>
                    <span className="block font-display text-lg font-bold text-white">4 Attended</span>
                  </div>
                  <div className="space-y-1 border-l border-[rgba(175,172,202,0.08)]">
                    <span className="block text-[9px] text-[#afacca] uppercase tracking-widest">Score</span>
                    <span className="block font-display text-lg font-bold text-green-400">820 XP</span>
                  </div>
                  <div className="space-y-1 border-l border-[rgba(175,172,202,0.08)]">
                    <span className="block text-[9px] text-[#afacca] uppercase tracking-widest">wins</span>
                    <span className="block font-display text-lg font-bold text-yellow-400">1 Gold</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  {/* Left Specs: About, Education, Portfolios */}
                  <div className="space-y-6">
                    {/* Bio */}
                    {profileUser.bio && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#afacca] flex items-center gap-1.5">
                          <UserIcon size={12} /> Personal Bio
                        </h4>
                        <p className="text-xs text-[#afacca] leading-relaxed whitespace-pre-wrap">
                          {profileUser.bio}
                        </p>
                      </div>
                    )}

                    {/* Mobile Number & Verification Status */}
                    {profileUser.mobileNumber && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#afacca] flex items-center gap-1.5">
                          <Activity size={12} /> Contact Details
                        </h4>
                        <div className="p-3.5 rounded-xl border border-[rgba(175,172,202,0.06)] bg-[#08070d]/30 text-xs flex items-center justify-between">
                          <div>
                            <p className="font-bold text-white">{profileUser.mobileNumber}</p>
                            <p className="text-[10px] text-[#afacca]/85 mt-0.5">Mobile Number</p>
                          </div>
                          {isOwnProfile && (
                            <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              profileUser.isMobileVerified 
                                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                                : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 cursor-pointer'
                            }`}
                            onClick={() => {
                              if (!profileUser.isMobileVerified) {
                                handleResendOtp();
                                setShowOtpModal(true);
                              }
                            }}
                            >
                              {profileUser.isMobileVerified ? 'Verified' : 'Unverified - Verify Now'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {profileUser.education?.university && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#afacca] flex items-center gap-1.5">
                          <BookOpen size={12} /> Education Background
                        </h4>
                        <div className="p-3.5 rounded-xl border border-[rgba(175,172,202,0.06)] bg-[#08070d]/30 text-xs">
                          <p className="font-bold text-white">{profileUser.education.university}</p>
                          <p className="text-[#afacca]/85 mt-1">
                            {profileUser.education.degree || 'Degree'} • Class of {profileUser.education.graduationYear || 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Portfolios and Profiles */}
                    <div className="space-y-2.5">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#afacca]">Connect & Portfolios</h4>
                      <div className="flex flex-wrap gap-2.5">
                        {profileUser.links?.githubUrl && (
                          <a 
                            href={profileUser.links.githubUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-lg border border-[rgba(175,172,202,0.12)] bg-[#595388]/10 px-3 py-1.5 text-xs text-[#afacca] hover:text-white hover:border-[#595388] transition-all"
                          >
                            <Github size={13} /> GitHub
                          </a>
                        )}
                        {profileUser.links?.linkedinUrl && (
                          <a 
                            href={profileUser.links.linkedinUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-lg border border-[rgba(175,172,202,0.12)] bg-[#595388]/10 px-3 py-1.5 text-xs text-[#afacca] hover:text-white hover:border-[#595388] transition-all"
                          >
                            <Linkedin size={13} /> LinkedIn
                          </a>
                        )}
                        {profileUser.links?.leetcodeUrl && (
                          <a 
                            href={profileUser.links.leetcodeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-lg border border-[rgba(175,172,202,0.12)] bg-[#595388]/10 px-3 py-1.5 text-xs text-[#afacca] hover:text-white hover:border-[#595388] transition-all"
                          >
                            <Award size={13} /> LeetCode
                          </a>
                        )}
                        {profileUser.links?.codeforcesUrl && (
                          <a 
                            href={profileUser.links.codeforcesUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-lg border border-[rgba(175,172,202,0.12)] bg-[#595388]/10 px-3 py-1.5 text-xs text-[#afacca] hover:text-white hover:border-[#595388] transition-all"
                          >
                            <Zap size={13} /> Codeforces
                          </a>
                        )}
                        {profileUser.links?.portfolioUrl && (
                          <a 
                            href={profileUser.links.portfolioUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-lg border border-[rgba(175,172,202,0.12)] bg-[#595388]/10 px-3 py-1.5 text-xs text-[#afacca] hover:text-white hover:border-[#595388] transition-all"
                          >
                            <Globe size={13} /> Portfolio
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Specs: Stack Tags, Badges, History */}
                  <div className="space-y-6">
                    {/* Arsenal Tag list */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#afacca] flex items-center gap-1.5">
                        <Tag size={12} /> The Hacker Arsenal
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {profileUser.techStackTags && profileUser.techStackTags.map(tag => (
                          <span key={tag} className="text-xs bg-[#595388]/20 border border-[#595388]/40 px-2.5 py-1 rounded-full text-[#afacca]">
                            {tag}
                          </span>
                        ))}
                        {(!profileUser.techStackTags || profileUser.techStackTags.length === 0) && (
                          <p className="text-xs text-[#afacca] italic">Arsenal tags have not been loaded yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Verified Badges / Digital flair */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#afacca] flex items-center gap-1.5">
                        <Award size={12} /> Achievements & Badges
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/25 text-green-400 text-xs">
                          <CheckCircle size={14} />
                          <span>Google Cloud Arcade Expert</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs">
                          <CheckCircle size={14} />
                          <span>Open Source Contributor</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-500/10 border border-purple-500/25 text-purple-400 text-xs">
                          <CheckCircle size={14} />
                          <span>API Expert Cert</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 text-xs">
                          <CheckCircle size={14} />
                          <span>Winner (IITB Hackathon)</span>
                        </div>
                      </div>
                    </div>

                    {/* Project showcase grid */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#afacca] flex items-center gap-1.5">
                        <Trophy size={12} /> Project Showcase
                      </h4>
                      <div className="p-3.5 rounded-xl border border-[rgba(175,172,202,0.06)] bg-[#08070d]/30 text-xs">
                        <p className="font-bold text-white flex items-center justify-between">
                          <span>Cinemax Reservation Hub</span>
                          <ExternalLink size={12} className="text-[#afacca]" />
                        </p>
                        <p className="text-[#afacca]/85 mt-1 leading-relaxed text-[11px]">
                          Built a movie ticket reservation portal utilizing the MERN stack with advanced socket checkins.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* EDIT SETTINGS COLUMN */}
          {editMode && (
            <div className="lg:col-span-8 space-y-6">
              <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 rounded-3xl border border-[rgba(175,172,202,0.18)] space-y-6">
                <div>
                  <h3 className="font-display font-bold text-lg text-white border-b border-[rgba(175,172,202,0.1)] pb-2 mb-4">Edit Profile Settings</h3>
                  <p className="text-xs text-[#afacca]">Establish your hacker resume credentials</p>
                </div>

                {/* Profile Picture Upload */}
                <div className="flex flex-col gap-1.5 p-4 rounded-2xl border border-[rgba(175,172,202,0.1)] bg-[#08070d]/30">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Upload Profile Picture / Headshot</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePictureFile(e.target.files[0])}
                    className="text-xs text-[#afacca] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:uppercase file:bg-[#595388] file:text-white file:cursor-pointer"
                  />
                </div>

                {/* Identity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="input-field text-sm"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="input-field text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Professional Headline</label>
                    <input
                      type="text"
                      name="professionalHeadline"
                      placeholder="e.g. B.Tech sophomore | Backend Developer"
                      value={formData.professionalHeadline}
                      onChange={handleInputChange}
                      className="input-field text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Mobile Number</label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      className="input-field text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Bio Description</label>
                  <textarea
                    name="bio"
                    rows="3"
                    placeholder="Brief description of your skills, goals, interest..."
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="input-field text-sm"
                  />
                </div>

                {/* Roles and Stack */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Primary Role</label>
                    <select
                      name="primaryRole"
                      value={formData.primaryRole}
                      onChange={handleInputChange}
                      className="input-field text-sm bg-[#08070d]"
                    >
                      <option value="Full Stack">Full Stack</option>
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="UI/UX">UI/UX</option>
                      <option value="AI/ML">AI/ML</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Experience Level</label>
                    <select
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleInputChange}
                      className="input-field text-sm bg-[#08070d]"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Tech Stack tag creator */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">The Hacker Arsenal (Tech Stack Tags)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Django, Next.js, Go"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      className="input-field text-sm flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-[#595388] text-white rounded-xl text-xs font-bold uppercase hover:bg-[#68619d] transition-colors"
                    >
                      Add Tag
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {formData.techStackTags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 text-xs bg-[#595388]/30 px-3 py-1 rounded-full border border-[#595388]/50 text-[#afacca]">
                        {tag}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveTag(tag)}
                          className="text-red-400 hover:text-red-300 ml-1 font-bold text-xs"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-[rgba(175,172,202,0.1)] pb-2 mb-3">Education</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">University / School</label>
                      <input
                        type="text"
                        name="university"
                        placeholder="e.g. Netaji Subhas University"
                        value={formData.university}
                        onChange={handleInputChange}
                        className="input-field text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Graduation Year</label>
                      <input
                        type="number"
                        name="graduationYear"
                        placeholder="e.g. 2027"
                        value={formData.graduationYear}
                        onChange={handleInputChange}
                        className="input-field text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Degree / Major</label>
                    <input
                      type="text"
                      name="degree"
                      placeholder="e.g. B.Tech in Computer Science"
                      value={formData.degree}
                      onChange={handleInputChange}
                      className="input-field text-sm"
                    />
                  </div>
                </div>

                {/* Portfolios and Links */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-[rgba(175,172,202,0.1)] pb-2 mb-3">External Links</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">GitHub Link</label>
                      <input
                        type="url"
                        name="githubUrl"
                        placeholder="https://github.com/..."
                        value={formData.githubUrl}
                        onChange={handleInputChange}
                        className="input-field text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">LinkedIn Link</label>
                      <input
                        type="url"
                        name="linkedinUrl"
                        placeholder="https://linkedin.com/in/..."
                        value={formData.linkedinUrl}
                        onChange={handleInputChange}
                        className="input-field text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">LeetCode Link</label>
                      <input
                        type="url"
                        name="leetcodeUrl"
                        placeholder="https://leetcode.com/..."
                        value={formData.leetcodeUrl}
                        onChange={handleInputChange}
                        className="input-field text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Codeforces Link</label>
                      <input
                        type="url"
                        name="codeforcesUrl"
                        placeholder="https://codeforces.com/profile/..."
                        value={formData.codeforcesUrl}
                        onChange={handleInputChange}
                        className="input-field text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Personal Portfolio Link</label>
                    <input
                      type="url"
                      name="portfolioUrl"
                      placeholder="https://yourwebsite.com"
                      value={formData.portfolioUrl}
                      onChange={handleInputChange}
                      className="input-field text-sm"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(175,172,202,0.1)]">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2.5 rounded-xl border border-[rgba(175,172,202,0.15)] text-xs font-bold uppercase tracking-wider text-[#afacca] hover:bg-[rgba(175,172,202,0.05)] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#595388] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#6c65a4] transition-all shadow-md"
                  >
                    Save Specs
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgba(175,172,202,0.05)] py-8 z-10 bg-[#08070d]">
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center gap-4 md:flex-row md:justify-between text-xs text-[#afacca]">
          <div>
            <p className="font-semibold text-white">© 2026 HackFlow Inc. All rights reserved.</p>
          </div>
          <div className="flex gap-6">
            <Link to="/events" className="hover:text-[#f7f6f0]">All Events</Link>
            <Link to="/dashboard" className="hover:text-[#f7f6f0]">Dashboard</Link>
          </div>
        </div>
      </footer>
      {/* OTP verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl border border-[rgba(175,172,202,0.2)] bg-[#0f0d1a] shadow-xl space-y-6">
            <div className="border-b border-[rgba(175,172,202,0.1)] pb-3">
              <h3 className="font-display font-bold text-lg text-white">Verify Mobile Number</h3>
              <p className="text-xs text-[#afacca] mt-1">We've sent a 6-digit verification code to your mobile number.</p>
            </div>

            {/* Mock SMS Notice */}
            {currentMockOtp && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs text-yellow-400 font-mono">
                <strong>Simulated SMS:</strong> Your verification code is: {currentMockOtp}
              </div>
            )}

            {otpError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                {otpError}
              </div>
            )}
            {otpSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400">
                {otpSuccess}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#afacca]">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  maxLength="6"
                  placeholder="123456"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="input-field text-center text-lg tracking-widest font-mono"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="px-4 py-2 border border-[rgba(175,172,202,0.15)] text-xs font-bold uppercase tracking-wider text-[#afacca] rounded-xl hover:bg-[rgba(175,172,202,0.05)] transition-all"
                >
                  Resend OTP
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#595388] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#6c65a4] transition-all"
                >
                  Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

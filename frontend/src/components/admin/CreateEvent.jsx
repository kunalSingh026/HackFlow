import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    MapPin,
    Users,
    FileText,
    Image as ImageIcon,
    Rocket,
    Globe
} from 'lucide-react';

const CreateEvent = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [eventData, setEventData] = useState({
        title: '',
        tagline: '',
        startDate: '',
        endDate: '',
        mode: 'online',
        location: '',
        maxTeamSize: 4,
        maxCapacity: 1000,
        description: '',
        bannerUrl: ''
    });

    const handleChange = (e) => {
        setEventData({
            ...eventData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // TODO: Connect this to the Node.js backend POST /api/events
            console.log("Deploying Event payload:", eventData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            navigate('/dashboard');
        } catch (error) {
            console.error("Failed to create event");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
    <div className="min-h-screen bg-[#08070d] text-[#f7f6f0] p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* ── HEADER ── */}
        <header className="border-b border-[rgba(175,172,202,0.1)] pb-6">
          <div className="flex items-center gap-3 mb-1">
            <Rocket className="text-[#afacca]" size={28} />
            <h1 className="font-display text-3xl font-bold tracking-tight">Initialize <span className="text-[#595388]">Event.</span></h1>
          </div>
          <p className="text-sm text-[#afacca]">Deploy a new hackathon environment to the grid.</p>
        </header>

        {/* ── EVENT CREATION FORM ── */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Core Details */}
          <div className="glass-card p-6 rounded-2xl border-[rgba(175,172,202,0.15)] shadow-[0_0_30px_-5px_rgba(89,83,136,0.1)]">
            <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-6 text-[#f7f6f0]">
              <FileText size={18} className="text-[#595388]" />
              Core Identity
            </h3>
            
            <div className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#afacca]">Event Title</label>
                <input 
                  type="text" 
                  name="title"
                  value={eventData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Global AI Hackathon 2026" 
                  className="input-field text-sm w-full" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#afacca]">Tagline</label>
                <input 
                  type="text" 
                  name="tagline"
                  value={eventData.tagline}
                  onChange={handleChange}
                  placeholder="e.g., Build the future of decentralized intelligence." 
                  className="input-field text-sm w-full" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#afacca]">Description & Rules</label>
                <textarea 
                  name="description"
                  value={eventData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Define the themes, judging criteria, and rules..." 
                  className="input-field text-sm resize-none w-full" 
                />
              </div>
            </div>
          </div>

          {/* Section 2: Logistics & Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl border-[rgba(175,172,202,0.15)]">
              <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-6 text-[#f7f6f0]">
                <Calendar size={18} className="text-[#595388]" />
                Timeline
              </h3>
              <div className="space-y-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#afacca]">Start Date & Time</label>
                  <input 
                    type="datetime-local" 
                    name="startDate"
                    value={eventData.startDate}
                    onChange={handleChange}
                    required
                    className="input-field text-sm w-full" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#afacca]">End Date & Time</label>
                  <input 
                    type="datetime-local" 
                    name="endDate"
                    value={eventData.endDate}
                    onChange={handleChange}
                    required
                    className="input-field text-sm w-full" 
                  />
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border-[rgba(175,172,202,0.15)]">
              <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-6 text-[#f7f6f0]">
                <Globe size={18} className="text-[#595388]" />
                Venue & Mode
              </h3>
              <div className="space-y-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#afacca]">Event Mode</label>
                  <select 
                    name="mode"
                    value={eventData.mode}
                    onChange={handleChange}
                    className="input-field text-sm w-full appearance-none bg-[#08070d]"
                  >
                    <option value="online">Fully Online</option>
                    <option value="offline">In-Person (Offline)</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                
                {/* Only show location if not strictly online */}
                {eventData.mode !== 'online' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#afacca] flex items-center gap-1.5">
                      <MapPin size={12} /> Physical Location
                    </label>
                    <input 
                      type="text" 
                      name="location"
                      value={eventData.location}
                      onChange={handleChange}
                      placeholder="e.g., Main Auditorium, Jamshedpur" 
                      className="input-field text-sm w-full" 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Capacity & Media */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl border-[rgba(175,172,202,0.15)]">
              <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-6 text-[#f7f6f0]">
                <Users size={18} className="text-[#595388]" />
                Capacity Limits
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#afacca]">Max Team Size</label>
                  <input 
                    type="number" 
                    name="maxTeamSize"
                    value={eventData.maxTeamSize}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    className="input-field text-sm w-full" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#afacca]">Total Capacity</label>
                  <input 
                    type="number" 
                    name="maxCapacity"
                    value={eventData.maxCapacity}
                    onChange={handleChange}
                    min="10"
                    className="input-field text-sm w-full" 
                  />
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border-[rgba(175,172,202,0.15)]">
              <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-6 text-[#f7f6f0]">
                <ImageIcon size={18} className="text-[#595388]" />
                Media Assets
              </h3>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#afacca]">Banner Image URL</label>
                <input 
                  type="url" 
                  name="bannerUrl"
                  value={eventData.bannerUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/banner.png" 
                  className="input-field text-sm w-full" 
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#595388] text-[#f7f6f0] text-sm font-bold uppercase tracking-wider hover:bg-[#6a63a0] transition-colors shadow-lg shadow-[#595388]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Initializing Event...</span>
              ) : (
                <>
                  <Rocket size={18} />
                  Deploy Hackathon
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
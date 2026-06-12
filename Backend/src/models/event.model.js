const mongoose = require('mongoose');
const slugify = require('slugify');

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      short: {
        type: String,
        required: true,
        maxLength: 150,
      },
      detailed: {
        type: String,
        required: true,
      },
    },
    category: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    judges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    timing: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
      timezone: {
        type: String,
        default: 'Asia/Kolkata',
      },
    },
    registrationDeadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed'],
      default: 'upcoming',
    },
    mode: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      default: 'offline',
    },
    venue: {
      type: String,
      trim: true,
      default: '',
    },
    announcements: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    //2. The Virtual Venue
    meetingLinks: [
      {
        platform: { type: String, required: true },
        url: { type: String, required: true },
        password: { type: String },
        purpose: { type: String }, // e.g., "Main Stage", "Mentor Lounge"
      },
    ],

    // 3. The Digital Itinerary
    itinerary: [
      {
        title: { type: String, required: true },
        description: { type: String },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        meetingUrl: { type: String },
      },
    ],

    // Media & UI
    images: {
      thumbnail: {
        type: String,
        default: '',
      },
      banner: {
        type: String,
        default: '',
      },
    },
    ticketing: {
      isFree: {
        type: Boolean,
        default: true,
      },
      ticketPrice: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: 'INR',
      },
      totalSeats: {
        type: Number,
        required: true,
      },
      availableSeats: {
        type: Number,
        required: true,
      },
      maxTicketsPerUser: {
        type: Number,
        default: 1,
      },
    },

    visibility: {
      isPublic: { type: Boolean, default: true },
      allowedColleges: [{ type: String }], // Only these colleges can see/join if isPublic is false
      requiresApproval: { type: Boolean, default: false },
    },

    // 1. Phase-Based Timelines
    phases: {
      registrationStart: { type: Date },
      registrationEnd: { type: Date },
      ideaSubmissionEnd: { type: Date },
      shortlistAnnouncement: { type: Date },
      hackingStart: { type: Date },
      hackingEnd: { type: Date },
      mentoringRounds: [
        {
          roundNumber: { type: Number },
          time: { type: Date },
          details: { type: String },
        },
      ],
      judgingValedictory: { type: Date },
    },

    // 2. Tracks & Themes
    tracks: [{ type: String }],
    customProblemStatements: [
      {
        title: { type: String },
        description: { type: String },
        sponsor: { type: String },
      },
    ],

    // 3. Prizes & Incentives
    prizes: {
      totalPrizePool: { type: Number, default: 0 },
      firstPlace: { type: String, default: '' },
      secondPlace: { type: String, default: '' },
      thirdPlace: { type: String, default: '' },
      specialCategories: [
        {
          categoryName: { type: String },
          prizeDescription: { type: String },
        },
      ],
      swagPerks: {
        tshirts: { type: Boolean, default: false },
        meals: { type: Boolean, default: false },
        cloudCredits: { type: Boolean, default: false },
        certificates: { type: Boolean, default: false },
      },
    },

    // 4. Judging Criteria
    judgingCriteria: [
      {
        criteriaName: { type: String },
        weightage: { type: Number },
      },
    ],

    // 5. Team & Eligibility Constraints
    eligibility: {
      institutionPolicy: { type: String, enum: ['internal', 'open'], default: 'open' },
      interCollegeTeams: { type: Boolean, default: true },
      minTeamSize: { type: Number, default: 1 },
      maxTeamSize: { type: Number, default: 4 },
    },

    // 6. Logistics & Communication Links
    logistics: {
      discordInvite: { type: String, default: '' },
      whatsappInvite: { type: String, default: '' },
      faqs: [
        {
          question: { type: String },
          answer: { type: String },
        },
      ],
    },

    sponsors: [
      {
        name: { type: String },
        logo: { type: String }, // Cloudinary URL
        website: { type: String },
      },
    ],

    contactInfo: {
      email: { type: String },
      website: { type: String },
      socialLinks: { type: Map, of: String }, // Allows flexible key-values like { "twitter": "url", "linkedin": "url" }
    },

    submissionRequirements: {
      githubLink: { type: Boolean, default: true },
      demoVideo: { type: Boolean, default: true },
      presentationLink: { type: Boolean, default: true },
      description: { type: Boolean, default: true },
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    registrationCount: { type: Number, default: 0 }, //Computed field, much safer than an array!
  },
  {
    timestamps: true,
  }
);

EventSchema.pre('save', function () {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
});
module.exports = mongoose.model('Event', EventSchema);

const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const Auth = require('../../modules/auth/auth.model');
const User = require('../../modules/users/user.model');
const Listing = require('../../modules/listings/listing.model');
const QuizResult = require('../../modules/quiz/quizResult.model');

const DEMO_PHONE_NUMBER = '7387919142';

const demoUsers = [
  // === MALE STUDENTS ===
  // --- NANDED ---
  {
    email: 'arjun.sharma@demo.com', password: 'Demo@1234', role: 'student',
    profile: {
      fullName: 'Arjun Sharma', gender: 'male', college: 'SGGSIET (Shri Guru Gobind Singhji Institute of Engineering and Technology), Nanded',
      course: 'B.Tech', year: 3, city: 'Nanded', district: 'Nanded', state: 'Maharashtra', area: 'Vishnupuri',
      budgetRange: { min: 4000, max: 7000 }, foodPreference: 'veg', foodArrangement: 'mess',
      smokingHabit: 'no', drinkingHabit: 'no', sleepSchedule: 'night-owl',
      guestPreference: 'occasional', noisePreference: 'moderate', isProfileComplete: true, hasCompletedQuiz: true,
      bio: 'CS student at SGGS Nanded. Passionate about coding and open source. Looking for a study-oriented male roommate.',
      personalityTags: ['Night Owl', 'Study Focused', 'Easy Going'],
      verificationStatus: 'verified',
      phoneNumber: DEMO_PHONE_NUMBER,
      compatibilityScores: { cleanliness: 8, study: 9, social: 5, sleep: 8, financial: 7, conflict: 8 },
    },
  },
  {
    email: 'rohit.verma@demo.com', password: 'Demo@1234', role: 'student',
    profile: {
      fullName: 'Rohit Verma', gender: 'male', college: "MGM's College of Engineering, Nanded",
      course: 'B.Tech', year: 2, city: 'Nanded', district: 'Nanded', state: 'Maharashtra', area: 'Namaskar Chowk',
      budgetRange: { min: 3000, max: 6000 }, foodPreference: 'non-veg', foodArrangement: 'tiffin',
      smokingHabit: 'no', drinkingHabit: 'occasionally', sleepSchedule: 'early-bird',
      guestPreference: 'no-guests', noisePreference: 'quiet', isProfileComplete: true, hasCompletedQuiz: true,
      bio: 'Mechanical branch at MGM. Regular gym-goer, friendly but values clean spaces. Quiet hours are preferred.',
      personalityTags: ['Early Bird', 'Budget Saver', 'Clean Planner'],
      verificationStatus: 'verified',
      phoneNumber: DEMO_PHONE_NUMBER,
      compatibilityScores: { cleanliness: 9, study: 6, social: 3, sleep: 2, financial: 8, conflict: 7 },
    },
  },
  {
    email: 'kunal.mehta@demo.com', password: 'Demo@1234', role: 'student',
    profile: {
      fullName: 'Kunal Mehta', gender: 'male', college: 'SRTMUN (Swami Ramanand Teerth Marathwada University), Nanded',
      course: 'MBA', year: 1, city: 'Nanded', district: 'Nanded', state: 'Maharashtra', area: 'Vazirabad',
      budgetRange: { min: 6000, max: 10000 }, foodPreference: 'veg', foodArrangement: 'online-ordering',
      smokingHabit: 'no', drinkingHabit: 'occasionally', sleepSchedule: 'flexible',
      guestPreference: 'frequent', noisePreference: 'moderate', isProfileComplete: true, hasCompletedQuiz: true,
      bio: 'MBA fresher at SRTMUN. Tech-startup enthusiast. Looking for a roommate to split a nice flat in Vazirabad.',
      personalityTags: ['Social Explorer', 'Easy Going'],
      verificationStatus: 'unverified',
      phoneNumber: DEMO_PHONE_NUMBER,
      compatibilityScores: { cleanliness: 5, study: 5, social: 9, sleep: 5, financial: 5, conflict: 7 },
    },
  },
  {
    email: 'dev.patel@demo.com', password: 'Demo@1234', role: 'student',
    profile: {
      fullName: 'Dev Patel', gender: 'male', college: 'Yeshwant Mahavidyalaya, Nanded',
      course: 'BSc', year: 3, city: 'Nanded', district: 'Nanded', state: 'Maharashtra', area: 'Shivaji Nagar',
      budgetRange: { min: 3500, max: 6000 }, foodPreference: 'jain', foodArrangement: 'mess',
      smokingHabit: 'no', drinkingHabit: 'no', sleepSchedule: 'early-bird',
      guestPreference: 'no-guests', noisePreference: 'quiet', isProfileComplete: true, hasCompletedQuiz: true,
      bio: 'BSc final year at Yeshwant College. Strictly vegetarian/Jain diet. Looking for a neat roommate.',
      personalityTags: ['Early Bird', 'Study Focused', 'Budget Saver'],
      verificationStatus: 'pending',
      phoneNumber: DEMO_PHONE_NUMBER,
      compatibilityScores: { cleanliness: 8, study: 8, social: 2, sleep: 2, financial: 9, conflict: 9 },
    },
  },

  // --- PUNE ---
  {
    email: 'rahul.joshi@demo.com', password: 'Demo@1234', role: 'student',
    profile: {
      fullName: 'Rahul Joshi', gender: 'male', college: 'COEP Technological University, Pune',
      course: 'B.Tech', year: 4, city: 'Pune', district: 'Pune', state: 'Maharashtra', area: 'Shivajinagar',
      budgetRange: { min: 5000, max: 9000 }, foodPreference: 'veg', foodArrangement: 'self-cooking',
      smokingHabit: 'no', drinkingHabit: 'no', sleepSchedule: 'night-owl',
      guestPreference: 'occasional', noisePreference: 'moderate', isProfileComplete: true, hasCompletedQuiz: true,
      bio: 'COEP Computer Engineering student. Love coding, trekking around Pune, and tea. Chill vibes only.',
      personalityTags: ['Night Owl', 'Study Focused', 'Easy Going'],
      verificationStatus: 'verified',
      phoneNumber: DEMO_PHONE_NUMBER,
      compatibilityScores: { cleanliness: 7, study: 9, social: 6, sleep: 8, financial: 7, conflict: 8 },
    },
  },
  {
    email: 'siddharth.sen@demo.com', password: 'Demo@1234', role: 'student',
    profile: {
      fullName: 'Siddharth Sen', gender: 'male', college: 'Pune Institute of Computer Technology (PICT), Pune',
      course: 'B.Tech', year: 2, city: 'Pune', district: 'Pune', state: 'Maharashtra', area: 'Katraj',
      budgetRange: { min: 4500, max: 8000 }, foodPreference: 'non-veg', foodArrangement: 'mess',
      smokingHabit: 'no', drinkingHabit: 'no', sleepSchedule: 'flexible',
      guestPreference: 'frequent', noisePreference: 'moderate', isProfileComplete: true, hasCompletedQuiz: true,
      bio: 'Electronics branch at PICT. Coding enthusiast, football player. Extremely social and easy-going.',
      personalityTags: ['Social Explorer', 'Easy Going', 'Active Lifestyle'],
      verificationStatus: 'verified',
      phoneNumber: DEMO_PHONE_NUMBER,
      compatibilityScores: { cleanliness: 6, study: 7, social: 8, sleep: 6, financial: 7, conflict: 8 },
    },
  },

  // --- MUMBAI ---
  {
    email: 'sameer.kulkarni@demo.com', password: 'Demo@1234', role: 'student',
    profile: {
      fullName: 'Sameer Kulkarni', gender: 'male', college: 'VJTI (Veermata Jijabai Technological Institute), Mumbai',
      course: 'B.Tech', year: 3, city: 'Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', area: 'Wadala',
      budgetRange: { min: 6000, max: 11000 }, foodPreference: 'veg', foodArrangement: 'online-ordering',
      smokingHabit: 'no', drinkingHabit: 'no', sleepSchedule: 'night-owl',
      guestPreference: 'frequent', noisePreference: 'moderate', isProfileComplete: true, hasCompletedQuiz: true,
      bio: 'VJTI student. Passionate about robotics and gaming. Looking for a neat guy to share a flat near Wadala.',
      personalityTags: ['Night Owl', 'Social Explorer', 'Balanced'],
      verificationStatus: 'verified',
      phoneNumber: DEMO_PHONE_NUMBER,
      compatibilityScores: { cleanliness: 8, study: 7, social: 7, sleep: 8, financial: 6, conflict: 7 },
    },
  },
  {
    email: 'aditya.singhal@demo.com', password: 'Demo@1234', role: 'student',
    profile: {
      fullName: 'Aditya Singhal', gender: 'male', college: 'IIT Bombay (Indian Institute of Technology), Mumbai',
      course: 'B.Tech', year: 1, city: 'Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', area: 'Powai',
      budgetRange: { min: 8000, max: 15000 }, foodPreference: 'non-veg', foodArrangement: 'mess',
      smokingHabit: 'no', drinkingHabit: 'no', sleepSchedule: 'night-owl',
      guestPreference: 'no-guests', noisePreference: 'quiet', isProfileComplete: true, hasCompletedQuiz: true,
      bio: 'IIT Bombay CSE fresher. Tech-driven, silent learner. Need a quiet roommate who respects focus time.',
      personalityTags: ['Night Owl', 'Study Focused', 'Clean Planner'],
      verificationStatus: 'verified',
      phoneNumber: DEMO_PHONE_NUMBER,
      compatibilityScores: { cleanliness: 9, study: 9, social: 3, sleep: 8, financial: 8, conflict: 8 },
    },
  },

  // === FEMALE STUDENTS ===
  // --- NANDED ---
  {
    email: 'priya.nair@demo.com', password: 'Demo@1234', role: 'student',
    profile: {
      fullName: 'Priya Nair', gender: 'female', college: 'SGGSIET (Shri Guru Gobind Singhji Institute of Engineering and Technology), Nanded',
      course: 'B.Tech', year: 3, city: 'Nanded', district: 'Nanded', state: 'Maharashtra', area: 'Vishnupuri',
      budgetRange: { min: 4500, max: 8000 }, foodPreference: 'veg', foodArrangement: 'mess',
      smokingHabit: 'no', drinkingHabit: 'no', sleepSchedule: 'night-owl',
      guestPreference: 'occasional', noisePreference: 'moderate', isProfileComplete: true, hasCompletedQuiz: true,
      bio: 'B.Tech IT student at SGGSIET. Avid reader and writer. Looking for a quiet studious female roommate.',
      personalityTags: ['Night Owl', 'Study Focused', 'Clean Planner'],
      verificationStatus: 'verified',
      phoneNumber: DEMO_PHONE_NUMBER,
      compatibilityScores: { cleanliness: 8, study: 9, social: 5, sleep: 8, financial: 7, conflict: 8 },
    },
  },
  {
    email: 'sneha.gupta@demo.com', password: 'Demo@1234', role: 'student',
    profile: {
      fullName: 'Sneha Gupta', gender: 'female', college: "MGM's College of Engineering, Nanded",
      course: 'B.Tech', year: 2, city: 'Nanded', district: 'Nanded', state: 'Maharashtra', area: 'Namaskar Chowk',
      budgetRange: { min: 4000, max: 7000 }, foodPreference: 'eggetarian', foodArrangement: 'self-cooking',
      smokingHabit: 'no', drinkingHabit: 'no', sleepSchedule: 'early-bird',
      guestPreference: 'occasional', noisePreference: 'moderate', isProfileComplete: true, hasCompletedQuiz: true,
      bio: 'Civil engineering branch at MGM. Love baking, indoor plants, and soft music. Values high cleanliness.',
      personalityTags: ['Early Bird', 'Clean Planner', 'Balanced'],
      verificationStatus: 'verified',
      phoneNumber: DEMO_PHONE_NUMBER,
      compatibilityScores: { cleanliness: 9, study: 7, social: 5, sleep: 3, financial: 7, conflict: 8 },
    },
  },
  {
    email: 'ananya.rao@demo.com', password: 'Demo@1234', role: 'student',
    profile: {
      fullName: 'Ananya Rao', gender: 'female', college: 'SRTMUN (Swami Ramanand Teerth Marathwada University), Nanded',
      course: 'BSc', year: 1, city: 'Nanded', district: 'Nanded', state: 'Maharashtra', area: 'Vazirabad',
      budgetRange: { min: 3500, max: 6000 }, foodPreference: 'veg', foodArrangement: 'tiffin',
      smokingHabit: 'no', drinkingHabit: 'no', sleepSchedule: 'flexible',
      guestPreference: 'no-guests', noisePreference: 'quiet', isProfileComplete: true, hasCompletedQuiz: true,
      bio: 'BSc Biotechnology at SRTMUN. Yoga and meditation practitioner. Looking for a respectful, quiet roommate.',
      personalityTags: ['Study Focused', 'Homebody', 'Budget Saver'],
      verificationStatus: 'unverified',
      phoneNumber: DEMO_PHONE_NUMBER,
      compatibilityScores: { cleanliness: 7, study: 9, social: 2, sleep: 5, financial: 9, conflict: 9 },
    },
  },

  // --- PUNE ---
  {
    email: 'pooja.deshpande@demo.com', password: 'Demo@1234', role: 'student',
    profile: {
      fullName: 'Pooja Deshpande', gender: 'female', college: 'COEP Technological University, Pune',
      course: 'B.Tech', year: 3, city: 'Pune', district: 'Pune', state: 'Maharashtra', area: 'Shivajinagar',
      budgetRange: { min: 5000, max: 9500 }, foodPreference: 'veg', foodArrangement: 'tiffin',
      smokingHabit: 'no', drinkingHabit: 'no', sleepSchedule: 'flexible',
      guestPreference: 'occasional', noisePreference: 'moderate', isProfileComplete: true, hasCompletedQuiz: true,
      bio: 'Electrical student at COEP. Into classical music and painting. Looking for a tidy roommate in Shivajinagar.',
      personalityTags: ['Clean Planner', 'Balanced', 'Easy Going'],
      verificationStatus: 'verified',
      phoneNumber: DEMO_PHONE_NUMBER,
      compatibilityScores: { cleanliness: 8, study: 8, social: 5, sleep: 5, financial: 7, conflict: 8 },
    },
  },

  // === OWNERS ===
  {
    email: 'rajesh.owner@demo.com', password: 'Demo@1234', role: 'owner',
    profile: {
      fullName: 'Rajesh Patel', gender: 'male', college: "MGM's College of Engineering, Nanded",
      course: 'N/A', year: 1, city: 'Nanded', district: 'Nanded', state: 'Maharashtra', area: 'Namaskar Chowk',
      bio: 'Property owner renting premium rooms and PGs near MGM College.',
      isProfileComplete: true, hasCompletedQuiz: false, verificationStatus: 'verified',
      phoneNumber: DEMO_PHONE_NUMBER,
      personalityTags: ['Owner', 'Friendly'],
    }
  },
  {
    email: 'meena.owner@demo.com', password: 'Demo@1234', role: 'owner',
    profile: {
      fullName: 'Meena Verma', gender: 'female', college: 'SGGSIET (Shri Guru Gobind Singhji Institute of Engineering and Technology), Nanded',
      course: 'N/A', year: 1, city: 'Nanded', district: 'Nanded', state: 'Maharashtra', area: 'Vishnupuri',
      bio: 'Owner of verified girl PGs and hostels near SGGS campus.',
      isProfileComplete: true, hasCompletedQuiz: false, verificationStatus: 'verified',
      phoneNumber: DEMO_PHONE_NUMBER,
      personalityTags: ['Owner', 'Professional'],
    }
  },
  {
    email: 'ramesh.owner@demo.com', password: 'Demo@1234', role: 'owner',
    profile: {
      fullName: 'Ramesh Deshmukh', gender: 'male', college: "MGM's College of Engineering, Nanded",
      course: 'N/A', year: 1, city: 'Nanded', district: 'Nanded', state: 'Maharashtra', area: 'Srinagar',
      bio: 'Rents flats and shared rooms around Srinagar and Anand Nagar.',
      isProfileComplete: true, hasCompletedQuiz: false, verificationStatus: 'verified',
      phoneNumber: DEMO_PHONE_NUMBER,
      personalityTags: ['Owner', 'Reliable'],
    }
  },
  {
    email: 'suresh.owner@demo.com', password: 'Demo@1234', role: 'owner',
    profile: {
      fullName: 'Suresh Patil', gender: 'male', college: 'SGGSIET (Shri Guru Gobind Singhji Institute of Engineering and Technology), Nanded',
      course: 'N/A', year: 1, city: 'Nanded', district: 'Nanded', state: 'Maharashtra', area: 'Vishnupuri',
      bio: 'Rents out co-ed and student friendly accommodations.',
      isProfileComplete: true, hasCompletedQuiz: false, verificationStatus: 'verified',
      phoneNumber: DEMO_PHONE_NUMBER,
      personalityTags: ['Owner', 'Flexible'],
    }
  }
];

const demoListings = [
  // --- NANDED ORIGINAL & NEW ---
  {
    type: 'pg', title: 'Sunrise PG for Girls – Namaskar Chowk',
    description: 'Well-maintained girls PG in the heart of MGM Nanded. Home-cooked meals, Wi-Fi, and 24/7 water supply included.',
    images: [{ url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', publicId: 'demo1' }],
    rent: 6500, area: 'Namaskar Chowk', city: 'Nanded', approximateLocation: 'Namaskar Chowk Circle near MGM College, Nanded',
    distanceFromCollege: '500m from MGM College', occupancy: 'double', genderAllowed: 'female',
    facilities: ['wifi', 'mess', 'water', 'security', 'laundry'], contactNumber: DEMO_PHONE_NUMBER, verificationStatus: 'verified',
  },
  {
    type: 'hostel', title: 'Scholars Boys Hostel – Vazirabad',
    description: 'Budget-friendly boys hostel with 24/7 security. Tiffin service and study rooms available.',
    images: [{ url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', publicId: 'demo2' }],
    rent: 4500, area: 'Vazirabad', city: 'Nanded', approximateLocation: 'Vazirabad Circle, Nanded',
    distanceFromCollege: '1.8km from MGM College', occupancy: 'triple', genderAllowed: 'male',
    facilities: ['wifi', 'water', 'security', 'power-backup'], contactNumber: DEMO_PHONE_NUMBER, verificationStatus: 'verified',
  },
  {
    type: 'shared-room', title: 'Shared Flat for Boys – Vishnupuri',
    description: '2BHK flat available for sharing. Fully furnished with kitchen utilities. Perfect for SGGS students.',
    images: [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', publicId: 'demo3' }],
    rent: 5000, area: 'Vishnupuri', city: 'Nanded', approximateLocation: 'Opposite SGGSIET Campus Gate, Vishnupuri, Nanded',
    distanceFromCollege: '200m from SGGSIET College', occupancy: 'double', genderAllowed: 'male',
    facilities: ['wifi', 'parking', 'water', 'laundry'], contactNumber: DEMO_PHONE_NUMBER, verificationStatus: 'verified',
  },
  {
    type: 'flat', title: 'Premium 1BHK – Taroda Naka',
    description: 'Modern 1BHK flat perfect for students. Air-conditioned, fully furnished, close to restaurants.',
    images: [{ url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', publicId: 'demo4' }],
    rent: 8500, area: 'Taroda Naka', city: 'Nanded', approximateLocation: 'Taroda Naka High Road, Nanded',
    distanceFromCollege: '2.5km from MGM Nanded', occupancy: 'double', genderAllowed: 'female',
    facilities: ['wifi', 'parking', 'ac', 'security', 'power-backup'], contactNumber: DEMO_PHONE_NUMBER, verificationStatus: 'verified',
  },
  
  // NEW NANDED LISTINGS FOR DIVERSIFICATION
  {
    type: 'pg', title: 'Saraswati Boys PG – Vishnupuri',
    description: 'Affordable PG for boys near SGGS College, Vishnupuri. High-speed Wi-Fi, desk, chair, wardrobe, and filtered drinking water.',
    images: [{ url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', publicId: 'demo11' }],
    rent: 3800, area: 'Vishnupuri', city: 'Nanded', approximateLocation: 'Vishnupuri Area, near SGGS Campus, Nanded',
    distanceFromCollege: '300m from SGGSIET College', occupancy: 'double', genderAllowed: 'male',
    facilities: ['wifi', 'water', 'parking', 'power-backup'], contactNumber: DEMO_PHONE_NUMBER, verificationStatus: 'verified',
  },
  {
    type: 'pg', title: 'Matoshree Girls PG – Vishnupuri',
    description: 'Extremely secure girls PG located right in Vishnupuri. Strict gate timings, CCTV monitoring, and delicious home-style mess meals included.',
    images: [{ url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', publicId: 'demo12' }],
    rent: 4000, area: 'Vishnupuri', city: 'Nanded', approximateLocation: 'Near Vishnupuri Market and SGGS Campus, Nanded',
    distanceFromCollege: '400m from SGGSIET College', occupancy: 'double', genderAllowed: 'female',
    facilities: ['wifi', 'mess', 'water', 'security', 'cctv'], contactNumber: DEMO_PHONE_NUMBER, verificationStatus: 'verified',
  },
  {
    type: 'flat', title: 'Vishnupuri 2BHK Student Apartment',
    description: 'Fully furnished 2BHK flat available for rent. Ideal for a group of 4 SGGS students looking to share kitchen and common room.',
    images: [{ url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', publicId: 'demo13' }],
    rent: 6000, area: 'Vishnupuri', city: 'Nanded', approximateLocation: 'Vishnupuri main road, Nanded',
    distanceFromCollege: '500m from SGGSIET College', occupancy: 'single', genderAllowed: 'any',
    facilities: ['wifi', 'parking', 'water', 'power-backup', 'laundry'], contactNumber: DEMO_PHONE_NUMBER, verificationStatus: 'verified',
  },
  {
    type: 'hostel', title: 'MGM Girls Luxury Hostel – Namaskar Chowk',
    description: 'Premium hostel for girls offering single and double occupancy AC/Non-AC rooms. Gated security, daily housekeeping, and laundry facilities.',
    images: [{ url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', publicId: 'demo14' }],
    rent: 5500, area: 'Namaskar Chowk', city: 'Nanded', approximateLocation: 'Namaskar Chowk area, Nanded',
    distanceFromCollege: '150m from MGM College', occupancy: 'single', genderAllowed: 'female',
    facilities: ['wifi', 'ac', 'water', 'security', 'cctv', 'laundry'], contactNumber: DEMO_PHONE_NUMBER, verificationStatus: 'verified',
  },
  {
    type: 'pg', title: 'Namaskar Chowk Boys PG',
    description: 'Budget boys PG near Namaskar Chowk. Fully cleaned daily, tiffin services option, high-speed Wi-Fi, and 2 wheeler parking available.',
    images: [{ url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', publicId: 'demo15' }],
    rent: 3500, area: 'Namaskar Chowk', city: 'Nanded', approximateLocation: 'Opposite MGM Campus Gate, Namaskar Chowk, Nanded',
    distanceFromCollege: '200m from MGM College', occupancy: 'triple', genderAllowed: 'male',
    facilities: ['wifi', 'water', 'parking', 'security'], contactNumber: DEMO_PHONE_NUMBER, verificationStatus: 'verified',
  },
  {
    type: 'flat', title: 'Namaskar Chowk Fully Furnished Flat',
    description: 'Renting out a beautifully renovated 2BHK flat near MGM. Kitchen setup, refrigerator, sofa, study tables, and power backup.',
    images: [{ url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', publicId: 'demo16' }],
    rent: 7500, area: 'Namaskar Chowk', city: 'Nanded', approximateLocation: 'Namaskar Chowk Residential Area, Nanded',
    distanceFromCollege: '300m from MGM College', occupancy: 'double', genderAllowed: 'any',
    facilities: ['wifi', 'parking', 'water', 'power-backup', 'security'], contactNumber: DEMO_PHONE_NUMBER, verificationStatus: 'verified',
  },
  {
    type: 'shared-room', title: 'Srinagar Shared Student Room',
    description: 'Shared room for boys in Srinagar Nanded. Walking distance to nearby coaching centers and MGM campus.',
    images: [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', publicId: 'demo17' }],
    rent: 2800, area: 'Srinagar', city: 'Nanded', approximateLocation: 'Srinagar colony near MGM, Nanded',
    distanceFromCollege: '700m from MGM College', occupancy: 'double', genderAllowed: 'male',
    facilities: ['wifi', 'water', 'parking'], contactNumber: DEMO_PHONE_NUMBER, verificationStatus: 'verified',
  },
  {
    type: 'pg', title: 'Anand Nagar Boys Co-Living PG',
    description: 'A study-centric boys PG in Anand Nagar. Quiet surrounding, mesh options, regular water supply, and high-speed Wi-Fi.',
    images: [{ url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', publicId: 'demo18' }],
    rent: 3200, area: 'Anand Nagar', city: 'Nanded', approximateLocation: 'Anand Nagar Main Road, Nanded',
    distanceFromCollege: '1.2km from MGM College', occupancy: 'double', genderAllowed: 'male',
    facilities: ['wifi', 'mess', 'water', 'parking'], contactNumber: DEMO_PHONE_NUMBER, verificationStatus: 'verified',
  },
  {
    type: 'hostel', title: 'Srinagar Girls Hostel',
    description: 'A premium, modern girls hostel in Srinagar. High-end security, AC rooms option, laundry service, and healthy organic meals.',
    images: [{ url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', publicId: 'demo19' }],
    rent: 4800, area: 'Srinagar', city: 'Nanded', approximateLocation: 'Srinagar Colony, Nanded',
    distanceFromCollege: '800m from MGM College', occupancy: 'double', genderAllowed: 'female',
    facilities: ['wifi', 'mess', 'water', 'security', 'cctv', 'laundry'], contactNumber: DEMO_PHONE_NUMBER, verificationStatus: 'verified',
  },
  {
    type: 'shared-room', title: 'Anand Nagar Study Room for Girls',
    description: 'A cozy double sharing room for girls in a safe family bungalow at Anand Nagar. Kitchen sharing allowed.',
    images: [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', publicId: 'demo20' }],
    rent: 3000, area: 'Anand Nagar', city: 'Nanded', approximateLocation: 'Anand Nagar Colony, Nanded',
    distanceFromCollege: '1.1km from MGM College', occupancy: 'double', genderAllowed: 'female',
    facilities: ['wifi', 'water', 'laundry', 'parking'], contactNumber: DEMO_PHONE_NUMBER, verificationStatus: 'verified',
  },

  // --- PUNE ---
  {
    type: 'pg', title: 'Elite PG for Girls – Shivajinagar',
    description: 'Premium girls accommodation near COEP Pune. CCTV security, high-speed fiber internet, and gym facility.',
    images: [{ url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', publicId: 'demo5' }],
    rent: 9000, area: 'Shivajinagar', city: 'Pune', approximateLocation: 'Near COEP Gymkhana, Pune',
    distanceFromCollege: '400m from COEP University', occupancy: 'double', genderAllowed: 'female',
    facilities: ['wifi', 'mess', 'water', 'security', 'gym', 'laundry'], contactNumber: DEMO_PHONE_NUMBER, verificationStatus: 'verified',
  },
  {
    type: 'shared-room', title: 'Katraj Boys Co-Living Space',
    description: 'Shared room in a neat row house. Cozy, study desks, silent area. Close to Katraj lake and PICT.',
    images: [{ url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', publicId: 'demo6' }],
    rent: 6000, area: 'Katraj', city: 'Pune', approximateLocation: 'Opposite PICT Main Gate, Katraj, Pune',
    distanceFromCollege: '300m from PICT Pune', occupancy: 'double', genderAllowed: 'male',
    facilities: ['wifi', 'parking', 'water', 'security'], contactNumber: DEMO_PHONE_NUMBER, verificationStatus: 'verified',
  },
  {
    type: 'flat', title: 'Spacious 2BHK Flat – Hinjawadi',
    description: 'Fully furnished 2BHK flat. Looking for roommates. Gated community, power backup, lift, and security.',
    images: [{ url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', publicId: 'demo7' }],
    rent: 8000, area: 'Hinjawadi', city: 'Pune', approximateLocation: 'Phase 1, Hinjawadi, Pune',
    distanceFromCollege: '1.5km from engineering campuses', occupancy: 'single', genderAllowed: 'male',
    facilities: ['wifi', 'parking', 'water', 'security', 'power-backup'], contactNumber: DEMO_PHONE_NUMBER, verificationStatus: 'verified',
  },

  // --- MUMBAI ---
  {
    type: 'flat', title: 'Premium Co-Living Flat – Wadala',
    description: 'Stunning fully-furnished apartment. Walking distance from VJTI. Modern kitchen, AC, and high-speed Wi-Fi.',
    images: [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', publicId: 'demo8' }],
    rent: 11000, area: 'Wadala', city: 'Mumbai', approximateLocation: 'Near Wadala Depot, Mumbai',
    distanceFromCollege: '800m from VJTI Mumbai', occupancy: 'double', genderAllowed: 'male',
    facilities: ['wifi', 'ac', 'parking', 'water', 'security', 'laundry'], contactNumber: DEMO_PHONE_NUMBER, verificationStatus: 'verified',
  },
  {
    type: 'pg', title: 'Bandra Girls Nest PG',
    description: 'Cozy and secure PG for female students. Gated security, AC rooms, proximity to St. Xaviers and market.',
    images: [{ url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', publicId: 'demo9' }],
    rent: 13000, area: 'Bandra', city: 'Mumbai', approximateLocation: 'Carter Road, Bandra West, Mumbai',
    distanceFromCollege: '2.5km from Xavier College', occupancy: 'double', genderAllowed: 'female',
    facilities: ['wifi', 'ac', 'water', 'security', 'mess', 'laundry'], contactNumber: DEMO_PHONE_NUMBER, verificationStatus: 'verified',
  },
  {
    type: 'flat', title: 'Studio Flat Near Powai Lake',
    description: 'Beautiful independent studio. Fully loaded kitchen, laundry machine, balcony, and lake view.',
    images: [{ url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', publicId: 'demo10' }],
    rent: 14000, area: 'Powai', city: 'Mumbai', approximateLocation: 'Powai Lake Road, Powai, Mumbai',
    distanceFromCollege: '1.2km from IIT Bombay', occupancy: 'single', genderAllowed: 'any',
    facilities: ['wifi', 'ac', 'parking', 'water', 'security', 'laundry'], contactNumber: DEMO_PHONE_NUMBER, verificationStatus: 'verified',
  },
];

const seedDatabase = async (shouldDisconnect = true) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to MongoDB for Seeding');
    }

    // 1. Clear existing database collections completely
    const Match = require('../../modules/matches/match.model');
    const Meeting = require('../../modules/meetings/meeting.model');
    const Notification = require('../../modules/notifications/notification.model');
    const Conversation = require('../../modules/messages/conversation.model');
    const Message = require('../../modules/messages/message.model');

    await Auth.deleteMany({});
    await User.deleteMany({});
    await QuizResult.deleteMany({});
    await Listing.deleteMany({});
    await Match.deleteMany({});
    await Meeting.deleteMany({});
    await Notification.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});

    const authIds = [];

    // 2. Seed Auth collection
    for (const userData of demoUsers) {
      const { email, password, role, profile } = userData;
      const auth = await Auth.create({
        email,
        password,
        role,
        isEmailVerified: true,
        lastLogin: new Date()
      });
      authIds.push({ authId: auth._id, role: auth.role, ...profile });
    }

    // 3. Clear existing User profiles for demo auth IDs
    const demoAuthIds = authIds.map(u => u.authId);
    await User.deleteMany({ authId: { $in: demoAuthIds } });

    // 4. Seed User collection
    const createdUsers = [];
    for (const { authId, role, ...profileData } of authIds) {
      const user = await User.create({ authId, ...profileData });
      user.role = role; // Attach role dynamically for seeding convenience
      createdUsers.push(user);
    }
    console.log(`✅ Created ${createdUsers.length} demo users`);

    // 5. Seed QuizResult collection
    await QuizResult.deleteMany({ userId: { $in: createdUsers.map(u => u._id) } });
    for (const user of createdUsers) {
      if (user.role === 'owner') continue; // Skip owners for quiz
      const tags = user.personalityTags || ['Easy Going'];
      
      const hiddenScores = {
        cleanliness: tags.includes('Clean Planner') ? 9 : 5,
        study: tags.includes('Study Focused') ? 9 : 5,
        social: tags.includes('Social Explorer') ? 9 : tags.includes('Homebody') ? 2 : 5,
        sleep: tags.includes('Night Owl') ? 9 : tags.includes('Early Bird') ? 2 : 5,
        financial: tags.includes('Budget Saver') ? 8 : 5,
        conflict: tags.includes('Easy Going') ? 8 : 5
      };

      await QuizResult.create({
        userId: user._id,
        answers: [],
        personalityTags: tags,
        hiddenScores,
        completedAt: new Date(),
        retakeCount: 0
      });
    }
    console.log(`✅ Seeded quiz results for student users`);

    // 6. Listings are already cleared at the start

    // 7. Seed Listing collection
    const owners = createdUsers.filter(u => u.role === 'owner');
    if (owners.length === 0) {
      console.warn("⚠️ No owner users found to assign to listings. Defaulting to first user.");
    }
    for (let i = 0; i < demoListings.length; i++) {
      const owner = owners.length > 0 ? owners[i % owners.length] : createdUsers[0];
      await Listing.create({ ...demoListings[i], ownerId: owner._id, ownerAuthId: owner.authId });
    }
    console.log(`✅ Created ${demoListings.length} demo listings`);

    console.log('\n📋 Demo Credentials:');
    demoUsers.forEach(u => console.log(`  ${u.email} / ${u.password}`));

    if (shouldDisconnect) {
      await mongoose.disconnect();
      console.log('\n✅ Database connection closed.');
    }
    console.log('✅ Seed complete!');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    if (shouldDisconnect) {
      process.exit(1);
    }
    throw err;
  }
};

if (require.main === module) {
  seedDatabase(true);
}

module.exports = { seedDatabase, demoUsers, demoListings };

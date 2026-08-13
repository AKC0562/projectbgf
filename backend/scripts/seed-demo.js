import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';
import Category from '../src/models/Category.js';
import CompanionProfile from '../src/models/CompanionProfile.js';
import User from '../src/models/User.js';
import { USER_ROLES, KYC_STATUS } from '../src/constants/index.js';

const categories = [
  ['Coffee', 'coffee', 'Coffee conversations and easy city meetups'],
  ['Movie', 'movie', 'Watch something great together'],
  ['Study', 'study', 'Focused study and accountability sessions'],
  ['Travel', 'travel', 'Explore the city with a local companion'],
  ['Gym', 'gym', 'Reliable workout and fitness company'],
  ['Gaming', 'gaming', 'Team up for a relaxed gaming session'],
  ['Event', 'event', 'A friendly plus-one for events and networking'],
  ['Chat', 'chat', 'Meaningful conversation when you want company'],
];

const companions = [
  {
    name: 'Arjun Mehta',
    email: 'demo.arjun@buddyup.local',
    phone: '9000000001',
    city: 'Mumbai',
    state: 'Maharashtra',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    tagline: 'Coffee connoisseur and startup enthusiast',
    rate: 499,
    rating: 4.9,
    ratings: 127,
    bookings: 89,
    interests: ['Coffee', 'Startups', 'Photography'],
    languages: ['English', 'Hindi', 'Marathi'],
    categorySlugs: ['coffee', 'chat', 'event'],
    coordinates: [72.8777, 19.076],
  },
  {
    name: 'Priya Sharma',
    email: 'demo.priya@buddyup.local',
    phone: '9000000002',
    city: 'Delhi',
    state: 'Delhi',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face',
    tagline: 'Adventure seeker and fitness coach',
    rate: 599,
    rating: 4.8,
    ratings: 203,
    bookings: 156,
    interests: ['Gym', 'Travel', 'Yoga'],
    languages: ['English', 'Hindi'],
    categorySlugs: ['gym', 'travel', 'coffee'],
    coordinates: [77.1025, 28.7041],
  },
  {
    name: 'Rahul Kapoor',
    email: 'demo.rahul@buddyup.local',
    phone: '9000000003',
    city: 'Bangalore',
    state: 'Karnataka',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
    tagline: 'Gamer by night, study buddy by day',
    rate: 399,
    rating: 4.7,
    ratings: 94,
    bookings: 67,
    interests: ['Gaming', 'Study', 'Tech'],
    languages: ['English', 'Hindi', 'Kannada'],
    categorySlugs: ['gaming', 'study', 'chat'],
    coordinates: [77.5946, 12.9716],
  },
  {
    name: 'Ananya Reddy',
    email: 'demo.ananya@buddyup.local',
    phone: '9000000004',
    city: 'Hyderabad',
    state: 'Telangana',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
    tagline: 'Movie buff and creative soul',
    rate: 449,
    rating: 4.9,
    ratings: 156,
    bookings: 112,
    interests: ['Movies', 'Art', 'Music'],
    languages: ['English', 'Telugu', 'Hindi'],
    categorySlugs: ['movie', 'event', 'coffee'],
    coordinates: [78.4867, 17.385],
  },
  {
    name: 'Vikram Singh',
    email: 'demo.vikram@buddyup.local',
    phone: '9000000005',
    city: 'Jaipur',
    state: 'Rajasthan',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
    tagline: 'Travel companion and food explorer',
    rate: 549,
    rating: 4.8,
    ratings: 178,
    bookings: 134,
    interests: ['Travel', 'Food', 'History'],
    languages: ['English', 'Hindi', 'Rajasthani'],
    categorySlugs: ['travel', 'coffee', 'event'],
    coordinates: [75.7873, 26.9124],
  },
  {
    name: 'Neha Patel',
    email: 'demo.neha@buddyup.local',
    phone: '9000000006',
    city: 'Pune',
    state: 'Maharashtra',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
    tagline: 'Networking pro and event companion',
    rate: 649,
    rating: 5,
    ratings: 89,
    bookings: 78,
    interests: ['Events', 'Networking', 'Business'],
    languages: ['English', 'Hindi', 'Gujarati'],
    categorySlugs: ['event', 'chat', 'coffee'],
    coordinates: [73.8567, 18.5204],
  },
];

async function seedDemoData() {
  await connectDB();
  const categoryBySlug = new Map();

  for (const [name, slug, description] of categories) {
    const category = await Category.findOneAndUpdate(
      { slug },
      { $set: { name, slug, description, icon: slug, isActive: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    categoryBySlug.set(slug, category._id);
  }

  const password = await bcrypt.hash('BuddyUpDemo123!', 12);
  for (const companion of companions) {
    const user = await User.findOneAndUpdate(
      { email: companion.email },
      {
        $set: {
          fullName: companion.name,
          phone: companion.phone,
          password,
          role: USER_ROLES.COMPANION,
          dob: new Date('1996-05-15'),
          city: companion.city,
          state: companion.state,
          location: { type: 'Point', coordinates: companion.coordinates },
          avatar: companion.avatar,
          kycStatus: KYC_STATUS.VERIFIED,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    await CompanionProfile.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          userId: user._id,
          displayName: companion.name,
          tagline: companion.tagline,
          hourlyRate: companion.rate,
          categories: companion.categorySlugs.map((slug) => categoryBySlug.get(slug)),
          languages: companion.languages,
          interests: companion.interests,
          averageRating: companion.rating,
          totalRatings: companion.ratings,
          totalCompletedBookings: companion.bookings,
          isActive: true,
          isVerified: true,
          verifiedAt: new Date(),
          serviceLocation: { type: 'Point', coordinates: companion.coordinates },
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );
  }

  for (const [slug, categoryId] of categoryBySlug) {
    const companionCount = await CompanionProfile.countDocuments({
      categories: categoryId,
      isActive: true,
    });
    await Category.updateOne({ slug }, { $set: { companionCount } });
  }

  console.log(`Seeded ${categories.length} categories and ${companions.length} demo companions.`);
}

seedDemoData()
  .catch((error) => {
    console.error('Demo seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });

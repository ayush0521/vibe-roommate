require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

const seedUsers = [
  {
    name: "Aman Clean",
    email: "aman@test.com",
    password: "123456",
    budget: 8000,
    quiz: {
      cleanliness: 5,
      socialLevel: 1,
      studyStyle: "focused",
      foodType: "veg",
      smoking: false,
      drinking: false,
    },
  },
  {
    name: "Riya Social",
    email: "riya@test.com",
    password: "123456",
    budget: 9000,
    quiz: {
      cleanliness: 4,
      socialLevel: 5,
      studyStyle: "casual",
      foodType: "non-veg",
      smoking: false,
      drinking: true,
    },
  },
  {
    name: "Kabir Party",
    email: "kabir@test.com",
    password: "123456",
    budget: 12000,
    quiz: {
      cleanliness: 2,
      socialLevel: 5,
      studyStyle: "casual",
      foodType: "non-veg",
      smoking: true,
      drinking: true,
    },
  },
  {
    name: "Sneha Silent",
    email: "sneha@test.com",
    password: "123456",
    budget: 7000,
    quiz: {
      cleanliness: 4,
      socialLevel: 1,
      studyStyle: "focused",
      foodType: "veg",
      smoking: false,
      drinking: false,
    },
  },
  {
    name: "Arjun Balanced",
    email: "arjun@test.com",
    password: "123456",
    budget: 8500,
    quiz: {
      cleanliness: 3,
      socialLevel: 3,
      studyStyle: "casual",
      foodType: "veg",
      smoking: false,
      drinking: false,
    },
  },
  {
    name: "Neha Budget",
    email: "neha@test.com",
    password: "123456",
    budget: 5000,
    quiz: {
      cleanliness: 3,
      socialLevel: 2,
      studyStyle: "focused",
      foodType: "veg",
      smoking: false,
      drinking: false,
    },
  },
  {
    name: "Dev Premium",
    email: "dev@test.com",
    password: "123456",
    budget: 15000,
    quiz: {
      cleanliness: 4,
      socialLevel: 4,
      studyStyle: "casual",
      foodType: "non-veg",
      smoking: false,
      drinking: true,
    },
  },
  {
    name: "Meera Chill",
    email: "meera@test.com",
    password: "123456",
    budget: 7500,
    quiz: {
      cleanliness: 2,
      socialLevel: 3,
      studyStyle: "casual",
      foodType: "veg",
      smoking: false,
      drinking: false,
    },
  },
  {
    name: "Rahul Mixed",
    email: "rahul@test.com",
    password: "123456",
    budget: 9500,
    quiz: {
      cleanliness: 4,
      socialLevel: 2,
      studyStyle: "focused",
      foodType: "non-veg",
      smoking: false,
      drinking: false,
    },
  },
  {
    name: "Simran Energetic",
    email: "simran@test.com",
    password: "123456",
    budget: 11000,
    quiz: {
      cleanliness: 3,
      socialLevel: 5,
      studyStyle: "casual",
      foodType: "non-veg",
      smoking: true,
      drinking: true,
    },
  },
];

console.log("MONGO URI:", process.env.MONGO_URI);

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to DB");

    // clear old users
    await User.deleteMany({});
    console.log("🗑 Cleared old users");

    // hash passwords
    const users = await Promise.all(
      seedUsers.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, 10),
      }))
    );

    await User.insertMany(users);

    console.log("🔥 10 users added successfully!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

runSeed();
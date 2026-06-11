const mongoose = require('mongoose');
require('dotenv').config();

const Question = require('../../modules/quiz/quiz.model');

const questions = [
  // --- CLEANLINESS ---
  {
    question: 'How often do you clean your shared living space?',
    category: 'cleanliness',
    type: 'mcq',
    options: [
      { text: 'Daily', value: 10 },
      { text: 'Every 2-3 days', value: 7 },
      { text: 'Once a week', value: 5 },
      { text: 'Only when it gets messy', value: 2 },
    ],
  },
  {
    question: 'Your roommate leaves dishes in the sink overnight. How do you react?',
    category: 'cleanliness',
    type: 'behavioural',
    options: [
      { text: 'I wash them myself without saying anything', value: 8 },
      { text: 'I politely ask them to clean up', value: 9 },
      { text: 'I leave a note reminding them', value: 7 },
      { text: 'It doesn\'t bother me much', value: 3 },
    ],
  },
  {
    question: 'How clean do you keep your personal space?',
    category: 'cleanliness',
    type: 'slider',
    sliderMin: 1,
    sliderMax: 10,
    sliderLabels: { min: 'Organized chaos', max: 'Spotlessly clean' },
    options: [],
  },
  {
    question: 'How do you feel about shared spaces smelling like food?',
    category: 'cleanliness',
    type: 'mcq',
    options: [
      { text: 'Fine, I cook a lot too', value: 5 },
      { text: 'OK if ventilated well', value: 7 },
      { text: 'I prefer a neutral smell', value: 8 },
      { text: 'Very bothered by it', value: 10 },
    ],
  },
  // --- SLEEP ---
  {
    question: 'What time do you usually go to bed?',
    category: 'sleep',
    type: 'mcq',
    options: [
      { text: 'Before 10 PM', value: 2 },
      { text: '10 PM – 12 AM', value: 5 },
      { text: '12 AM – 2 AM', value: 8 },
      { text: 'After 2 AM', value: 10 },
    ],
  },
  {
    question: 'Can you sleep with background noise or light on?',
    category: 'sleep',
    type: 'slider',
    sliderMin: 1,
    sliderMax: 10,
    sliderLabels: { min: 'Need total silence/dark', max: 'Can sleep anywhere' },
    options: [],
  },
  {
    question: 'How do you feel about a roommate coming home after midnight?',
    category: 'sleep',
    type: 'behavioural',
    options: [
      { text: 'Totally fine, I\'m a night owl too', value: 9 },
      { text: 'OK if they\'re quiet', value: 7 },
      { text: 'Prefer they inform me', value: 5 },
      { text: 'I prefer everyone home by 11 PM', value: 2 },
    ],
  },
  // --- STUDY ---
  {
    question: 'How many hours a day do you spend studying?',
    category: 'study',
    type: 'mcq',
    options: [
      { text: 'Less than 2 hours', value: 3 },
      { text: '2–4 hours', value: 6 },
      { text: '4–6 hours', value: 8 },
      { text: 'More than 6 hours', value: 10 },
    ],
  },
  {
    question: 'Do you need complete silence to study?',
    category: 'study',
    type: 'slider',
    sliderMin: 1,
    sliderMax: 10,
    sliderLabels: { min: 'I study with music/TV', max: 'Need complete silence' },
    options: [],
  },
  {
    question: 'How do you feel about group study sessions at home?',
    category: 'study',
    type: 'behavioural',
    options: [
      { text: 'Love it, more the merrier', value: 3 },
      { text: 'Fine occasionally', value: 6 },
      { text: 'Prefer to study alone', value: 9 },
      { text: 'Strictly no guests during study hours', value: 10 },
    ],
  },
  // --- SOCIAL ---
  {
    question: 'How often do you invite friends over?',
    category: 'social',
    type: 'mcq',
    options: [
      { text: 'Almost never', value: 2 },
      { text: 'Once or twice a month', value: 5 },
      { text: 'Every weekend', value: 8 },
      { text: 'Multiple times a week', value: 10 },
    ],
  },
  {
    question: 'How social are you in general?',
    category: 'social',
    type: 'slider',
    sliderMin: 1,
    sliderMax: 10,
    sliderLabels: { min: 'Total introvert', max: 'Total extrovert' },
    options: [],
  },
  {
    question: 'Your roommate is throwing a small party on a Friday. Your reaction?',
    category: 'social',
    type: 'behavioural',
    options: [
      { text: 'Awesome, I\'ll join!', value: 10 },
      { text: 'Fine, I\'ll go out or stay in my room', value: 7 },
      { text: 'I\'d ask them to keep it low-key', value: 4 },
      { text: 'I\'d be upset, I value quiet weekends', value: 2 },
    ],
  },
  {
    question: 'How important is having "alone time" at home?',
    category: 'social',
    type: 'slider',
    sliderMin: 1,
    sliderMax: 10,
    sliderLabels: { min: 'Not important at all', max: 'Extremely important' },
    options: [],
  },
  // --- FINANCIAL ---
  {
    question: 'How do you split shared expenses (utilities, groceries)?',
    category: 'financial',
    type: 'mcq',
    options: [
      { text: 'Strictly 50-50 always', value: 9 },
      { text: 'Flexible, we adjust', value: 6 },
      { text: 'Whoever uses more pays more', value: 8 },
      { text: 'I don\'t track small amounts', value: 3 },
    ],
  },
  {
    question: 'How would you describe your financial management?',
    category: 'financial',
    type: 'slider',
    sliderMin: 1,
    sliderMax: 10,
    sliderLabels: { min: 'Very spontaneous', max: 'Very disciplined budgeter' },
    options: [],
  },
  {
    question: 'What if your roommate can\'t pay their share of rent for a month?',
    category: 'financial',
    type: 'behavioural',
    options: [
      { text: 'I\'d cover them and wait to be repaid', value: 5 },
      { text: 'I\'d help if it\'s a one-time thing', value: 7 },
      { text: 'I\'d ask them to arrange funds quickly', value: 8 },
      { text: 'We\'d need to address it with the landlord', value: 9 },
    ],
  },
  // --- CONFLICT ---
  {
    question: 'How do you handle disagreements with a roommate?',
    category: 'conflict',
    type: 'mcq',
    options: [
      { text: 'Talk it out directly and calmly', value: 10 },
      { text: 'Give it a day then discuss', value: 8 },
      { text: 'I tend to avoid conflict', value: 4 },
      { text: 'I go quiet and hope it resolves', value: 2 },
    ],
  },
  {
    question: 'How easily do you get annoyed by others\' habits?',
    category: 'conflict',
    type: 'slider',
    sliderMin: 1,
    sliderMax: 10,
    sliderLabels: { min: 'Very tolerant', max: 'Very particular' },
    options: [],
  },
  {
    question: 'A roommate plays music loudly during your exam prep. You:',
    category: 'conflict',
    type: 'behavioural',
    options: [
      { text: 'Politely ask them to use headphones', value: 10 },
      { text: 'Use earplugs and say nothing', value: 5 },
      { text: 'Go to library to study', value: 7 },
      { text: 'Get frustrated and argue', value: 2 },
    ],
  },
  // --- LIFESTYLE ---
  {
    question: 'Do you exercise regularly?',
    category: 'lifestyle',
    type: 'mcq',
    options: [
      { text: 'Yes, daily gym/workout', value: 10 },
      { text: 'A few times a week', value: 7 },
      { text: 'Occasionally', value: 4 },
      { text: 'Rarely or never', value: 1 },
    ],
  },
  {
    question: 'How important is a healthy lifestyle to you?',
    category: 'lifestyle',
    type: 'slider',
    sliderMin: 1,
    sliderMax: 10,
    sliderLabels: { min: 'Not a priority', max: 'Top priority' },
    options: [],
  },
  {
    question: 'What\'s your typical morning routine?',
    category: 'lifestyle',
    type: 'mcq',
    options: [
      { text: 'Up by 6 AM, workout & breakfast', value: 2 },
      { text: 'Up by 8 AM, quick routine', value: 5 },
      { text: 'Up by 10 AM, relaxed morning', value: 8 },
      { text: 'Sleep in whenever possible', value: 10 },
    ],
  },
  // --- FOOD ---
  {
    question: 'How often do you cook at home?',
    category: 'food',
    type: 'mcq',
    options: [
      { text: 'Every meal', value: 10 },
      { text: 'Once or twice a day', value: 7 },
      { text: 'A few times a week', value: 5 },
      { text: 'Rarely, mostly order in', value: 2 },
    ],
  },
  {
    question: 'How comfortable are you sharing kitchen space with a roommate?',
    category: 'food',
    type: 'slider',
    sliderMin: 1,
    sliderMax: 10,
    sliderLabels: { min: 'Prefer separate kitchens', max: 'Love cooking together' },
    options: [],
  },
  {
    question: 'Do you mind if your roommate cooks non-vegetarian food?',
    category: 'food',
    type: 'mcq',
    options: [
      { text: 'Not at all', value: 5 },
      { text: 'Fine if they clean up well', value: 7 },
      { text: 'Prefer they don\'t cook it in shared space', value: 9 },
      { text: 'Strictly no non-veg in shared space', value: 10 },
    ],
  },
  {
    question: 'Do you keep shared groceries or have strictly separate food?',
    category: 'food',
    type: 'mcq',
    options: [
      { text: 'We share everything', value: 3 },
      { text: 'We share some basics', value: 6 },
      { text: 'Strictly separate', value: 9 },
      { text: 'I prefer to figure it out as we go', value: 5 },
    ],
  },
  {
    question: 'How do you feel about your roommate eating your food by mistake?',
    category: 'food',
    type: 'behavioural',
    options: [
      { text: 'No big deal, it happens', value: 2 },
      { text: 'A bit annoying, but I\'d let it go', value: 5 },
      { text: 'I\'d politely ask them to not do it again', value: 8 },
      { text: 'I\'d be upset and need clear boundaries set', value: 10 },
    ],
  },
  {
    question: 'How important is having a fixed meal time at home?',
    category: 'food',
    type: 'slider',
    sliderMin: 1,
    sliderMax: 10,
    sliderLabels: { min: 'I eat whenever I want', max: 'Fixed mealtimes are important' },
    options: [],
  },
];

const seedQuestions = async (shouldDisconnect = true) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('Connected to MongoDB');
    }

    await Question.deleteMany({});
    console.log('Cleared existing questions');

    await Question.insertMany(questions);
    console.log(`✅ Seeded ${questions.length} questions`);

    if (shouldDisconnect) {
      await mongoose.disconnect();
      console.log('Done!');
    }
  } catch (err) {
    console.error('Seed failed:', err.message);
    if (shouldDisconnect) {
      process.exit(1);
    }
    throw err;
  }
};

if (require.main === module) {
  seedQuestions(true);
}

module.exports = { seedQuestions, questions };

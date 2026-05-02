const { calculateMatchScore } = require("./matchService");

const userA = { cleanliness: 4 };
const userB = { cleanliness: 3 };
console.log("Match Score:", calculateMatchScore(userA, userB));
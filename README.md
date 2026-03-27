<h1 align="center">🏠 Vibe Roommate</h1>

<p align="center">
  A compatibility-first roommate matching platform for college students<br>
  focused on <b>lifestyle alignment</b>, <b>reduced conflicts</b>, and <b>better shared living</b>.
</p>

<hr>

<h2>📌 Project Overview</h2>

<p>
  <b>Vibe Roommate</b> is a full-stack web application designed to solve one of the most common yet overlooked problems in student housing:
  <b>roommate incompatibility</b>.
</p>

<p>
  Unlike traditional housing platforms that prioritize rent and location, this system introduces a 
  <b>behavior-based matching approach</b> using a structured <b>vibe quiz</b> and compatibility scoring.
</p>

<hr>

<h2>🎯 Problem Statement</h2>

<ul>
  <li>Roommate conflicts arise due to lifestyle mismatches (not just rent or location)</li>
  <li>Students frequently change accommodations due to incompatibility</li>
  <li>Existing platforms lack structured compatibility evaluation</li>
</ul>

<p>
  This project treats roommate matching as a <b>behavioral compatibility problem</b> rather than a purely real-estate problem.
</p>

<hr>

<h2>🧠 Core Concept</h2>

<p>
  The system collects user preferences through a structured <b>Vibe Quiz</b>, including:
</p>

<ul>
  <li>Sleep schedule</li>
  <li>Cleanliness level</li>
  <li>Noise tolerance</li>
  <li>Study habits</li>
  <li>Social behavior</li>
</ul>

<p>
  Based on responses, the system generates:
</p>

<ul>
  <li><b>Vibe badges</b> (user personality indicators)</li>
  <li><b>Compatibility score</b> between users</li>
</ul>

<p>
  Matching is <b>rule-based and explainable</b> to ensure transparency.
</p>

<hr>

<h2>👥 Target Users</h2>

<ul>
  <li><b>College students</b> looking for compatible roommates</li>
  <li><b>Students with available rooms/beds</b></li>
  <li><b>PG/hostel providers</b> targeting student users</li>
</ul>

<hr>

<h2>⚙️ Core Features</h2>

<ul>
  <li>User authentication (Register / Login)</li>
  <li>Vibe quiz for lifestyle profiling</li>
  <li>Badge generation system</li>
  <li>Compatibility matching engine</li>
  <li>Room listings module</li>
  <li>Basic messaging system</li>
</ul>

<hr>

<h2>🔍 Matching Logic</h2>

<p>
  Compatibility is calculated using a simple rule-based approach:
</p>

<pre>
Match Score = (Matching Preferences / Total Preferences) × 100
</pre>

<ul>
  <li>90–100% → Perfect Match</li>
  <li>70–89% → Good Match</li>
  <li>50–69% → Moderate Match</li>
  <li>Below 50% → Risky Match</li>
</ul>

<hr>

<h2>🏗️ System Architecture</h2>

<pre>
Frontend (React)
        ↓
Backend (Node.js + Express)
        ↓
Database (MongoDB)
        ↓
Matching & Badge Services
</pre>

<hr>

<h2>🛠️ Tech Stack</h2>

<ul>
  <li><b>Frontend:</b> React.js</li>
  <li><b>Backend:</b> Node.js + Express.js</li>
  <li><b>Database:</b> MongoDB</li>
  <li><b>Authentication:</b> JWT-based login system</li>
  <li><b>API Communication:</b> Axios</li>
</ul>

<hr>

<h2>📂 Project Structure</h2>

<pre>
vibe-roommate/
│
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── services/
│       ├── App.js
│       └── index.js
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── config/
│   └── server.js
│
├── docs/
│   ├── diagrams/
│   └── reports/
│
├── README.md
└── .gitignore
</pre>

<hr>

<h2>🚧 Development Status</h2>

<p>
  <b>Currently in early development phase (MVP stage)</b>
</p>

<ul>
  <li>Project structure initialized</li>
  <li>Core modules planned (Auth, Quiz, Matching)</li>
  <li>Backend and frontend setup in progress</li>
</ul>

<hr>

<h2>🚀 Roadmap</h2>

<ul>
  <li><b>15%:</b> Authentication + Quiz + Basic Matching</li>
  <li><b>30%:</b> Listings + Messaging + Dashboard</li>
  <li><b>50%:</b> Improved UI + Filters + Profile System</li>
  <li><b>100%:</b> Full integration + polished system + deployment</li>
</ul>

<hr>

<h2>🤝 Contribution</h2>

<ul>
  <li>Frontend development (React)</li>
  <li>Backend APIs (Node.js)</li>
  <li>Database schema design</li>
  <li>Matching logic improvements</li>
  <li>UI/UX enhancements</li>
</ul>

<hr>

<h2>📄 License</h2>

<p>
  This project is licensed under the <b>MIT License</b>.
</p>

<hr>

<div align="center">

  <p><b>Built by Ayush Padmawar</b></p>

</div>

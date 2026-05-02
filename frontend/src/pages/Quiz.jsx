import { useState } from "react";
import { apiRequest } from "../services/api";

const Quiz = () => {
  const [form, setForm] = useState({
    cleanliness: 3,
    socialLevel: 3,
    studyStyle: "focused",
    foodType: "veg",
    sleepType: "night",
    smoking: false,
    drinking: false
  });

  const handleSubmit = async () => {
    await apiRequest("/quiz/submit", {
      method: "POST",
      body: JSON.stringify(form)
    });

    alert("Quiz submitted!");
    window.location.href = "/matches";
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🧠 Roommate Quiz</h1>

      <label>Cleanliness (1–5)</label>
      <input type="number" min="1" max="5"
        onChange={(e) => setForm({...form, cleanliness: +e.target.value})}
      />

      <label>Social Level (1–5)</label>
      <input type="number" min="1" max="5"
        onChange={(e) => setForm({...form, socialLevel: +e.target.value})}
      />

      <label>Study Style</label>
      <select onChange={(e) => setForm({...form, studyStyle: e.target.value})}>
        <option value="focused">Focused</option>
        <option value="casual">Casual</option>
      </select>

      <label>Food Type</label>
      <select onChange={(e) => setForm({...form, foodType: e.target.value})}>
        <option value="veg">Veg</option>
        <option value="non-veg">Non-Veg</option>
      </select>

      <label>
        <input type="checkbox"
          onChange={(e) => setForm({...form, smoking: e.target.checked})}
        />
        Smoking
      </label>

      <label>
        <input type="checkbox"
          onChange={(e) => setForm({...form, drinking: e.target.checked})}
        />
        Drinking
      </label>

      <br /><br />
      <button onClick={handleSubmit}>Submit Quiz</button>
    </div>
  );
};

export default Quiz;
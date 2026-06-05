import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest } from "../services/api";
import Card from "../components/Card";

const Matches = () => {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        // 🔒 No token → login
        if (!token) {
          navigate("/");
          return;
        }

        // 🔥 Fetch matches
        const data = await apiRequest("/match");

        console.log("MATCH API RESPONSE:", data);

        // 🚫 Quiz not completed
        if (data.message === "Please complete quiz first") {
          navigate("/quiz");
          return;
        }

        // ✅ Save data
        setMatches(data.matches || []);
        setCurrentUser(data.currentUser || "");

      } catch (err) {
        console.error("MATCH FETCH ERROR:", err.message);
        setError(err.message || "Failed to load matches");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [navigate]);

  // ⏳ Loading State
  if (loading) {
    return (
      <div style={styles.center}>
        <h2>Loading matches...</h2>
      </div>
    );
  }

  // ❌ Error State
  if (error) {
    return (
      <div style={styles.center}>
        <h2 style={{ color: "red" }}>{error}</h2>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      
      {/* Header */}
      <div style={styles.header}>
        <h1>🔥 Your Top Matches</h1>
        <p style={styles.subtitle}>
          Welcome back, {currentUser}
        </p>
      </div>

      {/* Empty State */}
      {matches.length === 0 ? (
        <div style={styles.emptyBox}>
          <h2>No compatible roommates found</h2>

          <p>
            Try updating your quiz preferences to discover more matches.
          </p>
        </div>
      ) : (
        <div style={styles.cardsContainer}>
          {matches.map((match, index) => (
            <Card
              key={match.id || index}
              match={match}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "30px"
  },

  header: {
    marginBottom: "25px"
  },

  subtitle: {
    color: "#666",
    marginTop: "5px"
  },

  cardsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px"
  },

  emptyBox: {
    background: "#fff",
    padding: "40px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
  },

  center: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }
};

export default Matches;
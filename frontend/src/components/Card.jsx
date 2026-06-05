import { useNavigate } from "react-router-dom";

const getCompatibilityColor = (percentage) => {
  if (percentage >= 75) return "#2ecc71"; // green
  if (percentage >= 50) return "#f39c12"; // orange
  return "#e74c3c"; // red
};

const Card = ({ match, index }) => {
  const navigate = useNavigate();

  const percentage = match.compatibility?.percentage || 0;

  const color = getCompatibilityColor(percentage);

  // 💬 Open Chat
  const handleMessage = () => {
    navigate(`/chat/${match.id}`);
  };

  // 🎥 Open Google Meet
  const handleMeet = () => {
    window.open("https://meet.google.com/new", "_blank");
  };

  return (
    <div style={styles.card}>

      {/* ⭐ Top Match Badge */}
      {index === 0 && (
        <div style={styles.topBadge}>
          ⭐ Top Match
        </div>
      )}

      {/* 👤 Name */}
      <h2 style={styles.name}>
        {match.name}
      </h2>

      {/* 🔥 Compatibility */}
      <div style={styles.compatibilitySection}>
        <div style={styles.progressBackground}>
          <div
            style={{
              ...styles.progressFill,
              width: `${percentage}%`,
              background: color
            }}
          />
        </div>

        <p style={{ ...styles.percentage, color }}>
          {percentage}% Match
        </p>

        <p style={styles.label}>
          {match.compatibility?.label}
        </p>

        <p style={styles.type}>
          {match.compatibility?.type}
        </p>
      </div>

      {/* 🏷️ Badges */}
      <div style={styles.section}>
        <h4>🏷️ Badges</h4>

        <div style={styles.badgesContainer}>
          {match.badges?.map((badge, i) => (
            <span key={i} style={styles.badge}>
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* ✅ Highlights */}
      <div style={styles.section}>
        <h4>✅ Why You Match</h4>

        <ul style={styles.list}>
          {match.highlights?.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {/* ⚠️ Concerns */}
      <div style={styles.section}>
        <h4>⚠️ Concerns</h4>

        {match.concerns?.length === 0 ? (
          <p>No major concerns</p>
        ) : (
          <ul style={styles.list}>
            {match.concerns?.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
      </div>

      {/* 💡 Explanation */}
      <div style={styles.explanationBox}>
        <p>{match.explanation}</p>
      </div>

      {/* 🔘 Actions */}
      <div style={styles.buttonContainer}>

        <button
          style={styles.messageButton}
          onClick={handleMessage}
        >
          💬 Message
        </button>

        <button
          style={styles.meetButton}
          onClick={handleMeet}
        >
          🎥 Google Meet
        </button>

      </div>
    </div>
  );
};

const styles = {
  card: {
    width: "350px",
    background: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
    position: "relative"
  },

  topBadge: {
    position: "absolute",
    top: "-10px",
    right: "15px",
    background: "#ffd700",
    padding: "6px 12px",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "12px"
  },

  name: {
    marginBottom: "15px"
  },

  compatibilitySection: {
    marginBottom: "20px"
  },

  progressBackground: {
    width: "100%",
    height: "10px",
    background: "#eee",
    borderRadius: "10px",
    overflow: "hidden"
  },

  progressFill: {
    height: "100%"
  },

  percentage: {
    marginTop: "10px",
    fontWeight: "bold",
    fontSize: "20px"
  },

  label: {
    fontWeight: "600",
    marginTop: "5px"
  },

  type: {
    color: "#666",
    marginTop: "5px"
  },

  section: {
    marginTop: "20px"
  },

  badgesContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "10px"
  },

  badge: {
    background: "#eef2ff",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "13px"
  },

  list: {
    paddingLeft: "20px",
    marginTop: "10px"
  },

  explanationBox: {
    background: "#f8f9fa",
    padding: "12px",
    borderRadius: "10px",
    marginTop: "20px",
    fontStyle: "italic",
    color: "#444"
  },

  buttonContainer: {
    display: "flex",
    gap: "10px",
    marginTop: "20px"
  },

  messageButton: {
    flex: 1,
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    background: "#007bff",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold"
  },

  meetButton: {
    flex: 1,
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    background: "#2ecc71",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold"
  }
};

export default Card;
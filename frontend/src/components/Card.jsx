const getColor = (score) => {
  if (score >= 60) return "#2ecc71";
  if (score >= 40) return "#f1c40f";
  return "#e74c3c";
};

const Card = ({ match, index }) => {
  const score = match?.compatibility?.score || 0;
  const color = getColor(score);

  const openMeet = () => {
    window.open("https://meet.google.com/new", "_blank");
  };

  const openChat = () => {
    window.location.href = `/chat/${match.id}`;
  };

  return (
    <div style={{ ...styles.card, borderLeft: `6px solid ${color}` }}>
      
      {/* ⭐ Top Match */}
      {index === 0 && (
        <div style={styles.topBadge}>⭐ Top Match</div>
      )}

      {/* 👤 Name */}
      <h2 style={styles.name}>{match.name}</h2>

      {/* 🔥 Compatibility */}
      <div style={styles.scoreRow}>
        <span style={{ ...styles.label, color }}>
          {match.compatibility.label}
        </span>
        <span style={{ ...styles.score, color }}>
          {score}
        </span>
      </div>

      <p style={styles.type}>🏷 {match.compatibility.type}</p>

      {/* 🧍 Traits */}
      <div style={styles.section}>
        <strong>Traits</strong>
        <div style={styles.traitsGrid}>
          <span>🧼 {match.traits.cleanliness}</span>
          <span>🎉 {match.traits.socialLevel}</span>
          <span>💰 ₹{match.traits.budget}</span>
        </div>
      </div>

      {/* 🏷 Badges */}
      <div style={styles.section}>
        <strong>Badges</strong>
        <div style={styles.chips}>
          {(match.badges || []).map((b, i) => (
            <span key={i} style={styles.chip}>{b}</span>
          ))}
        </div>
      </div>

      {/* ✅ Highlights */}
      <div style={styles.section}>
        <strong>Why it works</strong>
        <div style={styles.chips}>
          {(match.highlights || []).map((h, i) => (
            <span key={i} style={{ ...styles.chip, background: "#e8f8f0" }}>
              {h}
            </span>
          ))}
        </div>
      </div>

      {/* ⚠️ Concerns */}
      <div style={styles.section}>
        <strong>Watchouts</strong>
        <div style={styles.chips}>
          {match.concerns?.length === 0 ? (
            <span style={styles.chip}>No major concerns</span>
          ) : (
            (match.concerns || []).map((c, i) => (
              <span key={i} style={{ ...styles.chip, background: "#fdecea" }}>
                {c}
              </span>
            ))
          )}
        </div>
      </div>

      {/* 💡 Explanation */}
      <p style={styles.explanation}>
        💡 {match.explanation}
      </p>

      {/* 🎯 ACTION BUTTONS */}
      <div style={styles.actions}>
        <button style={styles.chatBtn} onClick={openChat}>
          💬 Chat
        </button>

        <button style={{ ...styles.meetBtn, background: color }} onClick={openMeet}>
          🎥 Meet
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: {
    position: "relative",
    background: "#fff",
    padding: "18px",
    margin: "14px 0",
    borderRadius: "12px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
    transition: "0.2s ease"
  },

  topBadge: {
    position: "absolute",
    top: -10,
    right: 10,
    background: "#ffd700",
    padding: "4px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "bold"
  },

  name: {
    marginBottom: 6
  },

  scoreRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  label: {
    fontWeight: "bold"
  },

  score: {
    fontWeight: "bold",
    fontSize: "18px"
  },

  type: {
    color: "#666",
    marginBottom: 8
  },

  section: {
    marginTop: 10
  },

  traitsGrid: {
    display: "flex",
    gap: "10px",
    marginTop: "6px"
  },

  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6
  },

  chip: {
    padding: "4px 8px",
    borderRadius: "6px",
    background: "#eef2ff",
    fontSize: "12px"
  },

  explanation: {
    marginTop: 10,
    fontStyle: "italic",
    color: "#444"
  },

  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "14px"
  },

  chatBtn: {
    flex: 1,
    padding: "10px",
    background: "#34495e",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },

  meetBtn: {
    flex: 1,
    padding: "10px",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold"
  }
};

export default Card;
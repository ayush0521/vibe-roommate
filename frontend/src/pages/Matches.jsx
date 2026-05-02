import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await apiRequest("/match");
        setMatches(data.matches || data);
      } catch (err) {
        console.error("MATCH ERROR:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) return <h3>Loading matches...</h3>;
  if (error) return <h3>Error: {error}</h3>;

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>🔥 Your Matches</h2>

      {matches.length === 0 ? (
        <p>No matches found</p>
      ) : (
        matches.map((m, i) => (
          <div key={i} style={{ margin: "10px" }}>
            {m.name || m.email}
          </div>
        ))
      )}
    </div>
  );
};

export default Matches;
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Chat = () => {
  const { userId } = useParams(); // receiver ID
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const token = localStorage.getItem("token");

  // 🔁 Fetch messages
  const fetchMessages = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/message/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setMessages(data || []);
    } catch (err) {
      console.error("Fetch messages error:", err);
    }
  };

  // 📤 Send message
  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      await fetch("http://localhost:5000/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: userId,
          text,
        }),
      });

      setText("");
      fetchMessages();
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  // ⏱ Auto refresh every 3 sec (simple realtime)
  useEffect(() => {
    fetchMessages();

    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div style={styles.container}>
      <h2>💬 Chat</h2>

      <div style={styles.chatBox}>
        {messages.length === 0 && (
          <p style={{ textAlign: "center", color: "#888" }}>
            No messages yet
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: msg.isMine ? "flex-end" : "flex-start",
              background: msg.isMine ? "#4CAF50" : "#eee",
              color: msg.isMine ? "#fff" : "#000",
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div style={styles.inputRow}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.button}>
          Send
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "600px",
    margin: "auto",
  },

  chatBox: {
    height: "400px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    border: "1px solid #ddd",
    padding: "10px",
    borderRadius: "8px",
    background: "#fafafa",
  },

  message: {
    padding: "8px 12px",
    borderRadius: "10px",
    maxWidth: "70%",
  },

  inputRow: {
    display: "flex",
    marginTop: "10px",
    gap: "8px",
  },

  input: {
    flex: 1,
    padding: "10px",
  },

  button: {
    padding: "10px 16px",
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    borderRadius: "6px",
  },
};

export default Chat;
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { apiRequest } from "../services/api";

const Chat = () => {

  const { id } = useParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // 🔥 Current User
  const token = localStorage.getItem("token");



  // =========================
  // FETCH MESSAGES
  // =========================
  const fetchMessages = async () => {

    try {

      const data = await apiRequest(`/messages/${id}`);

      console.log("CHAT DATA:", data);

      setMessages(Array.isArray(data) ? data : []);

    } catch (err) {

      console.error("FETCH MESSAGE ERROR:", err.message);

    } finally {

      setLoading(false);
    }
  };



  // =========================
  // SEND MESSAGE
  // =========================
  const sendMessage = async () => {

    if (!text.trim()) return;

    try {

      setSending(true);

      await apiRequest("/messages", {
        method: "POST",

        body: JSON.stringify({
          receiverId: id,
          text: text.trim()
        })
      });

      // ✅ Clear input
      setText("");

      // ✅ Refresh instantly
      await fetchMessages();

    } catch (err) {

      console.error("SEND MESSAGE ERROR:", err.message);

      alert("Failed to send message");

    } finally {

      setSending(false);
    }
  };



  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {

    fetchMessages();

  }, [id]);



  // =========================
  // AUTO REFRESH
  // =========================
  useEffect(() => {

    const interval = setInterval(() => {

      fetchMessages();

    }, 3000);

    return () => clearInterval(interval);

  }, [id]);



  // =========================
  // AUTO SCROLL
  // =========================
  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });

  }, [messages]);



  // =========================
  // GOOGLE MEET
  // =========================
  const openMeet = () => {

    window.open(
      "https://meet.google.com/new",
      "_blank"
    );
  };



  // =========================
  // LOADING SCREEN
  // =========================
  if (loading) {

    return (
      <div style={styles.center}>
        <h2>Loading chat...</h2>
      </div>
    );
  }



  return (
    <div style={styles.page}>


      {/* HEADER */}
      <div style={styles.header}>

        <h2>💬 Chat Room</h2>

        <button
          style={styles.meetButton}
          onClick={openMeet}
        >
          🎥 Google Meet
        </button>

      </div>



      {/* CHAT AREA */}
      <div style={styles.chatBox}>


        {messages.length === 0 ? (

          <p style={{ color: "#666" }}>
            No messages yet
          </p>

        ) : (

          messages.map((msg) => {

            const isSender =
              String(msg.sender) !== String(id);

            return (

              <div
                key={msg._id}
                style={{
                  ...styles.message,

                  alignSelf:
                    isSender
                      ? "flex-end"
                      : "flex-start",

                  background:
                    isSender
                      ? "#007bff"
                      : "#e4e6eb",

                  color:
                    isSender
                      ? "#fff"
                      : "#000"
                }}
              >

                {msg.text}

              </div>
            );
          })
        )}


        <div ref={messagesEndRef} />

      </div>



      {/* INPUT AREA */}
      <div style={styles.inputContainer}>


        <input
          type="text"

          placeholder="Type your message..."

          value={text}

          onChange={(e) =>
            setText(e.target.value)
          }

          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}

          style={styles.input}
        />


        <button
          onClick={sendMessage}

          style={styles.button}

          disabled={sending}
        >

          {sending
            ? "Sending..."
            : "Send"}

        </button>

      </div>

    </div>
  );
};



// =========================
// STYLES
// =========================
const styles = {

  page: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#f5f7fb"
  },

  header: {
    padding: "20px",
    background: "#fff",
    borderBottom: "1px solid #ddd",

    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  meetButton: {
    background: "#0f9d58",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold"
  },

  chatBox: {
    flex: 1,
    padding: "20px",

    overflowY: "auto",

    display: "flex",
    flexDirection: "column",

    gap: "10px"
  },

  message: {
    padding: "12px 16px",

    borderRadius: "14px",

    maxWidth: "60%",

    wordBreak: "break-word"
  },

  inputContainer: {
    display: "flex",

    padding: "15px",

    background: "#fff",

    borderTop: "1px solid #ddd"
  },

  input: {
    flex: 1,

    padding: "12px",

    borderRadius: "10px",

    border: "1px solid #ccc",

    marginRight: "10px"
  },

  button: {
    padding: "12px 20px",

    border: "none",

    borderRadius: "10px",

    background: "#007bff",

    color: "#fff",

    cursor: "pointer",

    fontWeight: "bold"
  },

  center: {
    height: "100vh",

    display: "flex",

    justifyContent: "center",

    alignItems: "center"
  }
};

export default Chat;
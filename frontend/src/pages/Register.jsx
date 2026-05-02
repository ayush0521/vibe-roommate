import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async () => {
    try {
      if (!form.name || !form.email || !form.password) {
        alert("All fields are required");
        return;
      }

      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      alert("Registered successfully");

      // ✅ SAFE NAVIGATION
      navigate("/");

    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>📝 Register</h2>

      <input
        name="name"
        placeholder="Name"
        onChange={handleChange}
        style={styles.input}
      />

      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
        style={styles.input}
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
        style={styles.input}
      />

      <button onClick={handleRegister} style={styles.button}>
        Register
      </button>
    </div>
  );
}

const styles = {
  container: {
    marginTop: "100px",
    textAlign: "center"
  },
  input: {
    display: "block",
    margin: "10px auto",
    padding: "10px",
    width: "250px"
  },
  button: {
    padding: "10px 20px",
    background: "blue",
    color: "white",
    border: "none",
    cursor: "pointer"
  }
};

export default Register;
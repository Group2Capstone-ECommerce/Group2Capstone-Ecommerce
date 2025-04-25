// Login form page
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "react-bootstrap";
import { Form } from "react-bootstrap";
import { Button } from "react-bootstrap";
import "../index.css";
import { useAuth } from "../components/AuthContext.jsx";

export default function LoginForm() {
  const LOGIN_API_URL = "http://localhost:3000/api/auth/login";

    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", password: ""});
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const {token, setToken} = useAuth();
    const {isAdmin, setIsAdmin} = useAuth();

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      setErrorMessage("");
    
      try {
        const res = await fetch(LOGIN_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        const data = await res.json();
        console.log("data =>", data);
    
        if (res.ok && data.token) {
          setToken(data.token);
          setIsAdmin(data.isAdmin);
          setSuccessMsg("Account login successful! Redirecting...");
          setTimeout(() => {
            navigate("/");
          }, 3000);
        } else {
          setErrorMessage(data.error || "Invalid login credentials");
        }
      } catch (err) {
        setErrorMessage(err.message || "Invalid login credentials");
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <section className="login-container">
      <Card className="login-card">
        <Card.Body>
          <h1 className="login-title">Login</h1>
          {successMsg && <div className="success">{successMsg}</div>}
          {errorMessage && <div className="failure">{errorMessage}</div>}
          <br />
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="username" className="field">
              <Form.Label>Username</Form.Label>
              <Form.Control
                name="username"
                placeholder="Username"
                value={form.username}
                disabled={submitting}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="password" className="field">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                disabled={submitting}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </Form.Group>
            <Button 
            type="submit"
            variant="primary"
            className="submit-button"
            disabled={submitting}>           
              {submitting ? "Signing in…" : "Sign In"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </section>
  );
}
// Login form page
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "";
import { Input } from " ";
import { Button } from "";

export default function LoginForm() {
  const LOGIN_API_URL = "http://localhost:3000/api/auth/login";

    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", password: ""});
    const [errors, setErrors] = useState({ username: "", password: ""});
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value}));
        setErrors((p) => ({ ...p, [name]: ""}));
    };

    const validate = () => {
        const newErr = {
            username: form.username.trim() ? "": "Username required",
            password: form.password.trim() ? "": "Password required",
        };
      setErrors(newErr);
      return !newErr.username && !newErr.password;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            const res = await fetch(LOGIN_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error("Invalid credentials");
            navigate("/");
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
      <section className="loginContainer">
      <Card className="loginCard">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
              <div>
                <Input
                  name="username"
                  placeholder="Username"
                  value={form.username}
                  onChange={handleChange}
                  disabled={submitting}
                />
                {errors.username && (
                  <p>{errors.username}</p>
                )}
              </div>
              <div>
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={submitting}
                />
                {errors.password && (
                  <p>{errors.password}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Signing in…" : "Sign In"}
              </Button>
            </form>
        </Card> 
       </section> 
    );
}
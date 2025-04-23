import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
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
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                bosy: JSON.stringify(form),
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
        
    )

}
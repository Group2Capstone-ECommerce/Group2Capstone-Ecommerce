import {useState} from 'react'
import { useNavigate } from "react-router-dom";

export default function Register() {
    const REGISTER_API_URL = 'http://localhost:3000/api/auth/register';  
    const CHECK_USER_API_URL = "http://localhost:3000/api/auth/check-username";
    const CHECK_EMAIL_API_URL = "http://localhost:3000/api/auth/check-email";

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState(null);
    const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
    const [emailAvailable, setEmailAvailable] = useState(null);
    const [emailErrorMessage, setEmailErrorMessage] = useState('');
    const navigate = useNavigate();
    
    async function handleSubmit(event) {
        event.preventDefault();
        console.log('Name =>', name,'Email => ', email,'Username =>', username,'Password =>', password)
        try {
            const response = await fetch(REGISTER_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    username,
                    password,
                })
            })
            const data = await response.json();

            console.log('Response', response)
            console.log('Data', data)
            console.log('Data error', data.error)
            console.log('Status', response.status)

            if(response.ok){
                setSuccessMessage('Account created successfully! Redirecting...');
                setErrorMessage('');

                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } else {
                const message = data.error?.toString() || 'Signup failed';
                setErrorMessage(message);
                setSuccessMessage('');
            }
            
        } catch (error) {
            setErrorMessage(error.message || 'An error occurred during signup');
            setSuccessMessage('');
        }
    } 

    return (
        <div className="pageWrapper">
        <div className='registerPage'>
            <h1>Register</h1>
            {successMessage && <div className="success">{successMessage}</div>}
            {errorMessage && <div className="failure">{errorMessage}</div>}
            <br />
            <form onSubmit={handleSubmit}>
                {/*  input boxes */}
                <div>
                    Name: <input value={name} onChange={(e) => setName(e.target.value)} required/>
                </div>
                <div>
                    Email: <input value={email} onChange={(e) => setEmail(e.target.value)} required/>
                </div>
                <div>
                    Username: <input value={username} onChange={(e) => setUsername(e.target.value)} required/>
                </div>
                <div>
                    Password: <input value={password} onChange={(e) => setPassword(e.target.value)} required/>
                </div>
                <button>Submit</button>
            </form>
        </div>
        </div>
    )
}
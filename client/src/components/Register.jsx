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

    const checkUsernameAvailability = async (username) => {
        try {
          const response = await fetch(`${CHECK_USER_API_URL}?value=${encodeURIComponent(username)}`);
          const data = await response.json();
          setUsernameAvailable(data.available);
          if (!data.available) {
            setUsernameErrorMessage('Username already taken');
          } else {
            setUsernameErrorMessage('');
          }
        } catch (error) {
            setUsernameErrorMessage('Error checking username availability');
            setUsernameAvailable(null);
        }
      };

      const checkEmailAvailability = async (email) => {
        try {
          const response = await fetch(`${CHECK_EMAIL_API_URL}?value=${encodeURIComponent(email)}`);
          const data = await response.json();
          setEmailAvailable(data.available);
          if (!data.available) {
            setEmailErrorMessage('Email already taken');
          } else {
            setErrorMessage('');
          }
        } catch (error) {
            setEmailErrorMessage('Error checking email availability');
            setUsernameAvailable(null);
        }
      };

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
            console.log('Status', response.status)

            // TODO: Validation for if user already exists
            if(response.ok){
                setSuccessMessage('Account created successfully! Redirecting...');
                setErrorMessage('');

                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } else {
                const data = await response.json();
                setErrorMessage(data.message || 'Signup failed');
                setSuccessMessage('');
            }
            
        } catch (error) {
            setErrorMessage('An error occurred during signup');
            setSuccessMessage('');
        }
    } 

    return (
        <div className='registerPage'>
            <h1>Register</h1>
            {successMessage && <div className="success">{successMessage}</div>}
            {usernameAvailable === false && (<div className="error">{usernameErrorMessage}</div>)}
            {emailAvailable === false && (<div className="error">{emailErrorMessage}</div>)}
            <br />
            <form onSubmit={handleSubmit}>
                {/*  input boxes */}
                <div>
                    Name: <input value={name} onChange={(e) => setName(e.target.value)} required/>
                </div>
                <div>
                    Email: <input value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => checkEmailAvailability(email)} required/>
                </div>
                <div>
                    Username: <input value={username} onChange={(e) => setUsername(e.target.value)} onBlur={() => checkUsernameAvailability(username)} required/>
                </div>
                <div>
                    Password: <input value={password} onChange={(e) => setPassword(e.target.value)} required/>
                </div>
                <button disabled={usernameAvailable === false}>Submit</button>
            </form>
        </div>
    )
}
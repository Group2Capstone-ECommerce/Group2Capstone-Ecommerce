import {useState} from 'react'

export default function Register() {
    const REGISTER_API_URL = 'http://localhost:3000/api/auth/register';  
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState(null);
    const [error, setError] = useState(null);


    async function handleSubmit(event,name,email,username,password) {
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
            }).then(response => response.json())
            .then(result => {
                console.log(result);
                setSuccessMessage(result)
            })
                .catch(console.error)
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <div calssname='registerPage'>
            <form onSubmit={(e) => handleSubmit(e,name,email,username,password)}>
                {/*  input boxes */}
                <h1>Register</h1>
                <div>
                    Name: <input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                    Email: <input value={email} onChange={(e) => setEmail(e.target.value)}/>
                </div>
                <div>
                    Username: <input value={username} onChange={(e) => setUsername(e.target.value)}/>
                </div>
                <div>
                    Password: <input value={password} onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <button>Submit</button>
            </form>
            <div className='success/error'>
                {error && <h3>{error}</h3>}
                {successMessage && <h3>{successMessage}</h3>}
            </div>
        </div>
    )
}
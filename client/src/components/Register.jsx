import {useState} from 'react'

export default function Register() {
    const REGISTER_API_URL = 'http://localhost:3000/api/auth/register';  
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');//'success' or 'error'


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

            if(response.ok){
                setMessage(data.message || 'Registration Successful!');
                setMessageType('success');
            } else {
                setMessage(data.message || 'Registration Failed.');
            }
            setMessageType('error')
            
        } catch (error) {
            console.error('Error during registration:', error);
            setMessage('An unexpected error occurred');
            setMessageType('error')
        }
    } 

    const renderMessage = () => {
        if(message){
            return(
                <p className={messageType}>{message}</p>
            );
        }
        return null
    }

    return (
        <div className='registerPage'>
            <form onSubmit={handleSubmit}>
                {/*  input boxes */}
                <h1>Register</h1>
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
            <div className='Message'>
                {renderMessage()}
            </div>
        </div>
    )
}
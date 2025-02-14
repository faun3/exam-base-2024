import React, {useContext, useEffect, useState} from "react";
import AppContext from "../../state/AppContext";
import {useLocation, useNavigate} from "react-router-dom";

const RegisterForm = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    const { user } = useContext(AppContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const handleRegisterClick = () => {
        user.register(email, password, 'regular');
    }

    useEffect(() => {
        user.emitter.addListener('REGISTER_SUCCESS', () => {
            setShowSuccessMessage(true);
            navigate(location.state?.from ?? '/');
        })
    }, [user.emitter, navigate, location]);

    return (
        <div className='login-form'>
            <div className='form-container'>
                <h1>Register</h1>
                <input
                    type='text'
                    placeholder='email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    type='password'
                    placeholder='password'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button onClick={handleRegisterClick}>Register</button>
                {showSuccessMessage ? (<p>You have registered!</p>) : null}
            </div>
        </div>
    )
}

export default RegisterForm;

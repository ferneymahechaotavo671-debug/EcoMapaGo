import './Login.css'
import logo from '../assets/logo.png'

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

function Login() {
    const navigate = useNavigate()

    const [correo, setCorreo] = useState('')
    const [password, setPassword] = useState('')

    const login = async (e) => {
        e.preventDefault()

        try {
            const res = await api.post('/login', {
                correo,
                password
            })

            localStorage.setItem('token', res.data.token)
            localStorage.setItem('usuario', JSON.stringify(res.data.usuario))

            navigate('/dashboard')
        } catch (err) {
            if (err.response?.status === 429) {
                alert('Demasiados intentos de inicio de sesión. Espera un minuto e intenta de nuevo.')
            } else {
                alert(err.response?.data?.error || 'Credenciales incorrectas')
            }
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg,#d8f3dc,#f4f7f5)'
        }}>

            <form
                onSubmit={login}
                className="card fade-in"
                style={{
                    width: '400px'
                }}
            >
                <img src={logo} className="logo" />

                <h1>EcoMapaGo</h1>
                <p>Reporta y mejora tu ciudad</p>

                <input
                    type="email"
                    placeholder="Correo"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '15px',
                        background: '#2d6a4f',
                        color: 'white',
                        borderRadius: '14px',
                        marginTop: '20px',
                        fontSize: '16px',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Iniciar Sesión
                </button>

                <div
    style={{
        marginTop:'20px',
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        gap:'10px'
    }}
>

    <Link
        to="/registro"
        style={{
            textDecoration:'none',
            color:'#2d6a4f',
            fontWeight:'600'
        }}
    >
        Crear cuenta
    </Link>

    <Link
        to="/recuperar-password"
        style={{
            textDecoration:'none',
            color:'#555'
        }}
    >
        ¿Olvidaste tu contraseña?
    </Link>

</div>
            </form>

        </div>
    )
}

export default Login

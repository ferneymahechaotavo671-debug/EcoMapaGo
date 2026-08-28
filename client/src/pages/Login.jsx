import './Login.css'
import logo from '../assets/logo.png'

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

function Login() {
    const navigate = useNavigate()

    const [correo, setCorreo] = useState('')
    const [password, setPassword] = useState('')
    const [tokenTemporal, setTokenTemporal] = useState(null)
    const [codigo2fa, setCodigo2fa] = useState('')
    const [verificando, setVerificando] = useState(false)

    const login = async (e) => {
        e.preventDefault()

        try {
            const res = await api.post('/login', {
                correo,
                password
            })

            if (res.data.requiere_2fa) {
                setTokenTemporal(res.data.token_temporal)
                return
            }

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

    const verificarCodigo2fa = async (e) => {
        e.preventDefault()
        setVerificando(true)
        try {
            const res = await api.post('/login/verificar-2fa', {
                token_temporal: tokenTemporal,
                codigo: codigo2fa
            })
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('usuario', JSON.stringify(res.data.usuario))
            navigate('/dashboard')
        } catch (err) {
            if (err.response?.status === 429) {
                alert('Demasiados intentos. Espera un minuto e intenta de nuevo.')
            } else {
                alert(err.response?.data?.error || 'Código incorrecto')
            }
        } finally {
            setVerificando(false)
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
                onSubmit={tokenTemporal ? verificarCodigo2fa : login}
                className="card fade-in"
                style={{
                    width: '400px'
                }}
            >
                <img src={logo} className="logo" />

                <h1>EcoMapaGo</h1>

                {!tokenTemporal ? (
                    <>
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
                    </>
                ) : (
                    <>
                        <p>🔐 Ingresa el código de 6 dígitos de tu app autenticadora</p>

                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="123456"
                            value={codigo2fa}
                            onChange={(e) => setCodigo2fa(e.target.value.replace(/\D/g, ''))}
                            style={{ textAlign: 'center', fontSize: '22px', letterSpacing: '6px' }}
                            autoFocus
                        />
                    </>
                )}

                <button
                    type="submit"
                    disabled={verificando}
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
                    {tokenTemporal ? (verificando ? 'Verificando...' : 'Verificar código') : 'Iniciar Sesión'}
                </button>

                {tokenTemporal && (
                    <button
                        type="button"
                        onClick={() => { setTokenTemporal(null); setCodigo2fa('') }}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: 'transparent',
                            color: '#555',
                            border: 'none',
                            marginTop: '10px',
                            cursor: 'pointer'
                        }}
                    >
                        ← Volver
                    </button>
                )}

                {!tokenTemporal && (
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
                )}
            </form>

        </div>
    )
}

export default Login

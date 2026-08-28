import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

function RestablecerPassword() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token') || ''

    const [passwordNueva, setPasswordNueva] = useState('')
    const [confirmar, setConfirmar] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [loading, setLoading] = useState(false)

    const restablecer = async (e) => {
        e.preventDefault()

        if (!token) {
            setMensaje('⚠️ Este enlace no tiene un token válido. Solicita uno nuevo.')
            return
        }
        if (passwordNueva !== confirmar) {
            setMensaje('❌ Las contraseñas no coinciden')
            return
        }

        setLoading(true)
        setMensaje('')
        try {
            await api.post('/restablecer-password', {
                token,
                password_nueva: passwordNueva
            })
            setMensaje('✅ Contraseña actualizada. Ya puedes iniciar sesión.')
            setTimeout(() => navigate('/'), 1800)
        } catch (error) {
            setMensaje('❌ ' + (error.response?.data?.error || 'No se pudo restablecer la contraseña'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg,#d8f3dc,#f4f7f5)',
            padding: '20px'
        }}>
            <form onSubmit={restablecer} className="card" style={{ width: '400px' }}>
                <h1>Nueva contraseña 🔑</h1>
                <p style={{ color: '#64748b', fontSize: '14px' }}>
                    Elige una nueva contraseña para tu cuenta.
                </p>

                <input
                    type="password"
                    placeholder="Nueva contraseña"
                    value={passwordNueva}
                    onChange={(e) => setPasswordNueva(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Confirmar nueva contraseña"
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    style={{ marginTop: '10px' }}
                />

                <small style={{ color: '#64748b', fontSize: '12px', display: 'block', marginTop: '8px', lineHeight: '1.5' }}>
                    Debe tener mínimo 10 caracteres, mayúscula, minúscula, número y símbolo (ej: !@#$%).
                </small>

                {mensaje && (
                    <div style={{
                        marginTop: '18px',
                        padding: '14px',
                        borderRadius: '14px',
                        background: '#edf7ed',
                        color: '#1b4332',
                        fontWeight: '600',
                        textAlign: 'center'
                    }}>
                        {mensaje}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '15px',
                        background: '#2d6a4f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '14px',
                        marginTop: '20px',
                        cursor: 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Guardando...' : 'Restablecer contraseña'}
                </button>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Link to="/" style={{ color: '#2e7d32', fontWeight: 'bold', textDecoration: 'none' }}>
                        ← Volver al Login
                    </Link>
                </div>
            </form>
        </div>
    )
}

export default RestablecerPassword

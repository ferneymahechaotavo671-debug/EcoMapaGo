import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

function Registro() {

    const navigate = useNavigate()

    const [mensaje, setMensaje] = useState('')
    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState({
        nombre: '',
        correo: '',
        password: '',
        confirmPassword: ''
    })

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        })

    }

    // 🔐 NIVEL DE SEGURIDAD DE CONTRASEÑA (alineado con la política del backend)
    const getPasswordStrength = (password) => {

        let score = 0

        if (password.length >= 10) score++
        if (/[A-Z]/.test(password)) score++
        if (/[a-z]/.test(password)) score++
        if (/\d/.test(password)) score++
        if (/[!@#$%^&*()_\-+=[\]{};:'",.<>/?\\|`~]/.test(password)) score++

        if (score <= 2) return { text: 'Débil 🔴', color: '#c62828' }
        if (score <= 4) return { text: 'Media 🟠', color: '#f9a825' }
        return { text: 'Fuerte 🟢', color: '#2e7d32' }
    }

    const registrar = async (e) => {

        e.preventDefault()

        if (!form.nombre || !form.correo || !form.password || !form.confirmPassword) {
            setMensaje('⚠️ Completa todos los campos')
            return
        }

        // EMAIL VALIDACIÓN
        if (!form.correo.includes('@') || !form.correo.includes('.com')) {
            setMensaje('📧 El correo debe contener @ y .com')
            return
        }

        // PASSWORD SEGURA (debe coincidir con la política robusta del backend)
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};:'",.<>/?\\|`~]).{10,}$/

        if (!passwordRegex.test(form.password)) {
            setMensaje('🔒 La contraseña debe tener mínimo 10 caracteres, mayúscula, minúscula, número y símbolo')
            return
        }

        // CONFIRMACIÓN
        if (form.password !== form.confirmPassword) {
            setMensaje('❌ Las contraseñas no coinciden')
            return
        }

        try {

            setLoading(true)
            setMensaje('⏳ Creando cuenta...')

            await api.post('/registro', {
                nombre: form.nombre,
                correo: form.correo,
                password: form.password
            })

            setMensaje('✅ Cuenta creada correctamente')

            setTimeout(() => {
                navigate('/')
            }, 1500)

        } catch (error) {

            setMensaje(
                error.response?.data?.mensaje ||
                '❌ Error al registrar'
            )

        } finally {
            setLoading(false)
        }
    }

    const strength = getPasswordStrength(form.password)

    return (

        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg,#d8f3dc,#f4f7f5)',
            padding: '20px'
        }}>

            <form
                onSubmit={registrar}
                className="card fade-in"
                style={{
                    width: '100%',
                    maxWidth: '420px'
                }}
            >

                <h1 style={{
                    textAlign: 'center',
                    color: '#1b4332'
                }}>
                    Crear cuenta 🌍
                </h1>

                <p style={{
                    marginTop: '10px',
                    color: '#64748b',
                    fontSize: '14px',
                    textAlign: 'center'
                }}>
                    Usa un correo válido y una contraseña segura.
                </p>

                <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre completo"
                    value={form.nombre}
                    onChange={handleChange}
                />

                <input
                    type="email"
                    name="correo"
                    placeholder="Ej: usuario@gmail.com"
                    value={form.correo}
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={form.password}
                    onChange={handleChange}
                />

                {/* 🔐 INDICADOR DE SEGURIDAD */}
                {form.password && (
                    <div style={{
                        marginTop: '6px',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: strength.color
                    }}>
                        Seguridad: {strength.text}
                    </div>
                )}

                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirmar contraseña"
                    value={form.confirmPassword}
                    onChange={handleChange}
                />

                {/* ayuda contraseña */}
                <small style={{
                    color: '#64748b',
                    fontSize: '12px',
                    display: 'block',
                    marginTop: '8px',
                    lineHeight: '1.5'
                }}>
                    La contraseña debe tener:
                    <br />
                    • Mínimo 10 caracteres
                    <br />
                    • Una mayúscula y una minúscula
                    <br />
                    • Un número
                    <br />
                    • Un símbolo (ej: ! @ # $ % &)
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
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Creando cuenta...' : 'Registrarme'}
                </button>

                <div style={{
                    marginTop: '22px',
                    textAlign: 'center'
                }}>
                    <Link
                        to="/"
                        style={{
                            color: '#2e7d32',
                            fontWeight: 'bold',
                            textDecoration: 'none'
                        }}
                    >
                        ← Volver al Login
                    </Link>
                </div>

            </form>

        </div>
    )
}

export default Registro
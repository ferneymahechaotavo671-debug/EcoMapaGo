import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../services/api'
import './Perfil.css'

function Perfil() {
    const navigate = useNavigate()
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')

    const [nombre, setNombre] = useState(usuario?.nombre || '')
    const [passwordActual, setPasswordActual] = useState('')
    const [passwordNueva, setPasswordNueva] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [loading, setLoading] = useState(false)
    const [puntos, setPuntos] = useState(null)

    useEffect(() => { cargarPerfil() }, [])

    const cargarPerfil = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await api.get('/perfil', { headers: { Authorization: `Bearer ${token}` } })
            setPuntos(res.data.puntos ?? 0)
        } catch (e) { console.log(e) }
    }

    const guardar = async (e) => {
        e.preventDefault()
        if (!nombre.trim()) {
            setMensaje('⚠️ El nombre no puede estar vacío')
            return
        }
        setLoading(true)
        setMensaje('')
        try {
            const token = localStorage.getItem('token')
            const res = await api.put('/perfil', {
                nombre,
                password_actual: passwordActual,
                password_nueva: passwordNueva
            }, { headers: { Authorization: `Bearer ${token}` } })

            // Actualizar nombre en localStorage
            const usuarioActualizado = { ...usuario, nombre }
            localStorage.setItem('usuario', JSON.stringify(usuarioActualizado))

            setMensaje('✅ ' + res.data.mensaje)
            setPasswordActual('')
            setPasswordNueva('')
        } catch (e) {
            setMensaje('❌ ' + (e.response?.data?.error || 'Error al actualizar'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="perfil-layout">
            <Sidebar />
            <div className="perfil-container">
                <h1>Mi Perfil 👤</h1>

                <div className="perfil-card">
                    <div className="perfil-avatar">
                        {usuario?.nombre?.charAt(0).toUpperCase()}
                    </div>
                    <p style={{ color: '#64748b', margin: '8px 0 0' }}>
                        📧 {usuario?.correo}
                    </p>
                    <span className="perfil-rol">
                        🔐 {usuario?.rol}
                    </span>

                    <div className="perfil-puntos">
                        <span className="perfil-puntos-numero">🏆 {puntos !== null ? puntos : '...'}</span>
                        <span className="perfil-puntos-label">puntos EcoMapaGo</span>
                        <p className="perfil-puntos-info">Ganas 10 puntos cada vez que un reporte tuyo es aprobado.</p>
                    </div>
                </div>

                <form className="perfil-form" onSubmit={guardar}>
                    <h2>Editar información</h2>

                    <label>Nombre</label>
                    <input type="text" value={nombre}
                        onChange={e => setNombre(e.target.value)} />

                    <h3>Cambiar contraseña <span style={{ fontWeight: 400, fontSize: '13px', color: '#64748b' }}>(opcional)</span></h3>

                    <label>Contraseña actual</label>
                    <input type="password" value={passwordActual}
                        onChange={e => setPasswordActual(e.target.value)}
                        placeholder="Solo si vas a cambiarla" />

                    <label>Nueva contraseña</label>
                    <input type="password" value={passwordNueva}
                        onChange={e => setPasswordNueva(e.target.value)}
                        placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número" />

                    {mensaje && (
                        <div className="perfil-mensaje">{mensaje}</div>
                    )}

                    <button type="submit" className="perfil-btn" disabled={loading}>
                        {loading ? 'Guardando...' : '💾 Guardar cambios'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Perfil

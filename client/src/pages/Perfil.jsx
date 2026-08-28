import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
    const [nivel, setNivel] = useState(null)

    const [dosfaHabilitado, setDosfaHabilitado] = useState(null)
    const [configurando2fa, setConfigurando2fa] = useState(false)
    const [qrData, setQrData] = useState(null)
    const [codigoActivacion, setCodigoActivacion] = useState('')
    const [passwordDesactivar, setPasswordDesactivar] = useState('')
    const [mostrarDesactivar, setMostrarDesactivar] = useState(false)
    const [cargando2fa, setCargando2fa] = useState(false)

    useEffect(() => { cargarPerfil(); cargarEstado2fa() }, [])

    const cargarEstado2fa = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await api.get('/2fa/estado', { headers: { Authorization: `Bearer ${token}` } })
            setDosfaHabilitado(res.data.habilitado)
        } catch (e) { console.log(e) }
    }

    const iniciarConfig2fa = async () => {
        setCargando2fa(true)
        try {
            const token = localStorage.getItem('token')
            const res = await api.post('/2fa/iniciar', {}, { headers: { Authorization: `Bearer ${token}` } })
            setQrData(res.data)
            setConfigurando2fa(true)
        } catch (e) {
            alert(e.response?.data?.error || 'Error al iniciar la configuración')
        } finally {
            setCargando2fa(false)
        }
    }

    const confirmarActivacion2fa = async () => {
        if (!codigoActivacion) return
        setCargando2fa(true)
        try {
            const token = localStorage.getItem('token')
            await api.post('/2fa/activar', { codigo: codigoActivacion }, { headers: { Authorization: `Bearer ${token}` } })
            alert('✅ Verificación en dos pasos activada correctamente')
            setDosfaHabilitado(true)
            setConfiguring2faReset()
        } catch (e) {
            alert(e.response?.data?.error || 'Código incorrecto')
        } finally {
            setCargando2fa(false)
        }
    }

    const setConfiguring2faReset = () => {
        setConfigurando2fa(false)
        setQrData(null)
        setCodigoActivacion('')
    }

    const desactivar2fa = async () => {
        if (!passwordDesactivar) return
        if (!window.confirm('¿Seguro que quieres desactivar la verificación en dos pasos?')) return
        setCargando2fa(true)
        try {
            const token = localStorage.getItem('token')
            await api.post('/2fa/desactivar', { password_actual: passwordDesactivar }, { headers: { Authorization: `Bearer ${token}` } })
            alert('Verificación en dos pasos desactivada')
            setDosfaHabilitado(false)
            setMostrarDesactivar(false)
            setPasswordDesactivar('')
        } catch (e) {
            alert(e.response?.data?.error || 'Error al desactivar')
        } finally {
            setCargando2fa(false)
        }
    }

    const cargarPerfil = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await api.get('/perfil', { headers: { Authorization: `Bearer ${token}` } })
            setPuntos(res.data.puntos ?? 0)
            setNivel(res.data.nivel ?? null)
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

                        {nivel && (
                            <div className="perfil-nivel">
                                <span className="perfil-nivel-nombre">{nivel.icono} {nivel.nombre}</span>
                                {nivel.siguiente_nombre ? (
                                    <>
                                        <div className="perfil-nivel-barra">
                                            <div
                                                className="perfil-nivel-barra-fill"
                                                style={{ width: `${nivel.progreso_porcentaje}%` }}
                                            />
                                        </div>
                                        <span className="perfil-nivel-siguiente">
                                            Te faltan {nivel.puntos_siguiente_nivel - nivel.puntos_actuales} puntos para "{nivel.siguiente_nombre}"
                                        </span>
                                    </>
                                ) : (
                                    <span className="perfil-nivel-siguiente">¡Alcanzaste el nivel máximo! 🎉</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <Link to="/certificado" className="perfil-certificado-link">
                    📜 Generar mi certificado de impacto ambiental
                </Link>

                <div className="perfil-seguridad-card">
                    <h2>🔐 Seguridad</h2>

                    {dosfaHabilitado === null && <p>Cargando estado de seguridad...</p>}

                    {dosfaHabilitado === false && !configurando2fa && (
                        <>
                            <p className="perfil-seguridad-texto">
                                La verificación en dos pasos agrega una capa extra: además de tu contraseña,
                                necesitarás un código de 6 dígitos generado por una app como Google Authenticator.
                            </p>
                            <button className="perfil-btn" onClick={iniciarConfig2fa} disabled={cargando2fa}>
                                {cargando2fa ? 'Cargando...' : '🛡️ Activar verificación en dos pasos'}
                            </button>
                        </>
                    )}

                    {configurando2fa && qrData && (
                        <div className="perfil-2fa-config">
                            <p className="perfil-seguridad-texto">
                                1. Escanea este código con Google Authenticator, Authy o similar:
                            </p>
                            <img src={qrData.qr} alt="Código QR de verificación en dos pasos" className="perfil-2fa-qr" />
                            <p className="perfil-seguridad-texto">
                                ¿No puedes escanear? Ingresa este código manualmente:
                                <code className="perfil-2fa-secreto">{qrData.secreto_manual}</code>
                            </p>
                            <p className="perfil-seguridad-texto">2. Escribe el código de 6 dígitos que te muestra la app:</p>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="123456"
                                value={codigoActivacion}
                                onChange={(e) => setCodigoActivacion(e.target.value.replace(/\D/g, ''))}
                                style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '4px' }}
                            />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button className="perfil-btn" onClick={confirmarActivacion2fa} disabled={cargando2fa}>
                                    {cargando2fa ? 'Verificando...' : '✅ Confirmar y activar'}
                                </button>
                                <button
                                    type="button"
                                    className="perfil-btn perfil-btn-secundario"
                                    onClick={setConfiguring2faReset}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}

                    {dosfaHabilitado === true && (
                        <>
                            <p className="perfil-2fa-activa">✅ Verificación en dos pasos activada</p>
                            {!mostrarDesactivar ? (
                                <button
                                    className="perfil-btn perfil-btn-secundario"
                                    onClick={() => setMostrarDesactivar(true)}
                                >
                                    Desactivar
                                </button>
                            ) : (
                                <div className="perfil-2fa-config">
                                    <label>Confirma tu contraseña actual para desactivar</label>
                                    <input
                                        type="password"
                                        value={passwordDesactivar}
                                        onChange={(e) => setPasswordDesactivar(e.target.value)}
                                    />
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        <button className="perfil-btn" onClick={desactivar2fa} disabled={cargando2fa}>
                                            {cargando2fa ? 'Procesando...' : 'Confirmar desactivación'}
                                        </button>
                                        <button
                                            type="button"
                                            className="perfil-btn perfil-btn-secundario"
                                            onClick={() => { setMostrarDesactivar(false); setPasswordDesactivar('') }}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
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
                        placeholder="Mín. 10 caract., mayúscula, minúscula, número y símbolo" />

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

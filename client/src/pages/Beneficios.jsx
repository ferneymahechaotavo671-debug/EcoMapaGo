import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'
import './Beneficios.css'

function Beneficios() {
    const [beneficios, setBeneficios] = useState([])
    const [misCanjes, setMisCanjes] = useState([])
    const [puntos, setPuntos] = useState(0)
    const [loading, setLoading] = useState(true)
    const [canjeando, setCanjeando] = useState(null)

    useEffect(() => { cargarTodo() }, [])

    const cargarTodo = async () => {
        setLoading(true)
        const token = localStorage.getItem('token')
        const headers = { Authorization: `Bearer ${token}` }
        try {
            const [resBeneficios, resPerfil, resCanjes] = await Promise.all([
                api.get('/beneficios', { headers }),
                api.get('/perfil', { headers }),
                api.get('/mis-canjes', { headers })
            ])
            setBeneficios(resBeneficios.data)
            setPuntos(resPerfil.data.puntos ?? 0)
            setMisCanjes(resCanjes.data)
        } catch (e) { console.log(e) }
        finally { setLoading(false) }
    }

    const canjear = async (beneficio) => {
        if (puntos < beneficio.costo_puntos) {
            alert('No tienes suficientes puntos para este beneficio todavía.')
            return
        }
        if (!window.confirm(`¿Canjear "${beneficio.titulo}" por ${beneficio.costo_puntos} puntos?`)) return

        setCanjeando(beneficio.id)
        try {
            const token = localStorage.getItem('token')
            const res = await api.post(`/beneficios/${beneficio.id}/canjear`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            alert(`🎉 ¡Canje exitoso! Tu código es: ${res.data.codigo}\n\nMuéstralo en ${beneficio.empresa_nombre} para reclamarlo.`)
            cargarTodo()
        } catch (e) {
            alert(e.response?.data?.error || 'Error al canjear el beneficio')
        } finally {
            setCanjeando(null)
        }
    }

    return (
        <div className="beneficios-layout">
            <Sidebar />
            <div className="beneficios-container">
                <div className="beneficios-content">
                    <h1 className="beneficios-title">🎁 Beneficios canjeables</h1>
                    <p className="beneficios-subtitle">
                        Cambia tus puntos EcoMapaGo por descuentos y beneficios reales con nuestras empresas aliadas.
                    </p>

                    <div className="beneficios-puntos-bar">
                        🏆 Tienes <strong>{puntos}</strong> puntos disponibles
                    </div>

                    {loading && <div className="beneficios-mensaje">Cargando beneficios...</div>}
                    {!loading && beneficios.length === 0 && (
                        <div className="beneficios-mensaje">Todavía no hay beneficios disponibles. ¡Vuelve pronto!</div>
                    )}

                    <div className="beneficios-grid">
                        {beneficios.map((b) => (
                            <div key={b.id} className="beneficio-card">
                                {b.empresa_logo ? (
                                    <img src={b.empresa_logo} alt={b.empresa_nombre} className="beneficio-logo" />
                                ) : (
                                    <div className="beneficio-icono">🎁</div>
                                )}
                                <h2>{b.titulo}</h2>
                                <span className="beneficio-empresa">{b.empresa_nombre}</span>
                                {b.descripcion && <p className="beneficio-desc">{b.descripcion}</p>}
                                <span className="beneficio-costo">🏆 {b.costo_puntos} puntos</span>
                                <button
                                    className="beneficio-btn"
                                    disabled={puntos < b.costo_puntos || canjeando === b.id}
                                    onClick={() => canjear(b)}
                                >
                                    {canjeando === b.id ? 'Canjeando...' : puntos < b.costo_puntos ? 'Puntos insuficientes' : 'Canjear'}
                                </button>
                            </div>
                        ))}
                    </div>

                    {misCanjes.length > 0 && (
                        <>
                            <h2 className="beneficios-subtitulo-seccion">Mis canjes</h2>
                            <div className="mis-canjes-lista">
                                {misCanjes.map((c) => (
                                    <div key={c.codigo} className="mi-canje-fila">
                                        <div>
                                            <strong>{c.beneficio_titulo}</strong> — {c.empresa_nombre}
                                            <div className="mi-canje-codigo">{c.codigo}</div>
                                        </div>
                                        <span className={`mi-canje-estado ${c.usado ? 'usado' : 'vigente'}`}>
                                            {c.usado ? '✔ Usado' : '⏳ Vigente'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Beneficios

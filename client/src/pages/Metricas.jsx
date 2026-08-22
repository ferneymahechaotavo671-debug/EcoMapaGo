import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'
import './Metricas.css'

function BarraHorizontal({ label, total, max, color }) {
    const ancho = max > 0 ? Math.max((total / max) * 100, 3) : 0
    return (
        <div className="barra-fila">
            <span className="barra-label">{label}</span>
            <div className="barra-track">
                <div className="barra-fill" style={{ width: `${ancho}%`, background: color }} />
            </div>
            <span className="barra-valor">{total}</span>
        </div>
    )
}

function Metricas() {
    const [datos, setDatos] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => { cargarMetricas() }, [])

    const cargarMetricas = async () => {
        setLoading(true)
        setError('')
        try {
            const token = localStorage.getItem('token')
            const res = await api.get('/metricas', { headers: { Authorization: `Bearer ${token}` } })
            setDatos(res.data)
        } catch (e) {
            setError('No se pudieron cargar las métricas. Intenta de nuevo más tarde.')
            console.log(e)
        } finally {
            setLoading(false)
        }
    }

    const maxCategoria = datos ? Math.max(...datos.reportes_por_categoria.map(c => c.total), 1) : 1
    const maxLocalidad = datos ? Math.max(...datos.reportes_por_localidad.map(l => l.total), 1) : 1

    return (
        <div className="metricas-layout">
            <Sidebar />
            <div className="metricas-container">
                <div className="metricas-content">
                    <h1 className="metricas-title">📊 Panel de Impacto EcoMapaGo</h1>
                    <p className="metricas-subtitle">
                        Resultados colectivos de la comunidad: reciclaje, participación ciudadana y red de aliados.
                    </p>

                    {loading && <div className="metricas-mensaje">Cargando métricas...</div>}
                    {error && <div className="metricas-mensaje metricas-error">{error}</div>}

                    {datos && !loading && (
                        <>
                            <div className="metricas-stats-grid">
                                <div className="metrica-stat">
                                    <span className="metrica-stat-icono">📍</span>
                                    <h2>{datos.total_reportes}</h2>
                                    <span>Reportes totales</span>
                                </div>
                                <div className="metrica-stat">
                                    <span className="metrica-stat-icono">✅</span>
                                    <h2>{datos.reportes_por_estado.aprobado}</h2>
                                    <span>Reportes aprobados</span>
                                </div>
                                <div className="metrica-stat metrica-stat-destacada">
                                    <span className="metrica-stat-icono">♻️</span>
                                    <h2>{datos.kg_estimados_reciclados} kg</h2>
                                    <span>Estimado de material reciclado</span>
                                </div>
                                <div className="metrica-stat">
                                    <span className="metrica-stat-icono">🏭</span>
                                    <h2>{datos.total_empresas}</h2>
                                    <span>Empresas aliadas</span>
                                </div>
                                <div className="metrica-stat">
                                    <span className="metrica-stat-icono">👥</span>
                                    <h2>{datos.total_usuarios}</h2>
                                    <span>Usuarios registrados</span>
                                </div>
                                <div className="metrica-stat">
                                    <span className="metrica-stat-icono">🏆</span>
                                    <h2>{datos.total_puntos_otorgados}</h2>
                                    <span>Puntos otorgados en total</span>
                                </div>
                            </div>

                            <div className="metricas-paneles">
                                <div className="metrica-panel">
                                    <h3>Reportes por categoría</h3>
                                    {datos.reportes_por_categoria.length === 0 && <p className="metrica-vacio">Aún no hay reportes.</p>}
                                    {datos.reportes_por_categoria.map(c => (
                                        <BarraHorizontal key={c.categoria} label={c.categoria} total={c.total} max={maxCategoria} color="#43a047" />
                                    ))}
                                </div>

                                <div className="metrica-panel">
                                    <h3>Top localidades con más reportes</h3>
                                    {datos.reportes_por_localidad.length === 0 && <p className="metrica-vacio">Aún no hay reportes.</p>}
                                    {datos.reportes_por_localidad.map(l => (
                                        <BarraHorizontal key={l.localidad} label={l.localidad} total={l.total} max={maxLocalidad} color="#2d6a4f" />
                                    ))}
                                </div>

                                <div className="metrica-panel">
                                    <h3>Estado de los reportes</h3>
                                    <BarraHorizontal label="Pendientes" total={datos.reportes_por_estado.pendiente} max={datos.total_reportes || 1} color="#f9a825" />
                                    <BarraHorizontal label="Aprobados" total={datos.reportes_por_estado.aprobado} max={datos.total_reportes || 1} color="#43a047" />
                                    <BarraHorizontal label="Rechazados" total={datos.reportes_por_estado.rechazado} max={datos.total_reportes || 1} color="#e53935" />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Metricas

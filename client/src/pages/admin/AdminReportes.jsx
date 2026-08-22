import { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import api from '../../services/api'
import '../../styles/admin.css'

const ESTADO_COLORES = {
    pendiente: { bg: '#fff3cd', color: '#856404', label: '⏳ Pendiente' },
    aprobado:  { bg: '#d1e7dd', color: '#0f5132', label: '✅ Aprobado' },
    rechazado: { bg: '#f8d7da', color: '#842029', label: '❌ Rechazado' }
}

const LIMITE = 10

function AdminReportes() {
    const [reportes, setReportes] = useState([])
    const [loading, setLoading] = useState(true)
    const [pagina, setPagina] = useState(1)
    const [hayMas, setHayMas] = useState(true)
    const [filtroEstado, setFiltroEstado] = useState('')
    const [filtroCategoria, setFiltroCategoria] = useState('')
    const [busqueda, setBusqueda] = useState('')

    useEffect(() => { obtenerReportes(1) }, [])

    const obtenerReportes = async (pag = 1) => {
        setLoading(true)
        const token = localStorage.getItem('token')
        try {
            const res = await api.get(`/reportes?pagina=${pag}&limite=${LIMITE}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (pag === 1) {
                setReportes(res.data)
            } else {
                setReportes(prev => [...prev, ...res.data])
            }
            setHayMas(res.data.length === LIMITE)
            setPagina(pag)
        } catch (e) { console.log(e) }
        finally { setLoading(false) }
    }

    const cambiarEstado = async (id, estado) => {
        const token = localStorage.getItem('token')
        try {
            await api.put(`/reportes/${id}/estado`, { estado }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setReportes(prev => prev.map(r => r.id === id ? { ...r, estado } : r))
        } catch (e) { alert('Error al cambiar estado') }
    }

    const eliminarReporte = async (id) => {
        if (!window.confirm('¿Eliminar este reporte?')) return
        const token = localStorage.getItem('token')
        try {
            await api.delete(`/reportes/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            setReportes(prev => prev.filter(r => r.id !== id))
        } catch (e) { alert('Error al eliminar') }
    }

    const formatFecha = (f) => f ? new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : ''

    const reportesFiltrados = reportes.filter(r => {
        const matchEst = !filtroEstado || r.estado === filtroEstado
        const matchCat = !filtroCategoria || r.categoria === filtroCategoria
        const matchTxt = !busqueda ||
            r.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
            r.localidad.toLowerCase().includes(busqueda.toLowerCase())
        return matchEst && matchCat && matchTxt
    })

    return (
        <div className="admin-layout">
            <Sidebar />
            <div className="admin-container">
                <div className="admin-content">
                    <h1 className="admin-title">📍 Gestión de Reportes</h1>

                    {/* Filtros */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                        <input type="text" placeholder="🔍 Buscar..."
                            value={busqueda} onChange={e => setBusqueda(e.target.value)}
                            style={{ flex: 1, minWidth: '160px', padding: '10px 14px', border: '1.5px solid #d1d5db', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                        />
                        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
                            style={{ padding: '10px', border: '1.5px solid #d1d5db', borderRadius: '10px', fontSize: '14px' }}>
                            <option value="">Todos los estados</option>
                            <option value="pendiente">⏳ Pendiente</option>
                            <option value="aprobado">✅ Aprobado</option>
                            <option value="rechazado">❌ Rechazado</option>
                        </select>
                        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
                            style={{ padding: '10px', border: '1.5px solid #d1d5db', borderRadius: '10px', fontSize: '14px' }}>
                            <option value="">Todas las categorías</option>
                            <option value="basura">🗑️ Basura</option>
                            <option value="contaminacion">☣️ Contaminación</option>
                            <option value="zona-verde">🌳 Zona verde</option>
                            <option value="reciclaje">♻️ Reciclaje</option>
                            <option value="otro">📌 Otro</option>
                        </select>
                        <span style={{ alignSelf: 'center', fontSize: '13px', color: '#64748b' }}>
                            {reportesFiltrados.length} reporte(s)
                        </span>
                    </div>

                    {loading && pagina === 1 && <div style={{ color: '#64748b' }}>Cargando reportes...</div>}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {reportesFiltrados.map(r => {
                            const est = ESTADO_COLORES[r.estado] || ESTADO_COLORES.pendiente
                            return (
                                <div key={r.id} className="admin-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1, minWidth: '200px' }}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                                            <strong style={{ color: '#1b4332' }}>{r.titulo}</strong>
                                            <span style={{ background: est.bg, color: est.color, padding: '2px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 600 }}>
                                                {est.label}
                                            </span>
                                        </div>
                                        <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#555' }}>{r.descripcion}</p>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {[`📍 ${r.localidad}`, `🏷️ ${r.categoria}`, `👤 ${r.usuario}`, `📅 ${formatFecha(r.fecha)}`].map(t => (
                                                <span key={t} style={{ background: '#f1f5f9', padding: '2px 10px', borderRadius: '10px', fontSize: '12px', color: '#475569' }}>{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <select
                                            value={r.estado}
                                            onChange={e => cambiarEstado(r.id, e.target.value)}
                                            style={{ padding: '8px 12px', border: '1.5px solid #d1d5db', borderRadius: '10px', fontSize: '13px', cursor: 'pointer' }}
                                        >
                                            <option value="pendiente">⏳ Pendiente</option>
                                            <option value="aprobado">✅ Aprobado</option>
                                            <option value="rechazado">❌ Rechazado</option>
                                        </select>
                                        <button onClick={() => eliminarReporte(r.id)}
                                            style={{ padding: '8px 12px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>
                                            🗑️ Eliminar
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {hayMas && !loading && (
                        <button
                            onClick={() => obtenerReportes(pagina + 1)}
                            style={{ marginTop: '24px', padding: '12px 28px', background: '#2d6a4f', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
                        >
                            Cargar más reportes
                        </button>
                    )}

                    {loading && pagina > 1 && <div style={{ color: '#64748b', marginTop: '16px' }}>Cargando más...</div>}
                </div>
            </div>
        </div>
    )
}

export default AdminReportes

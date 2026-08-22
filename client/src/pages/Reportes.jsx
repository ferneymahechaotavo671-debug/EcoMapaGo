import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'
import './Reportes.css'

const ESTADO_COLORES = {
    pendiente: { bg: '#fff3cd', color: '#856404', label: '⏳ Pendiente' },
    aprobado:  { bg: '#d1e7dd', color: '#0f5132', label: '✅ Aprobado' },
    rechazado: { bg: '#f8d7da', color: '#842029', label: '❌ Rechazado' }
}

const CATEGORIAS = ['basura', 'contaminacion', 'zona-verde', 'reciclaje', 'otro']

function Reportes() {
    const usuarioActual = JSON.parse(localStorage.getItem('usuario') || 'null')
    const [reportes, setReportes] = useState([])
    const [loading, setLoading] = useState(true)
    const [editando, setEditando] = useState(null)
    const [form, setForm] = useState({ titulo: '', descripcion: '', localidad: '', categoria: '' })

    // Filtros
    const [filtroCategoria, setFiltroCategoria] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('')
    const [filtroTexto, setFiltroTexto] = useState('')

    useEffect(() => { obtenerReportes() }, [])

    const obtenerReportes = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const res = await api.get('/reportes', { headers: { Authorization: `Bearer ${token}` } })
            setReportes(res.data)
        } catch (e) { console.log(e) }
        finally { setLoading(false) }
    }

    const reportesFiltrados = reportes.filter(r => {
        const matchCat = !filtroCategoria || r.categoria === filtroCategoria
        const matchEst = !filtroEstado || r.estado === filtroEstado
        const matchTxt = !filtroTexto ||
            r.titulo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
            r.localidad.toLowerCase().includes(filtroTexto.toLowerCase()) ||
            r.descripcion.toLowerCase().includes(filtroTexto.toLowerCase())
        return matchCat && matchEst && matchTxt
    })

    const eliminarReporte = async (id) => {
        if (!window.confirm('¿Eliminar este reporte?')) return
        try {
            const token = localStorage.getItem('token')
            await api.delete(`/reportes/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            obtenerReportes()
        } catch (e) { alert(e.response?.data?.error || 'Error al eliminar') }
    }

    const abrirEditar = (reporte) => {
        setEditando(reporte.id)
        setForm({ titulo: reporte.titulo, descripcion: reporte.descripcion, localidad: reporte.localidad, categoria: reporte.categoria })
    }

    const guardarEdicion = async () => {
        if (!form.titulo || !form.descripcion || !form.localidad || !form.categoria) {
            alert('Completa todos los campos'); return
        }
        try {
            const token = localStorage.getItem('token')
            await api.put(`/reportes/${editando}`, form, { headers: { Authorization: `Bearer ${token}` } })
            setEditando(null)
            obtenerReportes()
        } catch (e) { alert('Error al actualizar') }
    }

    const limpiarFiltros = () => {
        setFiltroCategoria(''); setFiltroEstado(''); setFiltroTexto('')
    }

    const formatFecha = (fecha) => {
        if (!fecha) return ''
        return new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    return (
        <div className="reportes-layout">
            <Sidebar />
            <div className="reportes-container">
                <div className="reportes-content">
                    <h1 className="reportes-title">📍 Reportes Ciudadanos</h1>

                    {/* Filtros */}
                    <div className="filtros-bar">
                        <input
                            type="text"
                            placeholder="🔍 Buscar por título, localidad..."
                            value={filtroTexto}
                            onChange={e => setFiltroTexto(e.target.value)}
                            className="filtro-input"
                        />
                        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className="filtro-select">
                            <option value="">Todas las categorías</option>
                            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="filtro-select">
                            <option value="">Todos los estados</option>
                            <option value="pendiente">⏳ Pendiente</option>
                            <option value="aprobado">✅ Aprobado</option>
                            <option value="rechazado">❌ Rechazado</option>
                        </select>
                        {(filtroCategoria || filtroEstado || filtroTexto) && (
                            <button onClick={limpiarFiltros} className="filtro-limpiar">✖ Limpiar</button>
                        )}
                        <span className="filtro-contador">{reportesFiltrados.length} resultado(s)</span>
                    </div>

                    {loading && <div className="loading-box">Cargando reportes...</div>}

                    {!loading && reportesFiltrados.length === 0 && (
                        <div className="loading-box">No hay reportes con esos filtros.</div>
                    )}

                    <div className="reportes-grid">
                        {reportesFiltrados.map((reporte) => {
                            const estado = ESTADO_COLORES[reporte.estado] || ESTADO_COLORES.pendiente
                            return (
                                <div key={reporte.id} className="reporte-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                        <h2 style={{ margin: 0 }}>{reporte.titulo}</h2>
                                        <span style={{
                                            background: estado.bg, color: estado.color,
                                            padding: '4px 10px', borderRadius: '20px',
                                            fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0
                                        }}>{estado.label}</span>
                                    </div>
                                    <p className="reporte-descripcion">{reporte.descripcion}</p>
                                    <div className="reporte-info">
                                        <span className="reporte-badge">📍 {reporte.localidad}</span>
                                        <span className="reporte-badge">🏷️ {reporte.categoria}</span>
                                        <span className="reporte-badge">👤 {reporte.usuario}</span>
                                        {reporte.fecha && (
                                            <span className="reporte-badge">📅 {formatFecha(reporte.fecha)}</span>
                                        )}
                                    </div>
                                    <div className="reporte-buttons">
                                        {(usuarioActual?.id === reporte.usuario_id || usuarioActual?.rol === 'admin') ? (
                                            <>
                                                <button className="editar-btn" onClick={() => abrirEditar(reporte)}>✏️ Editar</button>
                                                <button className="eliminar-btn" onClick={() => eliminarReporte(reporte.id)}>🗑️ Eliminar</button>
                                            </>
                                        ) : (
                                            <span className="reporte-badge">🔒 Reporte de otro usuario</span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Modal editar */}
            {editando && (
                <div className="modal-overlay">
                    <div className="modal-reporte">
                        <button className="cerrar-modal" onClick={() => setEditando(null)}>✖</button>
                        <h2>✏️ Editar reporte</h2>
                        <input type="text" placeholder="Título" value={form.titulo}
                            onChange={e => setForm({ ...form, titulo: e.target.value })} />
                        <textarea placeholder="Descripción" value={form.descripcion}
                            onChange={e => setForm({ ...form, descripcion: e.target.value })} />
                        <input type="text" placeholder="Localidad" value={form.localidad}
                            onChange={e => setForm({ ...form, localidad: e.target.value })} />
                        <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                            <option value="">Categoría</option>
                            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button className="guardar-btn" onClick={guardarEdicion}>💾 Guardar cambios</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Reportes

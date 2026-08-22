import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'
import './Empresas.css'

const TIPOS_MATERIAL = ['papel', 'plastico', 'vidrio', 'metal', 'organico', 'electronico', 'textil', 'otro']

const ICONOS_MATERIAL = {
    papel: '📄', plastico: '♻️', vidrio: '🍾', metal: '🔩',
    organico: '🌱', electronico: '💻', textil: '👕', otro: '📦'
}

function Empresas() {
    const [empresas, setEmpresas] = useState([])
    const [loading, setLoading] = useState(true)
    const [filtroTipo, setFiltroTipo] = useState('')
    const [filtroTexto, setFiltroTexto] = useState('')

    useEffect(() => { obtenerEmpresas() }, [])

    const obtenerEmpresas = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const res = await api.get('/empresas', { headers: { Authorization: `Bearer ${token}` } })
            setEmpresas(res.data)
        } catch (e) { console.log(e) }
        finally { setLoading(false) }
    }

    const empresasFiltradas = empresas.filter(e => {
        const matchTipo = !filtroTipo || e.tipo_material === filtroTipo
        const matchTexto = !filtroTexto ||
            e.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
            e.localidad.toLowerCase().includes(filtroTexto.toLowerCase())
        return matchTipo && matchTexto
    })

    const limpiarFiltros = () => { setFiltroTipo(''); setFiltroTexto('') }

    return (
        <div className="empresas-layout">
            <Sidebar />
            <div className="empresas-container">
                <div className="empresas-content">
                    <h1 className="empresas-title">🏭 Directorio de Empresas Recicladoras</h1>
                    <p className="empresas-subtitle">
                        Conecta con empresas y recicladores aliados según el tipo de material que quieres reciclar.
                    </p>

                    <div className="filtros-bar">
                        <input
                            type="text"
                            placeholder="🔍 Buscar por nombre o localidad..."
                            value={filtroTexto}
                            onChange={e => setFiltroTexto(e.target.value)}
                            className="filtro-input"
                        />
                        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="filtro-select">
                            <option value="">Todos los materiales</option>
                            {TIPOS_MATERIAL.map(t => (
                                <option key={t} value={t}>{ICONOS_MATERIAL[t]} {t}</option>
                            ))}
                        </select>
                        {(filtroTipo || filtroTexto) && (
                            <button onClick={limpiarFiltros} className="filtro-limpiar">✖ Limpiar</button>
                        )}
                        <span className="filtro-contador">{empresasFiltradas.length} resultado(s)</span>
                    </div>

                    {loading && <div className="loading-box">Cargando empresas...</div>}

                    {!loading && empresasFiltradas.length === 0 && (
                        <div className="loading-box">Aún no hay empresas registradas con esos filtros.</div>
                    )}

                    <div className="empresas-grid">
                        {empresasFiltradas.map((empresa) => (
                            <div key={empresa.id} className="empresa-card">
                                <div className="empresa-icono">{ICONOS_MATERIAL[empresa.tipo_material] || '📦'}</div>
                                <h2>{empresa.nombre}</h2>
                                <span className="empresa-tipo-badge">{empresa.tipo_material}</span>
                                <div className="empresa-info">
                                    <p>📍 {empresa.direccion}, {empresa.localidad}</p>
                                    {empresa.telefono && <p>📞 {empresa.telefono}</p>}
                                    {empresa.correo_contacto && <p>✉️ {empresa.correo_contacto}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Empresas

import { useEffect, useState } from 'react'
import {
    MapContainer, TileLayer, Marker, Popup,
    useMap, useMapEvents
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

import '../styles/mapa.css'
import api from '../services/api'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
})

// Colores por categoría
const CATEGORIA_COLORES = {
    basura:        '#e74c3c',
    contaminacion: '#8e44ad',
    'zona-verde':  '#27ae60',
    reciclaje:     '#2980b9',
    otro:          '#f39c12'
}

const CATEGORIA_EMOJI = {
    basura:        '🗑️',
    contaminacion: '☣️',
    'zona-verde':  '🌳',
    reciclaje:     '♻️',
    otro:          '📌'
}

const ESTADO_BADGE = {
    pendiente: { bg: '#fff3cd', color: '#856404', label: '⏳ Pendiente' },
    aprobado:  { bg: '#d1e7dd', color: '#0f5132', label: '✅ Aprobado' },
    rechazado: { bg: '#f8d7da', color: '#842029', label: '❌ Rechazado' }
}

function crearIconoColoreado(categoria) {
    const color = CATEGORIA_COLORES[categoria] || '#555'
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 28 38">
            <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 24 14 24S28 23.33 28 14C28 6.27 21.73 0 14 0z"
                  fill="${color}" stroke="white" stroke-width="2"/>
            <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
        </svg>`
    return L.divIcon({
        html: svg,
        iconSize: [28, 38],
        iconAnchor: [14, 38],
        popupAnchor: [0, -38],
        className: ''
    })
}

function iconoUsuario() {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 28 38">
            <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 24 14 24S28 23.33 28 14C28 6.27 21.73 0 14 0z"
                  fill="#1b4332" stroke="white" stroke-width="2"/>
            <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
        </svg>`
    return L.divIcon({
        html: svg,
        iconSize: [28, 38],
        iconAnchor: [14, 38],
        popupAnchor: [0, -38],
        className: ''
    })
}

function FixMap() {
    const map = useMap()
    useEffect(() => {
        const t = setTimeout(() => map.invalidateSize(), 300)
        return () => clearTimeout(t)
    }, [map])
    return null
}

function ChangeView({ center }) {
    const map = useMap()
    useEffect(() => { if (center) map.setView(center, 16) }, [center, map])
    return null
}

function MapClickHandler({ setPosicion }) {
    useMapEvents({
        click(e) {
            setPosicion({ lat: e.latlng.lat, lng: e.latlng.lng })
        }
    })
    return null
}

function Mapa() {
    const [posicion, setPosicion] = useState(null)
    const [ubicacionUsuario, setUbicacionUsuario] = useState(null)
    const [cargandoUbicacion, setCargandoUbicacion] = useState(false)
    const [reportes, setReportes] = useState([])
    const [filtroCategoria, setFiltroCategoria] = useState('todas')
    const [busqueda, setBusqueda] = useState('')
    const [cargandoBusqueda, setCargandoBusqueda] = useState(false)

    const [form, setForm] = useState({
        titulo: '', descripcion: '', localidad: '', categoria: ''
    })

    useEffect(() => { cargarReportes() }, [])

    const cargarReportes = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await api.get('/reportes', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setReportes(res.data.filter(r => r.latitud && r.longitud))
        } catch (e) { console.log(e) }
    }

    const reportesFiltrados = reportes.filter(r =>
        filtroCategoria === 'todas' || r.categoria === filtroCategoria
    )

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
    const cerrarModal = () => setPosicion(null)

    const obtenerDireccion = async (lat, lng) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            )
            const data = await res.json()
            const a = data.address || {}
            return [a.road, a.neighbourhood, a.suburb, a.city, a.state]
                .filter(Boolean).join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        } catch { return `${lat.toFixed(4)}, ${lng.toFixed(4)}` }
    }

    const obtenerUbicacion = () => {
        if (!navigator.geolocation) { alert('Tu navegador no soporta geolocalización'); return }
        setCargandoUbicacion(true)
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude
                const lng = position.coords.longitude
                setUbicacionUsuario([lat, lng])
                setPosicion({ lat, lng })
                const direccion = await obtenerDireccion(lat, lng)
                setForm(prev => ({ ...prev, localidad: direccion }))
                setCargandoUbicacion(false)
            },
            () => { alert('No se pudo obtener tu ubicación'); setCargandoUbicacion(false) }
        )
    }

    const buscarDireccion = async () => {
        if (!busqueda.trim()) return
        setCargandoBusqueda(true)
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(busqueda)}&limit=1&countrycodes=co`
            )
            const data = await res.json()
            if (data.length > 0) {
                const lat = parseFloat(data[0].lat)
                const lng = parseFloat(data[0].lon)
                setUbicacionUsuario([lat, lng])
            } else {
                alert('No se encontró esa dirección')
            }
        } catch { alert('Error al buscar dirección') }
        finally { setCargandoBusqueda(false) }
    }

    const guardarReporte = async () => {
        if (!form.titulo || !form.descripcion || !form.localidad || !form.categoria) {
            alert('Completa todos los campos'); return
        }
        const usuario = JSON.parse(localStorage.getItem('usuario'))
        if (!usuario) { alert('No se encontró el usuario'); return }
        try {
            const token = localStorage.getItem('token')
            await api.post('/reportes', {
                titulo: form.titulo, descripcion: form.descripcion,
                localidad: form.localidad, categoria: form.categoria,
                usuario_id: usuario.id,
                latitud: posicion.lat, longitud: posicion.lng
            }, { headers: { Authorization: `Bearer ${token}` } })

            alert('✅ Reporte guardado correctamente')
            setForm({ titulo: '', descripcion: '', localidad: '', categoria: '' })
            setPosicion(null)
            cargarReportes()
        } catch (error) {
            alert(error.response?.data?.error || 'Error al guardar reporte')
        }
    }

    return (
        <>
            <div className="mapa-wrapper">
                <div className="mapa-topbar">
                    {/* Búsqueda de dirección */}
                    <div className="mapa-busqueda">
                        <input
                            type="text"
                            placeholder="🔍 Buscar dirección o barrio..."
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && buscarDireccion()}
                        />
                        <button onClick={buscarDireccion} disabled={cargandoBusqueda}>
                            {cargandoBusqueda ? '...' : 'Ir'}
                        </button>
                    </div>

                    <button className="ubicacion-btn" onClick={obtenerUbicacion}>
                        {cargandoUbicacion ? '📡 Obteniendo...' : '📍 Mi ubicación'}
                    </button>

                    {/* Filtro por categoría */}
                    <select
                        className="mapa-filtro"
                        value={filtroCategoria}
                        onChange={e => setFiltroCategoria(e.target.value)}
                    >
                        <option value="todas">🗺️ Todas las categorías</option>
                        <option value="basura">🗑️ Basura</option>
                        <option value="contaminacion">☣️ Contaminación</option>
                        <option value="zona-verde">🌳 Zona verde</option>
                        <option value="reciclaje">♻️ Reciclaje</option>
                        <option value="otro">📌 Otro</option>
                    </select>
                </div>

                {/* Leyenda */}
                <div className="mapa-leyenda">
                    {Object.entries(CATEGORIA_COLORES).map(([cat, color]) => (
                        <span key={cat} className="leyenda-item">
                            <span style={{ background: color }} className="leyenda-dot" />
                            {CATEGORIA_EMOJI[cat]} {cat}
                        </span>
                    ))}
                </div>

                <MapContainer center={[4.7110, -74.0721]} zoom={11} className="mapa-container">
                    <FixMap />
                    {ubicacionUsuario && <ChangeView center={ubicacionUsuario} />}
                    <MapClickHandler setPosicion={setPosicion} />
                    <TileLayer attribution='&copy; OpenStreetMap' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {/* Marcador de nueva posición */}
                    {posicion && <Marker position={[posicion.lat, posicion.lng]} icon={iconoUsuario()} />}

                    {/* Marcadores de reportes existentes */}
                    {reportesFiltrados.map(reporte => {
                        const estado = ESTADO_BADGE[reporte.estado] || ESTADO_BADGE.pendiente
                        return (
                            <Marker
                                key={reporte.id}
                                position={[reporte.latitud, reporte.longitud]}
                                icon={crearIconoColoreado(reporte.categoria)}
                            >
                                <Popup>
                                    <div style={{ minWidth: '200px' }}>
                                        <strong>{CATEGORIA_EMOJI[reporte.categoria]} {reporte.titulo}</strong>
                                        <p style={{ margin: '6px 0', fontSize: '13px', color: '#444' }}>
                                            {reporte.descripcion}
                                        </p>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                                            <span style={{ background: '#f0f0f0', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>
                                                📍 {reporte.localidad}
                                            </span>
                                            <span style={{ background: '#f0f0f0', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>
                                                👤 {reporte.usuario}
                                            </span>
                                        </div>
                                        <span style={{
                                            background: estado.bg, color: estado.color,
                                            padding: '2px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 600
                                        }}>
                                            {estado.label}
                                        </span>
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    })}
                </MapContainer>
            </div>

            {/* Modal nuevo reporte */}
            {posicion && (
                <div className="modal-overlay">
                    <div className="modal-reporte">
                        <button className="cerrar-modal" onClick={cerrarModal}>✖</button>
                        <h2>📍 Nuevo reporte</h2>
                        <p className="modal-ayuda">Completa la información del reporte ambiental.</p>

                        <input type="text" name="titulo" placeholder="Título del reporte"
                            value={form.titulo} onChange={handleChange} />
                        <textarea name="descripcion" placeholder="Describe el problema..."
                            value={form.descripcion} onChange={handleChange} />
                        <input type="text" name="localidad" placeholder="Localidad (automático)"
                            value={form.localidad} onChange={handleChange} />
                        <select name="categoria" value={form.categoria} onChange={handleChange}>
                            <option value="">Selecciona categoría</option>
                            <option value="basura">🗑️ Basura</option>
                            <option value="contaminacion">☣️ Contaminación</option>
                            <option value="zona-verde">🌳 Zona verde</option>
                            <option value="reciclaje">♻️ Reciclaje</option>
                            <option value="otro">📌 Otro</option>
                        </select>
                        <button className="guardar-btn" onClick={guardarReporte}>Guardar reporte</button>
                    </div>
                </div>
            )}
        </>
    )
}

export default Mapa

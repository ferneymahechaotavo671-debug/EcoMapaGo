import { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import api from '../../services/api'
import '../../styles/admin.css'

function AdminUsuarios() {
    const [usuarios, setUsuarios] = useState([])
    const [busqueda, setBusqueda] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => { obtenerUsuarios() }, [])

    const obtenerUsuarios = async () => {
        setLoading(true)
        const token = localStorage.getItem('token')
        try {
            const res = await api.get('/usuarios', { headers: { Authorization: `Bearer ${token}` } })
            setUsuarios(res.data)
        } catch (e) { console.log(e) }
        finally { setLoading(false) }
    }

    const cambiarRol = async (id, nuevoRol) => {
        const token = localStorage.getItem('token')
        try {
            await api.put(`/usuarios/${id}/rol`, { rol: nuevoRol }, { headers: { Authorization: `Bearer ${token}` } })
            setUsuarios(prev => prev.map(u => u.id === id ? { ...u, rol: nuevoRol } : u))
        } catch (e) {
            alert('No se pudo cambiar el rol. Verifica que el endpoint exista en el backend.')
        }
    }

    const eliminarUsuario = async (id, nombre) => {
        if (!window.confirm(`¿Eliminar al usuario "${nombre}"? Esta acción no se puede deshacer.`)) return
        const token = localStorage.getItem('token')
        try {
            await api.delete(`/usuarios/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            setUsuarios(prev => prev.filter(u => u.id !== id))
        } catch (e) {
            alert('No se pudo eliminar el usuario.')
        }
    }

    const usuarioActual = JSON.parse(localStorage.getItem('usuario') || '{}')

    const usuariosFiltrados = usuarios.filter(u =>
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.correo.toLowerCase().includes(busqueda.toLowerCase())
    )

    return (
        <div className="admin-layout">
            <Sidebar />
            <div className="admin-container">
                <div className="admin-content">
                    <h1 className="admin-title">👥 Gestión de Usuarios</h1>

                    <input
                        type="text"
                        placeholder="🔍 Buscar por nombre o correo..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        style={{
                            width: '100%', maxWidth: '400px', padding: '11px 16px',
                            border: '1.5px solid #d1d5db', borderRadius: '12px',
                            fontSize: '14px', marginBottom: '24px', outline: 'none', boxSizing: 'border-box'
                        }}
                    />

                    {loading && <div style={{ color: '#64748b', padding: '20px' }}>Cargando usuarios...</div>}

                    <div className="usuarios-tabla">
                        {usuariosFiltrados.map(usuario => (
                            <div key={usuario.id} className="usuario-fila">
                                <div className="usuario-avatar">
                                    {usuario.nombre.charAt(0).toUpperCase()}
                                </div>
                                <div className="usuario-info">
                                    <strong>{usuario.nombre}</strong>
                                    <span>{usuario.correo}</span>
                                </div>
                                <div className="usuario-acciones">
                                    <select
                                        value={usuario.rol}
                                        onChange={e => cambiarRol(usuario.id, e.target.value)}
                                        disabled={usuario.id === usuarioActual.id}
                                        className={`rol-select rol-${usuario.rol}`}
                                    >
                                        <option value="usuario">usuario</option>
                                        <option value="admin">admin</option>
                                    </select>
                                    {usuario.id !== usuarioActual.id && (
                                        <button
                                            className="eliminar-usuario-btn"
                                            onClick={() => eliminarUsuario(usuario.id, usuario.nombre)}
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {!loading && usuariosFiltrados.length === 0 && (
                        <div style={{ color: '#64748b', padding: '20px' }}>No se encontraron usuarios.</div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AdminUsuarios

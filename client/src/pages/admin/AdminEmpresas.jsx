import { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import api from '../../services/api'
import '../../styles/admin.css'

const TIPOS_MATERIAL = ['papel', 'plastico', 'vidrio', 'metal', 'organico', 'electronico', 'textil', 'otro']

const FORM_VACIO = {
    nombre: '', tipo_material: '', direccion: '', localidad: '',
    telefono: '', correo_contacto: ''
}

function AdminEmpresas() {
    const [empresas, setEmpresas] = useState([])
    const [form, setForm] = useState(FORM_VACIO)
    const [editandoId, setEditandoId] = useState(null)

    useEffect(() => { obtenerEmpresas() }, [])

    const obtenerEmpresas = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await api.get('/empresas', { headers: { Authorization: `Bearer ${token}` } })
            setEmpresas(res.data)
        } catch (error) { console.log(error) }
    }

    const guardarEmpresa = async () => {
        if (!form.nombre || !form.tipo_material || !form.direccion || !form.localidad) {
            alert('Completa los campos obligatorios: nombre, tipo de material, dirección y localidad')
            return
        }
        try {
            const token = localStorage.getItem('token')
            if (editandoId) {
                await api.put(`/empresas/${editandoId}`, form, { headers: { Authorization: `Bearer ${token}` } })
                alert('Empresa actualizada correctamente')
            } else {
                await api.post('/empresas', form, { headers: { Authorization: `Bearer ${token}` } })
                alert('Empresa registrada correctamente')
            }
            setForm(FORM_VACIO)
            setEditandoId(null)
            obtenerEmpresas()
        } catch (error) {
            console.log(error)
            alert('Error al guardar la empresa')
        }
    }

    const editarEmpresa = (empresa) => {
        setEditandoId(empresa.id)
        setForm({
            nombre: empresa.nombre,
            tipo_material: empresa.tipo_material,
            direccion: empresa.direccion,
            localidad: empresa.localidad,
            telefono: empresa.telefono || '',
            correo_contacto: empresa.correo_contacto || ''
        })
    }

    const cancelarEdicion = () => {
        setEditandoId(null)
        setForm(FORM_VACIO)
    }

    const eliminarEmpresa = async (id) => {
        const confirmar = window.confirm('¿Deseas eliminar esta empresa del directorio?')
        if (!confirmar) return
        try {
            const token = localStorage.getItem('token')
            await api.delete(`/empresas/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            alert('Empresa eliminada')
            obtenerEmpresas()
        } catch (error) { console.log(error) }
    }

    return (
        <div className="admin-layout">
            <Sidebar />
            <div className="admin-container">
                <div className="admin-content">
                    <h1 className="admin-title">🏭 Gestionar Empresas Recicladoras</h1>

                    <div className="admin-form-card">
                        <h2>{editandoId ? 'Editar Empresa' : 'Registrar Nueva Empresa'}</h2>
                        <p className="admin-subtitle">
                            Estas empresas aparecerán en el directorio que ven los ciudadanos.
                        </p>

                        <input
                            type="text"
                            placeholder="Nombre de la empresa"
                            value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        />

                        <select
                            value={form.tipo_material}
                            onChange={(e) => setForm({ ...form, tipo_material: e.target.value })}
                        >
                            <option value="">Tipo de material que recibe</option>
                            {TIPOS_MATERIAL.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>

                        <input
                            type="text"
                            placeholder="Dirección"
                            value={form.direccion}
                            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                        />

                        <input
                            type="text"
                            placeholder="Localidad"
                            value={form.localidad}
                            onChange={(e) => setForm({ ...form, localidad: e.target.value })}
                        />

                        <input
                            type="text"
                            placeholder="Teléfono (opcional)"
                            value={form.telefono}
                            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                        />

                        <input
                            type="text"
                            placeholder="Correo de contacto (opcional)"
                            value={form.correo_contacto}
                            onChange={(e) => setForm({ ...form, correo_contacto: e.target.value })}
                        />

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="admin-primary-btn" onClick={guardarEmpresa}>
                                {editandoId ? '💾 Guardar cambios' : '➕ Registrar Empresa'}
                            </button>
                            {editandoId && (
                                <button className="admin-danger-btn" onClick={cancelarEdicion}>
                                    ✖ Cancelar
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="admin-grid">
                        {empresas.map((empresa) => (
                            <div className="admin-card" key={empresa.id}>
                                <h2>{empresa.nombre}</h2>
                                <p><strong>Material:</strong> {empresa.tipo_material}</p>
                                <p>📍 {empresa.direccion}, {empresa.localidad}</p>
                                {empresa.telefono && <p>📞 {empresa.telefono}</p>}
                                {empresa.correo_contacto && <p>✉️ {empresa.correo_contacto}</p>}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="admin-primary-btn" onClick={() => editarEmpresa(empresa)}>
                                        ✏️ Editar
                                    </button>
                                    <button className="admin-danger-btn" onClick={() => eliminarEmpresa(empresa.id)}>
                                        🗑️ Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminEmpresas

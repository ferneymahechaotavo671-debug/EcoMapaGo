import { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import api from '../../services/api'
import '../../styles/admin.css'

const FORM_VACIO = { empresa_id: '', titulo: '', descripcion: '', costo_puntos: '' }

function AdminBeneficios() {
    const [beneficios, setBeneficios] = useState([])
    const [empresas, setEmpresas] = useState([])
    const [form, setForm] = useState(FORM_VACIO)
    const [editandoId, setEditandoId] = useState(null)

    useEffect(() => { cargarTodo() }, [])

    const cargarTodo = async () => {
        const token = localStorage.getItem('token')
        const headers = { Authorization: `Bearer ${token}` }
        try {
            const [resBeneficios, resEmpresas] = await Promise.all([
                api.get('/beneficios', { headers }),
                api.get('/empresas', { headers })
            ])
            setBeneficios(resBeneficios.data)
            setEmpresas(resEmpresas.data)
        } catch (error) { console.log(error) }
    }

    const guardarBeneficio = async () => {
        if (!form.empresa_id || !form.titulo || !form.costo_puntos) {
            alert('Completa empresa, título y costo en puntos')
            return
        }
        try {
            const token = localStorage.getItem('token')
            const headers = { Authorization: `Bearer ${token}` }
            const payload = { ...form, costo_puntos: parseInt(form.costo_puntos, 10) }

            if (editandoId) {
                await api.put(`/beneficios/${editandoId}`, payload, { headers })
                alert('Beneficio actualizado correctamente')
            } else {
                await api.post('/beneficios', payload, { headers })
                alert('Beneficio creado correctamente')
            }
            setForm(FORM_VACIO)
            setEditandoId(null)
            cargarTodo()
        } catch (error) {
            alert(error.response?.data?.error || 'Error al guardar el beneficio')
        }
    }

    const editarBeneficio = (b) => {
        setEditandoId(b.id)
        setForm({
            empresa_id: b.empresa_id,
            titulo: b.titulo,
            descripcion: b.descripcion || '',
            costo_puntos: b.costo_puntos
        })
    }

    const cancelarEdicion = () => {
        setEditandoId(null)
        setForm(FORM_VACIO)
    }

    const eliminarBeneficio = async (id) => {
        if (!window.confirm('¿Eliminar este beneficio?')) return
        try {
            const token = localStorage.getItem('token')
            await api.delete(`/beneficios/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            cargarTodo()
        } catch (error) {
            alert(error.response?.data?.error || 'Error al eliminar')
        }
    }

    return (
        <div className="admin-layout">
            <Sidebar />
            <div className="admin-container">
                <div className="admin-content">
                    <h1 className="admin-title">🎁 Gestionar Beneficios</h1>

                    <div className="admin-form-card">
                        <h2>{editandoId ? 'Editar Beneficio' : 'Crear Nuevo Beneficio'}</h2>
                        <p className="admin-subtitle">
                            Los beneficios se asocian a una empresa del directorio y los usuarios los canjean con sus puntos.
                        </p>

                        <select
                            value={form.empresa_id}
                            onChange={(e) => setForm({ ...form, empresa_id: e.target.value })}
                        >
                            <option value="">Selecciona una empresa</option>
                            {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                        </select>

                        <input
                            type="text"
                            placeholder="Título del beneficio (ej: 10% de descuento)"
                            value={form.titulo}
                            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                        />

                        <textarea
                            placeholder="Descripción (opcional)"
                            value={form.descripcion}
                            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                        />

                        <input
                            type="number"
                            min="1"
                            placeholder="Costo en puntos"
                            value={form.costo_puntos}
                            onChange={(e) => setForm({ ...form, costo_puntos: e.target.value })}
                        />

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="admin-primary-btn" onClick={guardarBeneficio}>
                                {editandoId ? '💾 Guardar cambios' : '➕ Crear Beneficio'}
                            </button>
                            {editandoId && (
                                <button className="admin-danger-btn" onClick={cancelarEdicion}>✖ Cancelar</button>
                            )}
                        </div>
                    </div>

                    <div className="admin-grid">
                        {beneficios.map((b) => (
                            <div className="admin-card" key={b.id}>
                                <h2>{b.titulo}</h2>
                                <p><strong>Empresa:</strong> {b.empresa_nombre}</p>
                                <p><strong>Costo:</strong> 🏆 {b.costo_puntos} puntos</p>
                                {b.descripcion && <p>{b.descripcion}</p>}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="admin-primary-btn" onClick={() => editarBeneficio(b)}>✏️ Editar</button>
                                    <button className="admin-danger-btn" onClick={() => eliminarBeneficio(b.id)}>🗑️ Eliminar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminBeneficios

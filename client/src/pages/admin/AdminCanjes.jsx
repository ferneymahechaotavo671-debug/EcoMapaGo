import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import api from '../../services/api'
import '../../styles/admin.css'
import './AdminCanjes.css'

function AdminCanjes() {
    const [codigo, setCodigo] = useState('')
    const [resultado, setResultado] = useState(null)
    const [buscando, setBuscando] = useState(false)
    const [marcando, setMarcando] = useState(false)

    const buscar = async () => {
        if (!codigo.trim()) return
        setBuscando(true)
        setResultado(null)
        try {
            const res = await api.get(`/canjes/verificar/${codigo.trim().toUpperCase()}`)
            setResultado(res.data)
        } catch (e) {
            setResultado({ valido: false, error: 'No se pudo verificar el código' })
        } finally {
            setBuscando(false)
        }
    }

    const marcarUsado = async () => {
        if (!window.confirm('¿Confirmas que este beneficio ya fue entregado/aplicado?')) return
        setMarcando(true)
        try {
            const token = localStorage.getItem('token')
            await api.put(`/canjes/${codigo.trim().toUpperCase()}/marcar-usado`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            buscar()
        } catch (e) {
            alert(e.response?.data?.error || 'Error al marcar el canje como usado')
        } finally {
            setMarcando(false)
        }
    }

    return (
        <div className="admin-layout">
            <Sidebar />
            <div className="admin-container">
                <div className="admin-content">
                    <h1 className="admin-title">🎟️ Verificar Canjes</h1>

                    <div className="admin-form-card">
                        <h2>Buscar código de canje</h2>
                        <p className="admin-subtitle">
                            Pide al usuario el código que le dio la app al canjear (formato ECO-XXXXXXXX) y verifícalo aquí.
                        </p>

                        <div className="canje-buscador">
                            <input
                                type="text"
                                placeholder="ECO-XXXXXXXX"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && buscar()}
                            />
                            <button className="admin-primary-btn" onClick={buscar} disabled={buscando}>
                                {buscando ? 'Buscando...' : '🔍 Verificar'}
                            </button>
                        </div>

                        {resultado && !resultado.valido && (
                            <div className="canje-resultado canje-invalido">
                                ⚠️ {resultado.error}
                            </div>
                        )}

                        {resultado && resultado.valido && (
                            <div className={`canje-resultado ${resultado.usado ? 'canje-usado' : 'canje-vigente'}`}>
                                <p><strong>Beneficio:</strong> {resultado.beneficio_titulo}</p>
                                <p><strong>Empresa:</strong> {resultado.empresa_nombre}</p>
                                <p><strong>Fecha del canje:</strong> {resultado.fecha}</p>
                                <p className="canje-estado-texto">
                                    {resultado.usado ? '✔ Este código ya fue usado' : '⏳ Código vigente, aún no se ha usado'}
                                </p>

                                {!resultado.usado && (
                                    <button className="admin-primary-btn" onClick={marcarUsado} disabled={marcando}>
                                        {marcando ? 'Marcando...' : '✅ Marcar como entregado / usado'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminCanjes

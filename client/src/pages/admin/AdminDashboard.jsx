import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import api from '../../services/api'
import '../../styles/admin.css'

function AdminDashboard() {
    const [stats, setStats] = useState({ reportes: 0, usuarios: 0, noticias: 0 })
    const [porEstado, setPorEstado] = useState({ pendiente: 0, aprobado: 0, rechazado: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => { cargarStats() }, [])

    const cargarStats = async () => {
        const token = localStorage.getItem('token')
        try {
            const [r1, r2, r3] = await Promise.all([
                api.get('/reportes', { headers: { Authorization: `Bearer ${token}` } }),
                api.get('/usuarios', { headers: { Authorization: `Bearer ${token}` } }),
                api.get('/noticias')
            ])
            const reportes = r1.data
            setStats({ reportes: reportes.length, usuarios: r2.data.length, noticias: r3.data.length })
            setPorEstado({
                pendiente: reportes.filter(r => r.estado === 'pendiente').length,
                aprobado:  reportes.filter(r => r.estado === 'aprobado').length,
                rechazado: reportes.filter(r => r.estado === 'rechazado').length
            })
        } catch (e) { console.log(e) }
        finally { setLoading(false) }
    }

    const cards = [
        { label: 'Reportes totales', value: stats.reportes, icon: '📍', color: '#2d6a4f', link: '/admin/reportes' },
        { label: 'Usuarios registrados', value: stats.usuarios, icon: '👥', color: '#1d4ed8', link: '/admin/usuarios' },
        { label: 'Noticias publicadas', value: stats.noticias, icon: '📰', color: '#7c3aed', link: '/admin/noticias' },
    ]

    const estadoCards = [
        { label: 'Pendientes', value: porEstado.pendiente, bg: '#fff3cd', color: '#856404' },
        { label: 'Aprobados',  value: porEstado.aprobado,  bg: '#d1e7dd', color: '#0f5132' },
        { label: 'Rechazados', value: porEstado.rechazado, bg: '#f8d7da', color: '#842029' },
    ]

    return (
        <div className="admin-layout">
            <Sidebar />
            <div className="admin-container">
                <div className="admin-content">
                    <h1 className="admin-title">👨‍💼 Panel Administrativo</h1>
                    <p style={{ color: '#64748b', marginBottom: '28px' }}>
                        Resumen general del sistema EcoMapaGo
                    </p>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Cargando estadísticas...</div>
                    ) : (
                        <>
                            {/* Stats principales */}
                            <div className="admin-grid" style={{ marginBottom: '24px' }}>
                                {cards.map(card => (
                                    <Link key={card.label} to={card.link} style={{ textDecoration: 'none' }}>
                                        <div className="admin-card admin-stat-card">
                                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{card.icon}</div>
                                            <div style={{ fontSize: '36px', fontWeight: '800', color: card.color }}>
                                                {card.value}
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                                                {card.label}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Reportes por estado */}
                            <h2 style={{ fontSize: '16px', color: '#1b4332', marginBottom: '14px' }}>
                                📊 Reportes por estado
                            </h2>
                            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                                {estadoCards.map(e => (
                                    <div key={e.label} style={{
                                        background: e.bg, color: e.color,
                                        padding: '18px 28px', borderRadius: '14px',
                                        minWidth: '130px', textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '28px', fontWeight: '800' }}>{e.value}</div>
                                        <div style={{ fontSize: '13px', fontWeight: '600', marginTop: '4px' }}>{e.label}</div>
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

export default AdminDashboard

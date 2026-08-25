import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import './Sidebar.css'

function Sidebar() {
    const navigate = useNavigate()
    const location = useLocation()
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
    const [abierto, setAbierto] = useState(false)

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        navigate('/')
    }

    const isActive = (path) => location.pathname === path ? 'sidebar-link active' : 'sidebar-link'
    const isAdmin = usuario?.rol === 'admin'
    const cerrarMenu = () => setAbierto(false)

    return (
        <>
            {!abierto && (
                <button
                    className="sidebar-hamburguesa"
                    onClick={() => setAbierto(true)}
                    aria-label="Abrir menú"
                >
                    ☰
                </button>
            )}

            {abierto && <div className="sidebar-overlay" onClick={cerrarMenu}></div>}

            <div className={`sidebar ${abierto ? 'sidebar-abierta' : ''}`}>
                <div className="sidebar-logo">
                    <span>🌍 EcoMapaGo</span>
                    <button
                        className="sidebar-cerrar-btn"
                        onClick={cerrarMenu}
                        aria-label="Cerrar menú"
                    >
                        ✖
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/dashboard" className={isActive('/dashboard')} onClick={cerrarMenu}>🏠 Inicio</Link>
                    <Link to="/reportes" className={isActive('/reportes')} onClick={cerrarMenu}>📍 Reportes</Link>
                    <Link to="/noticias" className={isActive('/noticias')} onClick={cerrarMenu}>📰 Noticias</Link>
                    <Link to="/empresas" className={isActive('/empresas')} onClick={cerrarMenu}>🏭 Empresas</Link>
                    <Link to="/metricas" className={isActive('/metricas')} onClick={cerrarMenu}>📊 Impacto</Link>
                    <Link to="/perfil" className={isActive('/perfil')} onClick={cerrarMenu}>👤 Perfil</Link>

                    {isAdmin && (
                        <>
                            <div className="sidebar-divider">Admin</div>
                            <Link to="/admin" className={isActive('/admin')} onClick={cerrarMenu}>👨‍💼 Panel Admin</Link>
                            <Link to="/admin/reportes" className={isActive('/admin/reportes')} onClick={cerrarMenu}>📍 Gestionar Reportes</Link>
                            <Link to="/admin/noticias" className={isActive('/admin/noticias')} onClick={cerrarMenu}>📰 Gestionar Noticias</Link>
                            <Link to="/admin/empresas" className={isActive('/admin/empresas')} onClick={cerrarMenu}>🏭 Gestionar Empresas</Link>
                            <Link to="/admin/usuarios" className={isActive('/admin/usuarios')} onClick={cerrarMenu}>👥 Usuarios</Link>
                        </>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <span className="sidebar-user">👤 {usuario?.nombre}</span>
                    <button className="logout-btn" onClick={logout}>
                        🚪 Cerrar sesión
                    </button>
                </div>
            </div>
        </>
    )
}

export default Sidebar

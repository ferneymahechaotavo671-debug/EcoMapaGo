import { Link, useNavigate, useLocation } from 'react-router-dom'
import './Sidebar.css'

function Sidebar() {
    const navigate = useNavigate()
    const location = useLocation()
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        navigate('/')
    }

    const isActive = (path) => location.pathname === path ? 'sidebar-link active' : 'sidebar-link'
    const isAdmin = usuario?.rol === 'admin'

    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                🌍 EcoMapaGo
            </div>

            <nav className="sidebar-nav">
                <Link to="/dashboard" className={isActive('/dashboard')}>🏠 Inicio</Link>
                <Link to="/reportes" className={isActive('/reportes')}>📍 Reportes</Link>
                <Link to="/noticias" className={isActive('/noticias')}>📰 Noticias</Link>
                <Link to="/empresas" className={isActive('/empresas')}>🏭 Empresas</Link>
                <Link to="/metricas" className={isActive('/metricas')}>📊 Impacto</Link>
                <Link to="/perfil" className={isActive('/perfil')}>👤 Perfil</Link>

                {isAdmin && (
                    <>
                        <div className="sidebar-divider">Admin</div>
                        <Link to="/admin" className={isActive('/admin')}>👨‍💼 Panel Admin</Link>
                        <Link to="/admin/reportes" className={isActive('/admin/reportes')}>📍 Gestionar Reportes</Link>
                        <Link to="/admin/noticias" className={isActive('/admin/noticias')}>📰 Gestionar Noticias</Link>
                        <Link to="/admin/empresas" className={isActive('/admin/empresas')}>🏭 Gestionar Empresas</Link>
                        <Link to="/admin/usuarios" className={isActive('/admin/usuarios')}>👥 Usuarios</Link>
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
    )
}

export default Sidebar

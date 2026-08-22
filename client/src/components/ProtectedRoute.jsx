import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children, soloAdmin = false }) {
    const token = localStorage.getItem('token')
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')

    if (!token || !usuario) {
        return <Navigate to="/" replace />
    }

    if (soloAdmin && usuario.rol !== 'admin') {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

export default ProtectedRoute

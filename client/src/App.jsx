import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Reportes from "./pages/Reportes"
import Noticias from "./pages/Noticias"
import Empresas from "./pages/Empresas"
import Metricas from "./pages/Metricas"
import Perfil from "./pages/Perfil"
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminNoticias from './pages/admin/AdminNoticias'
import AdminReportes from './pages/admin/AdminReportes'
import AdminUsuarios from './pages/admin/AdminUsuarios'
import AdminEmpresas from './pages/admin/AdminEmpresas'
import AdminBeneficios from './pages/admin/AdminBeneficios'
import AdminCanjes from './pages/admin/AdminCanjes'
import Beneficios from './pages/Beneficios'
import GenerarCertificado from './pages/GenerarCertificado'
import Certificado from './pages/Certificado'
import Registro from "./pages/Registro"
import RecuperarPassword from "./pages/RecuperarPassword"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Públicas */}
                <Route path="/" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/recuperar-password" element={<RecuperarPassword />} />
                <Route path="/verificar/:codigo" element={<Certificado />} />

                {/* Protegidas - usuario autenticado */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/reportes" element={<ProtectedRoute><Reportes /></ProtectedRoute>} />
                <Route path="/noticias" element={<ProtectedRoute><Noticias /></ProtectedRoute>} />
                <Route path="/empresas" element={<ProtectedRoute><Empresas /></ProtectedRoute>} />
                <Route path="/beneficios" element={<ProtectedRoute><Beneficios /></ProtectedRoute>} />
                <Route path="/metricas" element={<ProtectedRoute><Metricas /></ProtectedRoute>} />
                <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
                <Route path="/certificado" element={<ProtectedRoute><GenerarCertificado /></ProtectedRoute>} />

                {/* Protegidas - solo admin */}
                <Route path="/admin" element={<ProtectedRoute soloAdmin><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/noticias" element={<ProtectedRoute soloAdmin><AdminNoticias /></ProtectedRoute>} />
                <Route path="/admin/reportes" element={<ProtectedRoute soloAdmin><AdminReportes /></ProtectedRoute>} />
                <Route path="/admin/usuarios" element={<ProtectedRoute soloAdmin><AdminUsuarios /></ProtectedRoute>} />
                <Route path="/admin/empresas" element={<ProtectedRoute soloAdmin><AdminEmpresas /></ProtectedRoute>} />
                <Route path="/admin/beneficios" element={<ProtectedRoute soloAdmin><AdminBeneficios /></ProtectedRoute>} />
                <Route path="/admin/canjes" element={<ProtectedRoute soloAdmin><AdminCanjes /></ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
    )
}

export default App

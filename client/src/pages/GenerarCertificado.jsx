import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../services/api'
import './Certificado.css'

function GenerarCertificado() {
    const navigate = useNavigate()
    const [generando, setGenerando] = useState(false)

    const generar = async () => {
        setGenerando(true)
        try {
            const token = localStorage.getItem('token')
            const res = await api.post('/certificados/generar', {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            navigate(`/verificar/${res.data.codigo}`)
        } catch (e) {
            alert(e.response?.data?.error || 'Error al generar el certificado')
        } finally {
            setGenerando(false)
        }
    }

    return (
        <div className="cert-generar-layout">
            <Sidebar />
            <div className="cert-generar-container">
                <div className="cert-generar-card">
                    <span className="cert-generar-icono">📜</span>
                    <h1>Certificado de impacto ambiental</h1>
                    <p>
                        Genera tu certificado oficial de EcoMapaGo con tus puntos y nivel actual.
                        Cada certificado tiene un código único que cualquiera puede verificar públicamente.
                    </p>
                    <button className="cert-generar-btn" onClick={generar} disabled={generando}>
                        {generando ? 'Generando...' : '📜 Generar mi certificado'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GenerarCertificado

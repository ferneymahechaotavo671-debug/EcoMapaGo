import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import './Certificado.css'

function Certificado() {
    const { codigo } = useParams()
    const [datos, setDatos] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get(`/certificados/verificar/${codigo}`)
            .then(res => setDatos(res.data))
            .catch(() => setDatos({ valido: false, error: 'No se pudo verificar el certificado' }))
            .finally(() => setLoading(false))
    }, [codigo])

    if (loading) {
        return <div className="cert-estado-carga">Verificando certificado...</div>
    }

    if (!datos?.valido) {
        return (
            <div className="cert-invalido">
                <span className="cert-invalido-icono">⚠️</span>
                <h2>Certificado no válido</h2>
                <p>{datos?.error || 'Este código no corresponde a ningún certificado emitido.'}</p>
            </div>
        )
    }

    return (
        <div className="cert-pagina">
            <div className="cert-documento">
                <div className="cert-header">
                    <span className="cert-logo">🌍 EcoMapaGo</span>
                    <span className="cert-badge-valido">✔ Certificado verificado</span>
                </div>

                <p className="cert-otorga">Este certificado se otorga a</p>
                <h1 className="cert-nombre">{datos.nombre}</h1>
                <p className="cert-texto">
                    por su contribución activa al cuidado del medio ambiente a través de la plataforma
                    EcoMapaGo, alcanzando el nivel
                </p>
                <p className="cert-nivel">{datos.nivel}</p>
                <p className="cert-texto">con un total de</p>
                <p className="cert-puntos">{datos.puntos} puntos de impacto ambiental</p>

                <div className="cert-footer">
                    <div>
                        <p className="cert-footer-label">Fecha de emisión</p>
                        <p className="cert-footer-valor">{datos.fecha}</p>
                    </div>
                    <div>
                        <p className="cert-footer-label">Código de verificación</p>
                        <p className="cert-footer-valor cert-codigo">{codigo}</p>
                    </div>
                </div>

                <p className="cert-verificacion-nota">
                    Este documento puede verificarse en cualquier momento en ecomapago.onrender.com/verificar/{codigo}
                </p>

                <button className="cert-imprimir-btn no-imprimir" onClick={() => window.print()}>
                    🖨️ Descargar / Imprimir certificado
                </button>
            </div>
        </div>
    )
}

export default Certificado

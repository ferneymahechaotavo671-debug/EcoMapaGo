import { useEffect, useState } from 'react'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import './Noticias.css'

function Noticias() {
    const [noticias, setNoticias] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { obtenerNoticias() }, [])

    const obtenerNoticias = async () => {
        try {
            const res = await api.get('/noticias')
            setNoticias(res.data)
        } catch (e) { console.log(e) }
        finally { setLoading(false) }
    }

    const formatFecha = (fecha) => {
        if (!fecha) return ''
        return new Date(fecha).toLocaleDateString('es-CO', {
            day: '2-digit', month: 'long', year: 'numeric'
        })
    }

    return (
        <div className="noticias-layout">
            <Sidebar />
            <div className="noticias-container">
                <div className="noticias-content">
                    <h1 className="noticias-title">📰 Noticias Ambientales</h1>
                    <p className="noticias-subtitle">
                        Mantente informado sobre novedades ecológicas, reciclaje, contaminación y acciones ambientales.
                    </p>

                    {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Cargando noticias...</div>}

                    {!loading && noticias.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                            No hay noticias publicadas aún.
                        </div>
                    )}

                    <div className="noticias-grid">
                        {noticias.map((noticia) => (
                            <div key={noticia.id} className="noticia-card">
                                {noticia.imagen && (
                                    <img
                                        src={noticia.imagen}
                                        alt={noticia.titulo}
                                        className="noticia-img"
                                        onError={e => { e.target.style.display = 'none' }}
                                    />
                                )}
                                <div className="noticia-body">
                                    <h2>{noticia.titulo}</h2>
                                    <p>{noticia.descripcion}</p>
                                    {noticia.fecha && (
                                        <span className="noticia-fecha">📅 {formatFecha(noticia.fecha)}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Noticias

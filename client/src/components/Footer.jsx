import './Footer.css'

const ANIO = new Date().getFullYear()

// Enlaces del pie. Cuando tengas la página real, pon su dirección en "url" (ej. "/privacidad"
// o "https://…"). Mientras tanto se muestran como texto, sin enlace roto.
const ENLACES = [
    { texto: 'Términos', url: null },
    { texto: 'Privacidad', url: null },
    { texto: 'Seguridad', url: null },
    { texto: 'Estado', url: null },
    { texto: 'Comunidad', url: null },
    { texto: 'Docs', url: null },
    { texto: 'Contacto', url: null },
    { texto: 'Gestionar cookies', url: null },
    { texto: 'No compartas mi información personal', url: null },
]

function Footer({ conMenu = false }) {
    return (
        <footer className={`app-footer ${conMenu ? 'app-footer-con-menu' : ''}`}>
            <div className="app-footer-inner">
                <p className="app-footer-copy">🌍 © {ANIO} EcoMapaGo</p>

                <nav aria-label="Navegación a pie">
                    <ul className="app-footer-links">
                        {ENLACES.map((e) => (
                            <li key={e.texto}>
                                {e.url ? (
                                    <a href={e.url} target="_blank" rel="noopener noreferrer">{e.texto}</a>
                                ) : (
                                    <span>{e.texto}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </footer>
    )
}

export default Footer

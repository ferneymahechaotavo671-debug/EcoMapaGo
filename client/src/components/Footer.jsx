import './Footer.css'

const ANIO = new Date().getFullYear()

function Footer({ conMenu = false }) {
    return (
        <footer className={`app-footer ${conMenu ? 'app-footer-con-menu' : ''}`}>
            <div className="app-footer-contenido">
                <div className="app-footer-marca">
                    <span className="app-footer-logo">🌍 EcoMapaGo</span>
                    <p>Reciclaje ciudadano y economía circular.</p>
                </div>

                <div className="app-footer-info">
                    <span>Proyecto Integrador · Fundación Universitaria San Mateo</span>
                    <span className="app-footer-seguridad">🔒 Conexión cifrada</span>
                </div>
            </div>

            <div className="app-footer-legal">© {ANIO} EcoMapaGo</div>
        </footer>
    )
}

export default Footer

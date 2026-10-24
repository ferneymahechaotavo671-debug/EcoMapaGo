from dotenv import load_dotenv
load_dotenv()  # Debe ser lo primero antes de cualquier import de la app

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix
import os
import logging

from app.extensions import limiter
from app.routes.usuario_routes import usuario_bp
from app.routes.protegido_routes import protegido_bp
from app.routes.reporte_routes import reporte_bp
from app.routes.noticia_routes import noticia_bp
from app.routes.empresa_routes import empresa_bp
from app.routes.metrica_routes import metrica_bp
from app.routes.beneficio_routes import beneficio_bp
from app.routes.certificado_routes import certificado_bp
from app.routes.dosfa_routes import dosfa_bp

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

app = Flask(__name__)

# Render coloca un proxy delante de la app: sin esto, request.remote_addr siempre es 127.0.0.1
# y el rate limiting trataría a TODOS los usuarios como una sola persona.
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

# Orígenes permitidos: tu frontend en Render + entorno de desarrollo local.
# FRONTEND_URL admite varias URLs separadas por coma (Render > Environment).
# La primera es la "principal" (se usa para armar enlaces, p. ej. recuperar contraseña).
_frontends = [u.strip().rstrip("/") for u in os.getenv("FRONTEND_URL", "https://ecomapago.onrender.com").split(",") if u.strip()]
app.config['FRONTEND_URL'] = _frontends[0]

origenes_permitidos = ["http://localhost:5173"] + _frontends
CORS(
    app,
    resources={r"/*": {"origins": origenes_permitidos}},
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    max_age=600,
)

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
if not app.config['SECRET_KEY']:
    raise RuntimeError(
        "La variable de entorno SECRET_KEY es obligatoria y no está configurada. "
        "Defínela en tu archivo .env (desarrollo local) o en las variables de entorno "
        "de Render (producción) antes de iniciar la aplicación."
    )

if not os.getenv('ENCRYPTION_KEY'):
    raise RuntimeError(
        "La variable de entorno ENCRYPTION_KEY es obligatoria y no está configurada. "
        "Se usa para cifrar el secreto de la verificación en dos pasos (2FA) en la base de datos. "
        "Genera una con: python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\" "
        "y defínela en tu .env local o en las variables de entorno de Render."
    )

limiter.init_app(app)

# Límite de tamaño de peticiones (imágenes en base64 incluidas). 4MB es suficiente
# para una foto de noticia o un logo razonable sin comprometer el servidor.
app.config['MAX_CONTENT_LENGTH'] = 4 * 1024 * 1024


@app.errorhandler(413)
def imagen_demasiado_grande(e):
    return jsonify({"error": "La imagen es demasiado pesada. Máximo 4MB."}), 413


@app.errorhandler(429)
def demasiadas_peticiones(e):
    return jsonify({"error": "Demasiadas peticiones. Espera un momento e intenta de nuevo."}), 429


@app.errorhandler(Exception)
def error_no_controlado(e):
    """Red de seguridad final: cualquier fallo no previsto se registra en el servidor
    y el cliente solo recibe un mensaje genérico (nunca trazas ni detalles internos)."""
    from werkzeug.exceptions import HTTPException
    if isinstance(e, HTTPException):
        return jsonify({"error": e.description}), e.code
    logging.getLogger("main").exception("Error no controlado")
    return jsonify({"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}), 500


@app.errorhandler(404)
def no_encontrado(e):
    return jsonify({"error": "Recurso no encontrado"}), 404


@app.errorhandler(405)
def metodo_no_permitido(e):
    return jsonify({"error": "Método no permitido"}), 405


@app.after_request
def cabeceras_de_seguridad(respuesta):
    """Security headers (punto 18) y refuerzo de HTTPS (punto 19)."""
    respuesta.headers["X-Content-Type-Options"] = "nosniff"
    respuesta.headers["X-Frame-Options"] = "DENY"
    respuesta.headers["Referrer-Policy"] = "no-referrer"
    respuesta.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
    # Esta API solo devuelve JSON: no debe cargar ni incrustar nada.
    respuesta.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
    # HSTS: el navegador recordará usar siempre HTTPS con este dominio (1 año).
    if request.is_secure:
        respuesta.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    # Las respuestas de la API (datos de usuario) no deben guardarse en cachés compartidas.
    if request.method == "GET" and request.path != "/":
        respuesta.headers["Cache-Control"] = "no-store"
    return respuesta

app.register_blueprint(usuario_bp)
app.register_blueprint(protegido_bp)
app.register_blueprint(reporte_bp)
app.register_blueprint(noticia_bp)
app.register_blueprint(empresa_bp)
app.register_blueprint(metrica_bp)
app.register_blueprint(beneficio_bp)
app.register_blueprint(certificado_bp)
app.register_blueprint(dosfa_bp)


@app.route('/')
def home():
    return {"mensaje": "EcoMapaGo API funcionando 🚀"}


if __name__ == '__main__':
    modo_debug = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(debug=modo_debug)

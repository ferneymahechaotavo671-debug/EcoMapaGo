from dotenv import load_dotenv
load_dotenv()  # Debe ser lo primero antes de cualquier import de la app

from flask import Flask, jsonify
from flask_cors import CORS
import os
import logging

from app.extensions import limiter
from app.routes.usuario_routes import usuario_bp
from app.routes.protegido_routes import protegido_bp
from app.routes.reporte_routes import reporte_bp
from app.routes.noticia_routes import noticia_bp
from app.routes.empresa_routes import empresa_bp
from app.routes.metrica_routes import metrica_bp

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

app = Flask(__name__)

# Orígenes permitidos: tu frontend en Render + entorno de desarrollo local.
# Si tu dominio de Render es distinto al de ejemplo, actualízalo aquí o
# defínelo en la variable de entorno FRONTEND_URL (Render > Environment).
app.config['FRONTEND_URL'] = os.getenv("FRONTEND_URL", "https://ecomapago.onrender.com")

origenes_permitidos = [
    "http://localhost:5173",
    app.config['FRONTEND_URL']
]
CORS(app, resources={r"/*": {"origins": origenes_permitidos}})

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
if not app.config['SECRET_KEY']:
    raise RuntimeError(
        "La variable de entorno SECRET_KEY es obligatoria y no está configurada. "
        "Defínela en tu archivo .env (desarrollo local) o en las variables de entorno "
        "de Render (producción) antes de iniciar la aplicación."
    )

limiter.init_app(app)

# Límite de tamaño de peticiones (imágenes en base64 incluidas). 4MB es suficiente
# para una foto de noticia o un logo razonable sin comprometer el servidor.
app.config['MAX_CONTENT_LENGTH'] = 4 * 1024 * 1024


@app.errorhandler(413)
def imagen_demasiado_grande(e):
    return jsonify({"error": "La imagen es demasiado pesada. Máximo 4MB."}), 413

app.register_blueprint(usuario_bp)
app.register_blueprint(protegido_bp)
app.register_blueprint(reporte_bp)
app.register_blueprint(noticia_bp)
app.register_blueprint(empresa_bp)
app.register_blueprint(metrica_bp)


@app.route('/')
def home():
    return {"mensaje": "EcoMapaGo API funcionando 🚀"}


if __name__ == '__main__':
    modo_debug = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(debug=modo_debug)

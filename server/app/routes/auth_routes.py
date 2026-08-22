from flask import Blueprint, request, jsonify
from app.services.usuario_service import UsuarioService

auth_bp = Blueprint('auth_bp', __name__)

# Este blueprint ya no expone /login (está en usuario_routes)
# Se mantiene para compatibilidad futura (OAuth, refresh token, etc.)

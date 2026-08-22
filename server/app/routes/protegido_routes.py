from flask import Blueprint, request, jsonify
from app.middleware.auth_middleware import token_requerido
from app.services.usuario_service import UsuarioService

protegido_bp = Blueprint('protegido_bp', __name__)


@protegido_bp.route('/perfil', methods=['GET'])
@token_requerido
def perfil():
    usuario = request.usuario
    respuesta = UsuarioService.obtener_perfil(usuario.get("id"))
    if "error" in respuesta:
        return jsonify(respuesta), 404
    return jsonify(respuesta)

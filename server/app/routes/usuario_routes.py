from flask import Blueprint, request, jsonify
from app.services.usuario_service import UsuarioService
from app.middleware.auth_middleware import token_requerido, admin_requerido
from app.extensions import limiter
import logging


logger = logging.getLogger(__name__)

usuario_bp = Blueprint('usuario_bp', __name__)


@usuario_bp.route('/registro', methods=['POST'])
@limiter.limit("10 per hour")
def registro():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos requeridos"}), 400

        respuesta = UsuarioService.crear_usuario(
            data.get('nombre', ''),
            data.get('correo', ''),
            data.get('password', '')
        )
        if "error" in respuesta:
            return jsonify(respuesta), 400
        return jsonify(respuesta), 201
    except Exception as e:
        logger.exception("Error inesperado en el endpoint")
        return jsonify({"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}), 500


@usuario_bp.route('/login', methods=['POST'])
@limiter.limit("8 per minute")
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos requeridos"}), 400

        respuesta = UsuarioService.login(
            data.get('correo', ''),
            data.get('password', '')
        )
        if "error" in respuesta:
            return jsonify(respuesta), 401
        return jsonify(respuesta), 200
    except Exception as e:
        logger.exception("Error inesperado en el endpoint")
        return jsonify({"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}), 500


@usuario_bp.route('/usuarios', methods=['GET'])
@admin_requerido
def obtener_usuarios():
    usuarios = UsuarioService.obtener_usuarios()
    return jsonify(usuarios), 200


@usuario_bp.route('/perfil', methods=['PUT'])
@token_requerido
def actualizar_perfil():
    try:
        data = request.get_json()
        usuario = request.usuario
        respuesta = UsuarioService.actualizar_perfil(
            usuario['id'],
            data.get('nombre', ''),
            data.get('password_actual', ''),
            data.get('password_nueva', '')
        )
        if "error" in respuesta:
            return jsonify(respuesta), 400
        return jsonify(respuesta), 200
    except Exception as e:
        logger.exception("Error inesperado en el endpoint")
        return jsonify({"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}), 500


@usuario_bp.route('/recuperar-password', methods=['POST'])
@limiter.limit("5 per hour")
def recuperar_password():
    try:
        data = request.get_json()
        correo = data.get('correo', '') if data else ''
        if not correo:
            return jsonify({"error": "Correo requerido"}), 400
        respuesta = UsuarioService.solicitar_recuperacion(correo)
        return jsonify(respuesta), 200
    except Exception as e:
        logger.exception("Error inesperado en el endpoint")
        return jsonify({"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}), 500


@usuario_bp.route('/restablecer-password', methods=['POST'])
@limiter.limit("5 per hour")
def restablecer_password():
    try:
        data = request.get_json()
        token = data.get('token', '') if data else ''
        password_nueva = data.get('password_nueva', '') if data else ''
        if not token or not password_nueva:
            return jsonify({"error": "Token y nueva contraseña son requeridos"}), 400
        respuesta = UsuarioService.restablecer_password(token, password_nueva)
        if "error" in respuesta:
            return jsonify(respuesta), 400
        return jsonify(respuesta), 200
    except Exception as e:
        logger.exception("Error inesperado en el endpoint")
        return jsonify({"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}), 500


@usuario_bp.route('/usuarios/<int:id>/rol', methods=['PUT'])
@admin_requerido
def cambiar_rol(id):
    try:
        data = request.get_json()
        rol = data.get('rol', '')
        if rol not in ['usuario', 'admin']:
            return jsonify({"error": "Rol inválido"}), 400
        respuesta = UsuarioService.cambiar_rol(id, rol)
        if "error" in respuesta:
            return jsonify(respuesta), 400
        return jsonify(respuesta), 200
    except Exception as e:
        logger.exception("Error inesperado en el endpoint")
        return jsonify({"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}), 500


@usuario_bp.route('/usuarios/<int:id>', methods=['DELETE'])
@admin_requerido
def eliminar_usuario(id):
    admin_id = request.usuario.get('id')
    if admin_id == id:
        return jsonify({"error": "No puedes eliminar tu propia cuenta"}), 400
    respuesta = UsuarioService.eliminar_usuario(id)
    if "error" in respuesta:
        return jsonify(respuesta), 400
    return jsonify(respuesta), 200

from flask import Blueprint, request, jsonify
from app.services.usuario_service import UsuarioService
from app.middleware.auth_middleware import token_requerido, admin_requerido
from app.extensions import limiter
from app.utils.seguridad import sanitizar_texto
import logging


logger = logging.getLogger(__name__)

usuario_bp = Blueprint('usuario_bp', __name__)


@usuario_bp.route('/registro', methods=['POST'])
@limiter.limit("10 per hour")
def registro():
    try:
        data = request.get_json(silent=True)
        if not data or not isinstance(data, dict):
            return jsonify({"error": "Datos requeridos"}), 400

        # Trampa para bots (honeypot): este campo está oculto para personas; si llega con
        # contenido, lo rellenó un script. Se responde "éxito" sin crear nada.
        if data.get('website'):
            return jsonify({"mensaje": "Usuario creado correctamente"}), 201

        respuesta = UsuarioService.crear_usuario(
            sanitizar_texto(data.get('nombre', ''), 100) or '',
            str(data.get('correo', '')).strip()[:150],
            str(data.get('password', ''))
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
        data = request.get_json(silent=True)
        if not data or not isinstance(data, dict):
            return jsonify({"error": "Datos requeridos"}), 400

        respuesta = UsuarioService.login(
            str(data.get('correo', '')).strip()[:150],
            str(data.get('password', ''))[:129]
        )
        if "error" in respuesta:
            return jsonify(respuesta), 401
        return jsonify(respuesta), 200
    except Exception as e:
        logger.exception("Error inesperado en el endpoint")
        return jsonify({"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}), 500


@usuario_bp.route('/login/verificar-2fa', methods=['POST'])
@limiter.limit("8 per minute")
def verificar_2fa_login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos requeridos"}), 400

        respuesta = UsuarioService.verificar_2fa_login(
            data.get('token_temporal', ''),
            data.get('codigo', '')
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
        data = request.get_json(silent=True)
        if not data or not isinstance(data, dict):
            return jsonify({"error": "Datos requeridos"}), 400
        usuario = request.usuario
        respuesta = UsuarioService.actualizar_perfil(
            usuario['id'],
            sanitizar_texto(data.get('nombre', ''), 100) or '',
            str(data.get('password_actual', ''))[:129],
            str(data.get('password_nueva', ''))
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
        data = request.get_json(silent=True)
        data = data if isinstance(data, dict) else {}
        correo = str(data.get('correo', '')).strip()[:150]
        if not correo:
            return jsonify({"error": "Correo requerido"}), 400
        if data.get('website'):  # honeypot anti-bots
            return jsonify({"mensaje": "Si el correo existe, recibirás instrucciones de recuperación"}), 200
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

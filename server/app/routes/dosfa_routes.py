import logging
from flask import Blueprint, request, jsonify
from app.middleware.auth_middleware import token_requerido
from app.services.dosfa_service import DosFAService
from app.extensions import limiter

logger = logging.getLogger(__name__)
dosfa_bp = Blueprint('dosfa_bp', __name__)


@dosfa_bp.route('/2fa/iniciar', methods=['POST'])
@token_requerido
def iniciar_2fa():
    usuario = request.usuario
    respuesta = DosFAService.iniciar_configuracion(usuario['id'], usuario['correo'])
    if "error" in respuesta:
        return jsonify(respuesta), 400
    return jsonify(respuesta), 200


@dosfa_bp.route('/2fa/activar', methods=['POST'])
@token_requerido
@limiter.limit("10 per hour")
def activar_2fa():
    try:
        data = request.get_json()
        codigo = data.get('codigo', '') if data else ''
        if not codigo:
            return jsonify({"error": "Código requerido"}), 400
        respuesta = DosFAService.activar(request.usuario['id'], codigo)
        if "error" in respuesta:
            return jsonify(respuesta), 400
        return jsonify(respuesta), 200
    except Exception:
        logger.exception("Error inesperado en el endpoint")
        return jsonify({"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}), 500


@dosfa_bp.route('/2fa/desactivar', methods=['POST'])
@token_requerido
def desactivar_2fa():
    try:
        data = request.get_json()
        password_actual = data.get('password_actual', '') if data else ''
        if not password_actual:
            return jsonify({"error": "Debes confirmar tu contraseña actual"}), 400
        respuesta = DosFAService.desactivar(request.usuario['id'], password_actual)
        if "error" in respuesta:
            return jsonify(respuesta), 400
        return jsonify(respuesta), 200
    except Exception:
        logger.exception("Error inesperado en el endpoint")
        return jsonify({"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}), 500


@dosfa_bp.route('/2fa/estado', methods=['GET'])
@token_requerido
def estado_2fa():
    habilitado = DosFAService.esta_habilitado(request.usuario['id'])
    return jsonify({"habilitado": habilitado}), 200

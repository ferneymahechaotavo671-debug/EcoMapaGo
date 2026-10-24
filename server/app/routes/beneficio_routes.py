import logging
from flask import Blueprint, request, jsonify
from app.middleware.auth_middleware import token_requerido, admin_requerido
from app.services.beneficio_service import BeneficioService
from app.extensions import limiter
from app.utils.esquemas import limpiar_beneficio

logger = logging.getLogger(__name__)
beneficio_bp = Blueprint('beneficio_bp', __name__)


@beneficio_bp.route('/beneficios', methods=['POST'])
@admin_requerido
def crear_beneficio():
    try:
        c, error = limpiar_beneficio(request.get_json(silent=True))
        if error:
            return jsonify({"error": error}), 400
        if not c['empresa_id']:
            return jsonify({"error": "La empresa es requerida"}), 400
        respuesta = BeneficioService.crear_beneficio(
            c['empresa_id'], c['titulo'], c['descripcion'], c['costo_puntos']
        )
        if "error" in respuesta:
            return jsonify(respuesta), 400
        return jsonify(respuesta), 201
    except Exception:
        logger.exception("Error inesperado en el endpoint")
        return jsonify({"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}), 500


@beneficio_bp.route('/beneficios', methods=['GET'])
@token_requerido
def obtener_beneficios():
    solo_activos = request.usuario.get('rol') != 'admin'
    beneficios = BeneficioService.obtener_beneficios(solo_activos)
    return jsonify(beneficios), 200


@beneficio_bp.route('/beneficios/<int:id>', methods=['PUT'])
@admin_requerido
def editar_beneficio(id):
    try:
        c, error = limpiar_beneficio(request.get_json(silent=True))
        if error:
            return jsonify({"error": error}), 400
        respuesta = BeneficioService.editar_beneficio(
            id, c['titulo'], c['descripcion'], c['costo_puntos'], c['activo']
        )
        if "error" in respuesta:
            return jsonify(respuesta), 400
        return jsonify(respuesta), 200
    except Exception:
        logger.exception("Error inesperado en el endpoint")
        return jsonify({"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}), 500


@beneficio_bp.route('/beneficios/<int:id>', methods=['DELETE'])
@admin_requerido
def eliminar_beneficio(id):
    respuesta = BeneficioService.eliminar_beneficio(id)
    if "error" in respuesta:
        return jsonify(respuesta), 400
    return jsonify(respuesta), 200


@beneficio_bp.route('/beneficios/<int:id>/canjear', methods=['POST'])
@token_requerido
@limiter.limit("10 per minute")
def canjear_beneficio(id):
    usuario_id = request.usuario['id']
    respuesta = BeneficioService.canjear_beneficio(usuario_id, id)
    if "error" in respuesta:
        return jsonify(respuesta), 400
    return jsonify(respuesta), 200


@beneficio_bp.route('/mis-canjes', methods=['GET'])
@token_requerido
def obtener_mis_canjes():
    canjes = BeneficioService.obtener_mis_canjes(request.usuario['id'])
    return jsonify(canjes), 200


@beneficio_bp.route('/canjes/verificar/<codigo>', methods=['GET'])
@limiter.limit("20 per minute")
def verificar_canje(codigo):
    respuesta = BeneficioService.verificar_canje(codigo)
    return jsonify(respuesta), 200


@beneficio_bp.route('/canjes/<codigo>/marcar-usado', methods=['PUT'])
@admin_requerido
def marcar_canje_usado(codigo):
    respuesta = BeneficioService.marcar_canje_usado(codigo)
    if "error" in respuesta:
        return jsonify(respuesta), 400
    return jsonify(respuesta), 200

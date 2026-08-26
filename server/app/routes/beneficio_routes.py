import logging
from flask import Blueprint, request, jsonify
from app.middleware.auth_middleware import token_requerido, admin_requerido
from app.services.beneficio_service import BeneficioService
from app.extensions import limiter

logger = logging.getLogger(__name__)
beneficio_bp = Blueprint('beneficio_bp', __name__)


@beneficio_bp.route('/beneficios', methods=['POST'])
@admin_requerido
def crear_beneficio():
    try:
        data = request.get_json()
        if not data or not data.get('empresa_id') or not data.get('titulo') or not data.get('costo_puntos'):
            return jsonify({"error": "empresa_id, título y costo en puntos son requeridos"}), 400
        respuesta = BeneficioService.crear_beneficio(
            data['empresa_id'], data['titulo'], data.get('descripcion', ''), int(data['costo_puntos'])
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
        data = request.get_json()
        if not data or not data.get('titulo') or not data.get('costo_puntos'):
            return jsonify({"error": "Título y costo en puntos son requeridos"}), 400
        respuesta = BeneficioService.editar_beneficio(
            id, data['titulo'], data.get('descripcion', ''),
            int(data['costo_puntos']), data.get('activo', True)
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

from flask import Blueprint, request, jsonify
from app.middleware.auth_middleware import token_requerido, admin_requerido
from app.services.reporte_service import ReporteService
from app.utils.esquemas import limpiar_reporte
from app.utils.seguridad import paginacion_segura
import logging


logger = logging.getLogger(__name__)

reporte_bp = Blueprint('reporte_bp', __name__)

ERROR_INTERNO = {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}


@reporte_bp.route('/reportes', methods=['POST'])
@token_requerido
def crear_reporte():
    try:
        campos, error = limpiar_reporte(request.get_json(silent=True))
        if error:
            return jsonify({"error": error}), 400

        # El dueño del reporte SIEMPRE sale del token, nunca del cuerpo de la petición.
        respuesta = ReporteService.crear_reporte(
            campos['titulo'], campos['descripcion'], campos['localidad'],
            campos['categoria'], request.usuario['id'], campos['latitud'], campos['longitud']
        )
        if "error" in respuesta:
            return jsonify(respuesta), 400
        return jsonify(respuesta), 201
    except Exception:
        logger.exception("Error inesperado en el endpoint")
        return jsonify(ERROR_INTERNO), 500


@reporte_bp.route('/reportes', methods=['GET'])
@token_requerido
def obtener_reportes():
    pagina, limite = paginacion_segura(request.args)
    es_admin = request.usuario.get('rol') == 'admin'
    reportes = ReporteService.obtener_reportes(pagina, limite, es_admin)
    return jsonify(reportes), 200


@reporte_bp.route('/reportes/<int:id>', methods=['PUT'])
@token_requerido
def editar_reporte(id):
    try:
        campos, error = limpiar_reporte(request.get_json(silent=True))
        if error:
            return jsonify({"error": error}), 400
        usuario = request.usuario
        respuesta = ReporteService.editar_reporte(
            id, usuario['id'], usuario.get('rol') == 'admin',
            campos['titulo'], campos['descripcion'], campos['localidad'], campos['categoria']
        )
        if "error" in respuesta:
            codigo = 403 if respuesta.get("codigo") == "prohibido" else 400
            return jsonify(respuesta), codigo
        return jsonify(respuesta), 200
    except Exception:
        logger.exception("Error inesperado en el endpoint")
        return jsonify(ERROR_INTERNO), 500


@reporte_bp.route('/reportes/<int:id>', methods=['DELETE'])
@token_requerido
def eliminar_reporte(id):
    usuario = request.usuario
    respuesta = ReporteService.eliminar_reporte(id, usuario['id'], usuario.get('rol') == 'admin')
    if "error" in respuesta:
        codigo = 403 if respuesta.get("codigo") == "prohibido" else 400
        return jsonify(respuesta), codigo
    return jsonify(respuesta), 200


@reporte_bp.route('/reportes/<int:id>/estado', methods=['PUT'])
@admin_requerido
def cambiar_estado(id):
    try:
        data = request.get_json(silent=True) or {}
        respuesta = ReporteService.cambiar_estado(id, data.get('estado', ''))
        if "error" in respuesta:
            return jsonify(respuesta), 400
        return jsonify(respuesta), 200
    except Exception:
        logger.exception("Error inesperado en el endpoint")
        return jsonify(ERROR_INTERNO), 500

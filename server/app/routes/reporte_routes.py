from flask import Blueprint, request, jsonify
from app.middleware.auth_middleware import token_requerido, admin_requerido
from app.services.reporte_service import ReporteService
import logging


logger = logging.getLogger(__name__)

reporte_bp = Blueprint('reporte_bp', __name__)


@reporte_bp.route('/reportes', methods=['POST'])
@token_requerido
def crear_reporte():
    try:
        data = request.get_json()
        usuario = request.usuario
        campos = ['titulo', 'descripcion', 'localidad', 'categoria', 'latitud', 'longitud']
        for campo in campos:
            if campo not in data:
                return jsonify({"error": f"Campo requerido: {campo}"}), 400

        respuesta = ReporteService.crear_reporte(
            data['titulo'], data['descripcion'], data['localidad'],
            data['categoria'], usuario['id'], data['latitud'], data['longitud']
        )
        if "error" in respuesta:
            return jsonify(respuesta), 400
        return jsonify(respuesta), 201
    except Exception as e:
        logger.exception("Error inesperado en el endpoint")
        return jsonify({"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}), 500


@reporte_bp.route('/reportes', methods=['GET'])
@token_requerido
def obtener_reportes():
    pagina = int(request.args.get('pagina', 1))
    limite = int(request.args.get('limite', 20))
    es_admin = request.usuario.get('rol') == 'admin'
    reportes = ReporteService.obtener_reportes(pagina, limite, es_admin)
    return jsonify(reportes), 200


@reporte_bp.route('/reportes/<int:id>', methods=['PUT'])
@token_requerido
def editar_reporte(id):
    try:
        data = request.get_json()
        usuario = request.usuario
        respuesta = ReporteService.editar_reporte(
            id, usuario['id'], usuario.get('rol') == 'admin',
            data['titulo'], data['descripcion'],
            data['localidad'], data['categoria']
        )
        if "error" in respuesta:
            codigo = 403 if respuesta.get("codigo") == "prohibido" else 400
            return jsonify(respuesta), codigo
        return jsonify(respuesta), 200
    except Exception as e:
        logger.exception("Error inesperado en el endpoint")
        return jsonify({"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}), 500


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
        data = request.get_json()
        respuesta = ReporteService.cambiar_estado(id, data.get('estado', ''))
        if "error" in respuesta:
            return jsonify(respuesta), 400
        return jsonify(respuesta), 200
    except Exception as e:
        logger.exception("Error inesperado en el endpoint")
        return jsonify({"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}), 500

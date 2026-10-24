from flask import Blueprint, request, jsonify
from app.middleware.auth_middleware import admin_requerido
from app.services.noticia_service import NoticiaService
from app.utils.esquemas import limpiar_noticia
import logging


logger = logging.getLogger(__name__)

noticia_bp = Blueprint('noticia_bp', __name__)

ERROR_INTERNO = {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}


@noticia_bp.route('/noticias', methods=['POST'])
@admin_requerido
def crear_noticia():
    try:
        campos, error = limpiar_noticia(request.get_json(silent=True))
        if error:
            return jsonify({"error": error}), 400
        respuesta = NoticiaService.crear_noticia(campos['titulo'], campos['descripcion'], campos['imagen'])
        if "error" in respuesta:
            return jsonify(respuesta), 400
        return jsonify(respuesta), 201
    except Exception:
        logger.exception("Error inesperado en el endpoint")
        return jsonify(ERROR_INTERNO), 500


@noticia_bp.route('/noticias', methods=['GET'])
def obtener_noticias():
    noticias = NoticiaService.obtener_noticias()
    return jsonify(noticias), 200


@noticia_bp.route('/noticias/<int:id>', methods=['PUT'])
@admin_requerido
def editar_noticia(id):
    try:
        campos, error = limpiar_noticia(request.get_json(silent=True))
        if error:
            return jsonify({"error": error}), 400
        respuesta = NoticiaService.editar_noticia(id, campos['titulo'], campos['descripcion'], campos['imagen'])
        if "error" in respuesta:
            return jsonify(respuesta), 400
        return jsonify(respuesta), 200
    except Exception:
        logger.exception("Error inesperado en el endpoint")
        return jsonify(ERROR_INTERNO), 500


@noticia_bp.route('/noticias/<int:id>', methods=['DELETE'])
@admin_requerido
def eliminar_noticia(id):
    respuesta = NoticiaService.eliminar_noticia(id)
    if "error" in respuesta:
        return jsonify(respuesta), 400
    return jsonify(respuesta), 200

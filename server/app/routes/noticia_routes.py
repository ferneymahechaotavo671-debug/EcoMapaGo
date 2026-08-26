from flask import Blueprint, request, jsonify
from app.middleware.auth_middleware import admin_requerido
from app.services.noticia_service import NoticiaService
from app.utils.imagenes import es_imagen_valida
import logging


logger = logging.getLogger(__name__)

noticia_bp = Blueprint('noticia_bp', __name__)


@noticia_bp.route('/noticias', methods=['POST'])
@admin_requerido
def crear_noticia():
    try:
        data = request.get_json()
        if not data or not data.get('titulo') or not data.get('descripcion'):
            return jsonify({"error": "Título y descripción son requeridos"}), 400
        if not es_imagen_valida(data.get('imagen')):
            return jsonify({"error": "Formato de imagen no soportado. Usa PNG, JPG, WEBP o GIF."}), 400
        respuesta = NoticiaService.crear_noticia(
            data['titulo'], data['descripcion'], data.get('imagen')
        )
        if "error" in respuesta:
            return jsonify(respuesta), 400
        return jsonify(respuesta), 201
    except Exception as e:
        logger.exception("Error inesperado en el endpoint")
        return jsonify({"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}), 500


@noticia_bp.route('/noticias', methods=['GET'])
def obtener_noticias():
    noticias = NoticiaService.obtener_noticias()
    return jsonify(noticias), 200


@noticia_bp.route('/noticias/<int:id>', methods=['PUT'])
@admin_requerido
def editar_noticia(id):
    try:
        data = request.get_json()
        if not data or not data.get('titulo') or not data.get('descripcion'):
            return jsonify({"error": "Título y descripción son requeridos"}), 400
        if not es_imagen_valida(data.get('imagen')):
            return jsonify({"error": "Formato de imagen no soportado. Usa PNG, JPG, WEBP o GIF."}), 400
        respuesta = NoticiaService.editar_noticia(
            id, data['titulo'], data['descripcion'], data.get('imagen')
        )
        if "error" in respuesta:
            return jsonify(respuesta), 400
        return jsonify(respuesta), 200
    except Exception as e:
        logger.exception("Error inesperado en el endpoint")
        return jsonify({"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}), 500


@noticia_bp.route('/noticias/<int:id>', methods=['DELETE'])
@admin_requerido
def eliminar_noticia(id):
    respuesta = NoticiaService.eliminar_noticia(id)
    if "error" in respuesta:
        return jsonify(respuesta), 400
    return jsonify(respuesta), 200

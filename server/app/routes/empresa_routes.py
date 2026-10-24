from flask import Blueprint, request, jsonify
from app.middleware.auth_middleware import token_requerido, admin_requerido
from app.services.empresa_service import EmpresaService
from app.utils.esquemas import limpiar_empresa
import logging


logger = logging.getLogger(__name__)

empresa_bp = Blueprint('empresa_bp', __name__)

ERROR_INTERNO = {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}


@empresa_bp.route('/empresas', methods=['POST'])
@admin_requerido
def crear_empresa():
    try:
        c, error = limpiar_empresa(request.get_json(silent=True))
        if error:
            return jsonify({"error": error}), 400
        respuesta = EmpresaService.crear_empresa(
            c['nombre'], c['tipo_material'], c['direccion'], c['localidad'],
            c['telefono'], c['correo_contacto'], c['latitud'], c['longitud'], c['logo']
        )
        if "error" in respuesta:
            return jsonify(respuesta), 400
        return jsonify(respuesta), 201
    except Exception:
        logger.exception("Error inesperado en el endpoint")
        return jsonify(ERROR_INTERNO), 500


@empresa_bp.route('/empresas', methods=['GET'])
@token_requerido
def obtener_empresas():
    empresas = EmpresaService.obtener_empresas()
    return jsonify(empresas), 200


@empresa_bp.route('/empresas/<int:id>', methods=['PUT'])
@admin_requerido
def editar_empresa(id):
    try:
        c, error = limpiar_empresa(request.get_json(silent=True))
        if error:
            return jsonify({"error": error}), 400
        respuesta = EmpresaService.editar_empresa(
            id, c['nombre'], c['tipo_material'], c['direccion'], c['localidad'],
            c['telefono'], c['correo_contacto'], c['latitud'], c['longitud'], c['logo']
        )
        if "error" in respuesta:
            return jsonify(respuesta), 400
        return jsonify(respuesta), 200
    except Exception:
        logger.exception("Error inesperado en el endpoint")
        return jsonify(ERROR_INTERNO), 500


@empresa_bp.route('/empresas/<int:id>', methods=['DELETE'])
@admin_requerido
def eliminar_empresa(id):
    respuesta = EmpresaService.eliminar_empresa(id)
    if "error" in respuesta:
        return jsonify(respuesta), 400
    return jsonify(respuesta), 200

from flask import Blueprint, request, jsonify
from app.middleware.auth_middleware import token_requerido, admin_requerido
from app.services.empresa_service import EmpresaService
import logging


logger = logging.getLogger(__name__)

empresa_bp = Blueprint('empresa_bp', __name__)


@empresa_bp.route('/empresas', methods=['POST'])
@admin_requerido
def crear_empresa():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos requeridos"}), 400

        campos = ['nombre', 'tipo_material', 'direccion', 'localidad']
        for campo in campos:
            if not data.get(campo):
                return jsonify({"error": f"Campo requerido: {campo}"}), 400

        respuesta = EmpresaService.crear_empresa(
            data['nombre'], data['tipo_material'], data['direccion'], data['localidad'],
            data.get('telefono'), data.get('correo_contacto'),
            data.get('latitud'), data.get('longitud')
        )
        if "error" in respuesta:
            return jsonify(respuesta), 400
        return jsonify(respuesta), 201
    except Exception as e:
        logger.exception("Error inesperado en el endpoint")
        return jsonify({"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}), 500


@empresa_bp.route('/empresas', methods=['GET'])
@token_requerido
def obtener_empresas():
    empresas = EmpresaService.obtener_empresas()
    return jsonify(empresas), 200


@empresa_bp.route('/empresas/<int:id>', methods=['PUT'])
@admin_requerido
def editar_empresa(id):
    try:
        data = request.get_json()
        campos = ['nombre', 'tipo_material', 'direccion', 'localidad']
        for campo in campos:
            if not data.get(campo):
                return jsonify({"error": f"Campo requerido: {campo}"}), 400

        respuesta = EmpresaService.editar_empresa(
            id, data['nombre'], data['tipo_material'], data['direccion'], data['localidad'],
            data.get('telefono'), data.get('correo_contacto'),
            data.get('latitud'), data.get('longitud')
        )
        if "error" in respuesta:
            return jsonify(respuesta), 400
        return jsonify(respuesta), 200
    except Exception as e:
        logger.exception("Error inesperado en el endpoint")
        return jsonify({"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}), 500


@empresa_bp.route('/empresas/<int:id>', methods=['DELETE'])
@admin_requerido
def eliminar_empresa(id):
    respuesta = EmpresaService.eliminar_empresa(id)
    if "error" in respuesta:
        return jsonify(respuesta), 400
    return jsonify(respuesta), 200

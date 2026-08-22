from flask import Blueprint, jsonify
from app.middleware.auth_middleware import token_requerido
from app.services.metrica_service import MetricaService

metrica_bp = Blueprint('metrica_bp', __name__)


@metrica_bp.route('/metricas', methods=['GET'])
@token_requerido
def obtener_metricas():
    respuesta = MetricaService.obtener_metricas()
    if "error" in respuesta:
        return jsonify(respuesta), 500
    return jsonify(respuesta), 200

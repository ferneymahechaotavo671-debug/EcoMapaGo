import logging
from flask import Blueprint, request, jsonify
from app.middleware.auth_middleware import token_requerido
from app.services.certificado_service import CertificadoService
from app.extensions import limiter

logger = logging.getLogger(__name__)
certificado_bp = Blueprint('certificado_bp', __name__)


@certificado_bp.route('/certificados/generar', methods=['POST'])
@token_requerido
@limiter.limit("5 per hour")
def generar_certificado():
    respuesta = CertificadoService.generar_certificado(request.usuario['id'])
    if "error" in respuesta:
        return jsonify(respuesta), 400
    return jsonify(respuesta), 201


@certificado_bp.route('/certificados/verificar/<codigo>', methods=['GET'])
@limiter.limit("20 per minute")
def verificar_certificado(codigo):
    respuesta = CertificadoService.verificar_certificado(codigo)
    return jsonify(respuesta), 200

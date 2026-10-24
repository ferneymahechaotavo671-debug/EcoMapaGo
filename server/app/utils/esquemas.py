"""Reglas de validación por formulario (puntos 8 y 14: validar inputs y bloquear manipulación de campos).
Cada función devuelve (campos_limpios, error). Solo se copian los campos permitidos
(lista blanca): cualquier otro campo que envíe el cliente se ignora."""
from app.utils.seguridad import (
    validar_texto, validar_opcion, validar_coordenadas, validar_correo_formato, sanitizar_texto,
)
from app.utils.imagenes import es_imagen_valida

CATEGORIAS_REPORTE = ["basura", "contaminacion", "zona-verde", "reciclaje", "otro"]
TIPOS_MATERIAL = ["papel", "plastico", "vidrio", "metal", "organico", "electronico", "textil", "otro"]


def _primer_error(*pares):
    for valor, error in pares:
        if error:
            return error
    return None


def limpiar_reporte(data):
    if not isinstance(data, dict):
        return None, "Datos requeridos"
    titulo, e1 = validar_texto(data, "titulo", "El título", 150, min_len=3)
    descripcion, e2 = validar_texto(data, "descripcion", "La descripción", 2000, min_len=3)
    localidad, e3 = validar_texto(data, "localidad", "La localidad", 150, min_len=2)
    categoria = data.get("categoria")
    e4 = validar_opcion(categoria, CATEGORIAS_REPORTE, "La categoría")
    lat, lon, e5 = validar_coordenadas(data.get("latitud"), data.get("longitud"))
    error = _primer_error((titulo, e1), (descripcion, e2), (localidad, e3), (categoria, e4), (lat, e5))
    if error:
        return None, error
    return {"titulo": titulo, "descripcion": descripcion, "localidad": localidad,
            "categoria": categoria, "latitud": lat, "longitud": lon}, None


def limpiar_noticia(data):
    if not isinstance(data, dict):
        return None, "Datos requeridos"
    titulo, e1 = validar_texto(data, "titulo", "El título", 150, min_len=3)
    descripcion, e2 = validar_texto(data, "descripcion", "La descripción", 5000, min_len=3)
    error = _primer_error((titulo, e1), (descripcion, e2))
    if error:
        return None, error
    imagen = data.get("imagen")
    if not es_imagen_valida(imagen):
        return None, "Formato de imagen no soportado. Usa PNG, JPG, WEBP o GIF."
    return {"titulo": titulo, "descripcion": descripcion, "imagen": imagen or None}, None


def limpiar_empresa(data):
    if not isinstance(data, dict):
        return None, "Datos requeridos"
    nombre, e1 = validar_texto(data, "nombre", "El nombre", 150, min_len=3)
    direccion, e2 = validar_texto(data, "direccion", "La dirección", 200, min_len=3)
    localidad, e3 = validar_texto(data, "localidad", "La localidad", 150, min_len=2)
    telefono, e4 = validar_texto(data, "telefono", "El teléfono", 30, obligatorio=False)
    tipo = data.get("tipo_material")
    e5 = validar_opcion(tipo, TIPOS_MATERIAL, "El tipo de material")
    error = _primer_error((nombre, e1), (direccion, e2), (localidad, e3), (telefono, e4), (tipo, e5))
    if error:
        return None, error
    correo = sanitizar_texto(data.get("correo_contacto"), 150) or ""
    if correo and not validar_correo_formato(correo):
        return None, "El correo de contacto no es válido"
    lat, lon, e6 = validar_coordenadas(data.get("latitud"), data.get("longitud"))
    if e6:
        return None, e6
    logo = data.get("logo")
    if not es_imagen_valida(logo):
        return None, "Formato de logo no soportado. Usa PNG, JPG, WEBP o GIF."
    return {"nombre": nombre, "tipo_material": tipo, "direccion": direccion, "localidad": localidad,
            "telefono": telefono or None, "correo_contacto": correo or None,
            "latitud": lat, "longitud": lon, "logo": logo or None}, None


def limpiar_beneficio(data):
    if not isinstance(data, dict):
        return None, "Datos requeridos"
    titulo, e1 = validar_texto(data, "titulo", "El título", 150, min_len=3)
    descripcion, e2 = validar_texto(data, "descripcion", "La descripción", 1000, obligatorio=False)
    error = _primer_error((titulo, e1), (descripcion, e2))
    if error:
        return None, error
    try:
        costo = int(data.get("costo_puntos"))
    except (TypeError, ValueError):
        return None, "El costo en puntos debe ser un número entero"
    if not (1 <= costo <= 100000):
        return None, "El costo en puntos debe estar entre 1 y 100000"
    try:
        empresa_id = int(data.get("empresa_id")) if data.get("empresa_id") is not None else None
    except (TypeError, ValueError):
        return None, "La empresa no es válida"
    return {"titulo": titulo, "descripcion": descripcion or "", "costo_puntos": costo,
            "empresa_id": empresa_id, "activo": bool(data.get("activo", True))}, None

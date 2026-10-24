"""Utilidades de validación y sanitización de entradas (puntos 8, 14 y 15 de la lista de seguridad)."""
import re

_ETIQUETAS_HTML = re.compile(r"<[^>]*>")
_CONTROL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_CORREO = re.compile(r"^[\w\.\-+]+@[\w\.\-]+\.\w{2,}$")


def sanitizar_texto(valor, max_len):
    """Quita etiquetas HTML y caracteres de control, recorta espacios y limita el largo.
    Devuelve None si el valor no es texto."""
    if valor is None:
        return ""
    if not isinstance(valor, str):
        return None
    limpio = _ETIQUETAS_HTML.sub("", valor)
    limpio = _CONTROL.sub("", limpio).strip()
    return limpio[:max_len]


def validar_texto(data, campo, etiqueta, max_len, min_len=1, obligatorio=True):
    """Lee data[campo], lo sanitiza y valida su largo. Devuelve (valor, error)."""
    bruto = data.get(campo)
    if bruto is None or bruto == "":
        if obligatorio:
            return None, f"{etiqueta} es requerido"
        return "", None
    limpio = sanitizar_texto(bruto, max_len)
    if limpio is None:
        return None, f"{etiqueta} no es válido"
    if obligatorio and len(limpio) < min_len:
        return None, f"{etiqueta} debe tener al menos {min_len} caracteres"
    return limpio, None


def validar_opcion(valor, permitidas, etiqueta):
    if valor not in permitidas:
        return f"{etiqueta} no es una opción válida"
    return None


def validar_coordenadas(latitud, longitud):
    """Devuelve (lat, lon, error). Acepta None en ambas (reporte sin ubicación)."""
    if latitud in (None, "") and longitud in (None, ""):
        return None, None, None
    try:
        lat, lon = float(latitud), float(longitud)
    except (TypeError, ValueError):
        return None, None, "Las coordenadas no son válidas"
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        return None, None, "Las coordenadas están fuera de rango"
    return lat, lon, None


def validar_correo_formato(correo):
    return bool(correo) and len(correo) <= 150 and bool(_CORREO.match(correo))


def paginacion_segura(args, limite_defecto=20, limite_max=100):
    """Evita que el cliente pida páginas/limites absurdos (volcado masivo de datos)."""
    try:
        pagina = max(int(args.get("pagina", 1)), 1)
    except (TypeError, ValueError):
        pagina = 1
    try:
        limite = int(args.get("limite", limite_defecto))
    except (TypeError, ValueError):
        limite = limite_defecto
    limite = min(max(limite, 1), limite_max)
    return pagina, limite

import base64
import binascii
import re

# Solo formatos rasterizados seguros para base64. Se excluye a propósito image/svg+xml:
# los SVG pueden contener <script> y ciertos contextos de renderizado lo ejecutan.
FORMATOS_PERMITIDOS = ["png", "jpeg", "jpg", "webp", "gif"]

_PATRON_DATA_URL = re.compile(
    r"^data:image/(" + "|".join(FORMATOS_PERMITIDOS) + r");base64,([A-Za-z0-9+/]+=*)$"
)
_PATRON_URL_HTTP = re.compile(r"^https?://[^\s<>\"']+$")

# Firmas reales ("magic bytes") de cada formato: evita que un archivo cualquiera
# se haga pasar por imagen solo cambiando el texto "data:image/png".
_FIRMAS = {
    "png": [b"\x89PNG\r\n\x1a\n"],
    "jpeg": [b"\xff\xd8\xff"],
    "jpg": [b"\xff\xd8\xff"],
    "gif": [b"GIF87a", b"GIF89a"],
    "webp": [b"RIFF"],
}


def _firma_valida(formato, contenido):
    inicio = contenido[:16]
    if not any(inicio.startswith(f) for f in _FIRMAS[formato]):
        return False
    if formato == "webp" and contenido[8:12] != b"WEBP":
        return False
    return True


def es_imagen_valida(valor):
    """True si valor es vacío (opcional), una URL http(s), o una imagen base64 segura
    cuyo contenido real coincide con el formato declarado."""
    if not valor:
        return True
    if not isinstance(valor, str):
        return False
    if valor.startswith("data:"):
        m = _PATRON_DATA_URL.match(valor)
        if not m:
            return False
        formato, b64 = m.group(1), m.group(2)
        try:
            contenido = base64.b64decode(b64, validate=True)
        except (binascii.Error, ValueError):
            return False
        return _firma_valida(formato, contenido)
    return len(valor) <= 500 and bool(_PATRON_URL_HTTP.match(valor))

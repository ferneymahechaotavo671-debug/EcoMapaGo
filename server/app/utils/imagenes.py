import re

# Solo formatos rasterizados seguros para base64. Se excluye a propósito image/svg+xml:
# los SVG pueden contener <script> y ciertos contextos de renderizado lo ejecutan.
FORMATOS_PERMITIDOS = ["png", "jpeg", "jpg", "webp", "gif"]

_PATRON_DATA_URL = re.compile(
    r"^data:image/(" + "|".join(FORMATOS_PERMITIDOS) + r");base64,[A-Za-z0-9+/]+=*$"
)
_PATRON_URL_HTTP = re.compile(r"^https?://\S+$")


def es_imagen_valida(valor):
    """Devuelve True si valor es None/vacío (opcional), una data URL de imagen segura,
    o una URL http(s) normal (para cuando el usuario pega un link en vez de subir un archivo)."""
    if not valor:
        return True
    if valor.startswith("data:"):
        return bool(_PATRON_DATA_URL.match(valor))
    return bool(_PATRON_URL_HTTP.match(valor))


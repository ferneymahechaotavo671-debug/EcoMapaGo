import base64
import pytest

from app.utils.seguridad import (
    sanitizar_texto, validar_coordenadas, paginacion_segura, validar_correo_formato,
)
from app.utils.imagenes import es_imagen_valida
from app.utils.esquemas import limpiar_reporte, limpiar_empresa, limpiar_beneficio
from app.utils.validator import Validator

PNG_REAL = base64.b64encode(b"\x89PNG\r\n\x1a\n" + b"0" * 20).decode()


# ---- Sanitización (punto 15) ----
def test_sanitizar_quita_etiquetas_html():
    assert sanitizar_texto("<script>alert(1)</script>Hola", 50) == "alert(1)Hola"

def test_sanitizar_limita_largo():
    assert len(sanitizar_texto("a" * 500, 100)) == 100

def test_sanitizar_rechaza_no_texto():
    assert sanitizar_texto(123, 10) is None


# ---- Validación de entradas (puntos 8 y 14) ----
def reporte_base(**cambios):
    d = {"titulo": "Basura en el parque", "descripcion": "Hay basura", "localidad": "Suba",
         "categoria": "basura", "latitud": 4.7, "longitud": -74.0}
    d.update(cambios)
    return d

def test_reporte_valido():
    campos, error = limpiar_reporte(reporte_base())
    assert error is None and campos["categoria"] == "basura"

def test_reporte_categoria_fuera_de_lista():
    assert limpiar_reporte(reporte_base(categoria="hack"))[1]

def test_reporte_ignora_campos_extra_como_usuario_id_o_estado():
    campos, _ = limpiar_reporte(reporte_base(usuario_id=999, estado="aprobado", rol="admin"))
    assert set(campos) == {"titulo", "descripcion", "localidad", "categoria", "latitud", "longitud"}

def test_coordenadas_fuera_de_rango():
    assert validar_coordenadas(999, 0)[2]
    assert validar_coordenadas("abc", 0)[2]
    assert validar_coordenadas(None, None) == (None, None, None)

def test_empresa_correo_invalido():
    d = {"nombre": "EcoRecicla", "tipo_material": "papel", "direccion": "Cra 1 # 2", "localidad": "Suba",
         "correo_contacto": "no-es-correo"}
    assert limpiar_empresa(d)[1]

def test_beneficio_costo_invalido():
    assert limpiar_beneficio({"titulo": "Descuento", "costo_puntos": -1, "empresa_id": 1})[1]
    assert limpiar_beneficio({"titulo": "Descuento", "costo_puntos": "x", "empresa_id": 1})[1]
    assert limpiar_beneficio({"titulo": "Descuento", "costo_puntos": 50, "empresa_id": 1})[1] is None

def test_paginacion_no_permite_volcados():
    assert paginacion_segura({"limite": "999999", "pagina": "-4"}) == (1, 100)
    assert paginacion_segura({"limite": "abc", "pagina": "x"}) == (1, 20)


# ---- Archivos / imágenes (punto 16) ----
def test_imagen_png_real_valida():
    assert es_imagen_valida(f"data:image/png;base64,{PNG_REAL}")

def test_imagen_rechaza_svg():
    assert not es_imagen_valida("data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=")

def test_imagen_rechaza_contenido_que_no_es_png():
    falso = base64.b64encode(b"esto no es una imagen").decode()
    assert not es_imagen_valida(f"data:image/png;base64,{falso}")

def test_imagen_acepta_url_https_y_vacio():
    assert es_imagen_valida("https://ejemplo.com/foto.png")
    assert es_imagen_valida(None) and es_imagen_valida("")

def test_imagen_rechaza_javascript_url():
    assert not es_imagen_valida("javascript:alert(1)")


# ---- Contraseñas (punto 10) ----
def test_password_demasiado_larga_rechazada():
    assert not Validator.validar_password("Aa1!" * 40)

def test_formato_correo():
    assert validar_correo_formato("a@b.co") and not validar_correo_formato("a@b")

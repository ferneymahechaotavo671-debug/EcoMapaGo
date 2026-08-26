import secrets
import datetime
import logging
from app.database.conexion import conectar, liberar
from app.utils.niveles import calcular_nivel

logger = logging.getLogger(__name__)


class CertificadoService:

    @staticmethod
    def generar_certificado(usuario_id):
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute("SELECT nombre, puntos FROM usuarios WHERE id=%s", (usuario_id,))
            usuario = cursor.fetchone()
            if not usuario:
                return {"error": "Usuario no encontrado"}

            nombre, puntos = usuario
            puntos = puntos or 0
            nivel = calcular_nivel(puntos)

            anio = datetime.datetime.utcnow().year
            codigo = f"ECOMAPAGO-{anio}-{secrets.token_hex(5).upper()}"

            cursor.execute(
                """INSERT INTO certificados (usuario_id, codigo, puntos_al_emitir, nivel)
                   VALUES (%s, %s, %s, %s)""",
                (usuario_id, codigo, puntos, nivel["nombre"])
            )
            conexion.commit()
            cursor.close()

            return {
                "codigo": codigo,
                "nombre": nombre,
                "puntos": puntos,
                "nivel": nivel["nombre"],
                "fecha": datetime.datetime.utcnow().strftime("%d/%m/%Y")
            }
        except Exception:
            conexion.rollback()
            logger.exception("Error al generar certificado")
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

    @staticmethod
    def verificar_certificado(codigo):
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute(
                """SELECT c.puntos_al_emitir, c.nivel, c.fecha_creacion, u.nombre
                   FROM certificados c
                   INNER JOIN usuarios u ON c.usuario_id = u.id
                   WHERE c.codigo = %s""",
                (codigo,)
            )
            fila = cursor.fetchone()
            cursor.close()
            if not fila:
                return {"valido": False, "error": "Este código de certificado no existe"}
            return {
                "valido": True,
                "nombre": fila[3],
                "puntos": fila[0],
                "nivel": fila[1],
                "fecha": str(fila[2])
            }
        except Exception:
            logger.exception("Error al verificar certificado")
            return {"valido": False, "error": "Ocurrió un error interno."}
        finally:
            liberar(conexion)

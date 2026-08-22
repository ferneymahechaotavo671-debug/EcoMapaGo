from app.database.conexion import conectar, liberar
from app.models.noticia import Noticia
import logging



logger = logging.getLogger(__name__)

class NoticiaService:

    @staticmethod
    def crear_noticia(titulo, descripcion, imagen):
        conexion = conectar()
        try:
            noticia = Noticia(titulo, descripcion, imagen)
            cursor = conexion.cursor()
            cursor.execute(
                "INSERT INTO noticias (titulo, descripcion, imagen) VALUES (%s, %s, %s)",
                (noticia.get_titulo(), noticia.get_descripcion(), noticia.get_imagen())
            )
            conexion.commit()
            cursor.close()
            return {"mensaje": "Noticia creada"}
        except Exception as e:
            logger.exception("Error inesperado en la operación")
            conexion.rollback()
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

    @staticmethod
    def obtener_noticias():
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute("SELECT * FROM noticias ORDER BY fecha_creacion DESC")
            noticias = cursor.fetchall()
            cursor.close()
            return [{
                "id": n[0], "titulo": n[1], "descripcion": n[2],
                "imagen": n[3], "fecha": str(n[4])
            } for n in noticias]
        except Exception as e:
            logger.exception("Error al consultar datos")
            return []
        finally:
            liberar(conexion)

    @staticmethod
    def editar_noticia(id, titulo, descripcion, imagen):
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute(
                "UPDATE noticias SET titulo=%s, descripcion=%s, imagen=%s WHERE id=%s",
                (titulo, descripcion, imagen, id)
            )
            conexion.commit()
            cursor.close()
            return {"mensaje": "Noticia actualizada"}
        except Exception as e:
            logger.exception("Error inesperado en la operación")
            conexion.rollback()
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

    @staticmethod
    def eliminar_noticia(id):
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute("DELETE FROM noticias WHERE id=%s", (id,))
            conexion.commit()
            cursor.close()
            return {"mensaje": "Noticia eliminada"}
        except Exception as e:
            logger.exception("Error inesperado en la operación")
            conexion.rollback()
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

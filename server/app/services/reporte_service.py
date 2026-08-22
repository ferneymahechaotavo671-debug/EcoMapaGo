from app.database.conexion import conectar, liberar
from app.models.reporte import Reporte
import logging



logger = logging.getLogger(__name__)

class ReporteService:

    @staticmethod
    def crear_reporte(titulo, descripcion, localidad, categoria, usuario_id, latitud, longitud):
        conexion = conectar()
        try:
            reporte = Reporte(titulo, descripcion, localidad, categoria, usuario_id, latitud, longitud)
            cursor = conexion.cursor()
            cursor.execute(
                """INSERT INTO reportes (titulo, descripcion, localidad, categoria, usuario_id, latitud, longitud)
                   VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                (reporte.get_titulo(), reporte.get_descripcion(), reporte.get_localidad(),
                 reporte.get_categoria(), reporte.get_usuario_id(), latitud, longitud)
            )
            conexion.commit()
            cursor.close()
            return {"mensaje": "Reporte creado correctamente"}
        except Exception as e:
            logger.exception("Error inesperado en la operación")
            conexion.rollback()
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

    @staticmethod
    def obtener_reportes(pagina=1, limite=20):
        conexion = conectar()
        try:
            offset = (pagina - 1) * limite
            cursor = conexion.cursor()
            cursor.execute(
                """SELECT r.id, r.titulo, r.descripcion, r.localidad, r.categoria,
                          r.estado, r.fecha_creacion, u.nombre, r.latitud, r.longitud, r.usuario_id
                   FROM reportes r
                   INNER JOIN usuarios u ON r.usuario_id = u.id
                   ORDER BY r.fecha_creacion DESC
                   LIMIT %s OFFSET %s""",
                (limite, offset)
            )
            reportes = cursor.fetchall()
            cursor.close()
            return [{
                "id": r[0], "titulo": r[1], "descripcion": r[2],
                "localidad": r[3], "categoria": r[4], "estado": r[5],
                "fecha": str(r[6]), "usuario": r[7],
                "latitud": float(r[8]) if r[8] else None,
                "longitud": float(r[9]) if r[9] else None,
                "usuario_id": r[10]
            } for r in reportes]
        except Exception as e:
            logger.exception("Error al consultar datos")
            return []
        finally:
            liberar(conexion)

    @staticmethod
    def editar_reporte(reporte_id, usuario_id, es_admin, titulo, descripcion, localidad, categoria):
        conexion = conectar()
        try:
            cursor = conexion.cursor()

            cursor.execute("SELECT usuario_id FROM reportes WHERE id=%s", (reporte_id,))
            fila = cursor.fetchone()
            if not fila:
                return {"error": "Reporte no encontrado"}
            if not es_admin and fila[0] != usuario_id:
                return {"error": "No tienes permiso para editar este reporte", "codigo": "prohibido"}

            cursor.execute(
                """UPDATE reportes SET titulo=%s, descripcion=%s, localidad=%s, categoria=%s
                   WHERE id=%s""",
                (titulo, descripcion, localidad, categoria, reporte_id)
            )
            conexion.commit()
            cursor.close()
            return {"mensaje": "Reporte actualizado correctamente"}
        except Exception as e:
            logger.exception("Error inesperado en la operación")
            conexion.rollback()
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

    @staticmethod
    def eliminar_reporte(reporte_id, usuario_id, es_admin):
        conexion = conectar()
        try:
            cursor = conexion.cursor()

            cursor.execute("SELECT usuario_id FROM reportes WHERE id=%s", (reporte_id,))
            fila = cursor.fetchone()
            if not fila:
                return {"error": "Reporte no encontrado"}
            if not es_admin and fila[0] != usuario_id:
                return {"error": "No tienes permiso para eliminar este reporte", "codigo": "prohibido"}

            cursor.execute("DELETE FROM reportes WHERE id = %s", (reporte_id,))
            conexion.commit()
            cursor.close()
            return {"mensaje": "Reporte eliminado correctamente"}
        except Exception as e:
            logger.exception("Error inesperado en la operación")
            conexion.rollback()
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

    PUNTOS_POR_REPORTE_APROBADO = 10

    @staticmethod
    def cambiar_estado(reporte_id, estado):
        estados_validos = ['pendiente', 'aprobado', 'rechazado']
        if estado not in estados_validos:
            return {"error": f"Estado inválido. Debe ser uno de: {', '.join(estados_validos)}"}
        conexion = conectar()
        try:
            cursor = conexion.cursor()

            cursor.execute(
                "SELECT usuario_id, estado, puntos_otorgados FROM reportes WHERE id=%s",
                (reporte_id,)
            )
            fila = cursor.fetchone()
            if not fila:
                return {"error": "Reporte no encontrado"}
            usuario_id, estado_anterior, puntos_otorgados = fila

            cursor.execute(
                "UPDATE reportes SET estado=%s WHERE id=%s",
                (estado, reporte_id)
            )

            mensaje_puntos = ""
            if estado == 'aprobado' and not puntos_otorgados:
                cursor.execute(
                    "UPDATE usuarios SET puntos = puntos + %s WHERE id=%s",
                    (ReporteService.PUNTOS_POR_REPORTE_APROBADO, usuario_id)
                )
                cursor.execute(
                    "UPDATE reportes SET puntos_otorgados=TRUE WHERE id=%s",
                    (reporte_id,)
                )
                mensaje_puntos = f" Se otorgaron {ReporteService.PUNTOS_POR_REPORTE_APROBADO} puntos al usuario."
            elif estado_anterior == 'aprobado' and estado != 'aprobado' and puntos_otorgados:
                cursor.execute(
                    "UPDATE usuarios SET puntos = GREATEST(puntos - %s, 0) WHERE id=%s",
                    (ReporteService.PUNTOS_POR_REPORTE_APROBADO, usuario_id)
                )
                cursor.execute(
                    "UPDATE reportes SET puntos_otorgados=FALSE WHERE id=%s",
                    (reporte_id,)
                )

            conexion.commit()
            cursor.close()
            return {"mensaje": "Estado actualizado." + mensaje_puntos}
        except Exception as e:
            logger.exception("Error inesperado en la operación")
            conexion.rollback()
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

import secrets
import logging
from app.database.conexion import conectar, liberar

logger = logging.getLogger(__name__)


class BeneficioService:

    @staticmethod
    def crear_beneficio(empresa_id, titulo, descripcion, costo_puntos):
        if not titulo or len(titulo.strip()) < 3:
            return {"error": "El título del beneficio no es válido"}
        if not isinstance(costo_puntos, int) or costo_puntos <= 0:
            return {"error": "El costo en puntos debe ser un número mayor a 0"}

        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute(
                """INSERT INTO beneficios (empresa_id, titulo, descripcion, costo_puntos)
                   VALUES (%s, %s, %s, %s)""",
                (empresa_id, titulo, descripcion, costo_puntos)
            )
            conexion.commit()
            cursor.close()
            return {"mensaje": "Beneficio creado correctamente"}
        except Exception:
            conexion.rollback()
            logger.exception("Error al crear beneficio")
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

    @staticmethod
    def obtener_beneficios(solo_activos=True):
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            filtro = "WHERE b.activo = TRUE" if solo_activos else ""
            cursor.execute(
                f"""SELECT b.id, b.titulo, b.descripcion, b.costo_puntos, b.activo,
                          e.id, e.nombre, e.logo
                   FROM beneficios b
                   INNER JOIN empresas_recicladoras e ON b.empresa_id = e.id
                   {filtro}
                   ORDER BY b.costo_puntos ASC"""
            )
            filas = cursor.fetchall()
            cursor.close()
            return [{
                "id": f[0], "titulo": f[1], "descripcion": f[2],
                "costo_puntos": f[3], "activo": f[4],
                "empresa_id": f[5], "empresa_nombre": f[6], "empresa_logo": f[7]
            } for f in filas]
        except Exception:
            logger.exception("Error al consultar beneficios")
            return []
        finally:
            liberar(conexion)

    @staticmethod
    def editar_beneficio(beneficio_id, titulo, descripcion, costo_puntos, activo):
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute(
                """UPDATE beneficios SET titulo=%s, descripcion=%s, costo_puntos=%s, activo=%s
                   WHERE id=%s""",
                (titulo, descripcion, costo_puntos, activo, beneficio_id)
            )
            if cursor.rowcount == 0:
                return {"error": "Beneficio no encontrado"}
            conexion.commit()
            cursor.close()
            return {"mensaje": "Beneficio actualizado correctamente"}
        except Exception:
            conexion.rollback()
            logger.exception("Error al editar beneficio")
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

    @staticmethod
    def eliminar_beneficio(beneficio_id):
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute("DELETE FROM beneficios WHERE id=%s", (beneficio_id,))
            if cursor.rowcount == 0:
                return {"error": "Beneficio no encontrado"}
            conexion.commit()
            cursor.close()
            return {"mensaje": "Beneficio eliminado correctamente"}
        except Exception:
            conexion.rollback()
            logger.exception("Error al eliminar beneficio")
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

    @staticmethod
    def canjear_beneficio(usuario_id, beneficio_id):
        conexion = conectar()
        try:
            cursor = conexion.cursor()

            cursor.execute(
                "SELECT titulo, costo_puntos, activo FROM beneficios WHERE id=%s",
                (beneficio_id,)
            )
            beneficio = cursor.fetchone()
            if not beneficio:
                return {"error": "Beneficio no encontrado"}
            titulo, costo_puntos, activo = beneficio
            if not activo:
                return {"error": "Este beneficio ya no está disponible"}

            # Resta atómica: solo descuenta si el usuario todavía tiene suficientes puntos
            # (evita condiciones de carrera si el usuario hace doble clic o dos pestañas a la vez)
            cursor.execute(
                "UPDATE usuarios SET puntos = puntos - %s WHERE id=%s AND puntos >= %s",
                (costo_puntos, usuario_id, costo_puntos)
            )
            if cursor.rowcount == 0:
                conexion.rollback()
                return {"error": "No tienes suficientes puntos para este beneficio"}

            codigo = "ECO-" + secrets.token_hex(4).upper()
            cursor.execute(
                """INSERT INTO canjes (usuario_id, beneficio_id, codigo, puntos_utilizados)
                   VALUES (%s, %s, %s, %s)""",
                (usuario_id, beneficio_id, codigo, costo_puntos)
            )
            conexion.commit()
            cursor.close()
            return {
                "mensaje": f"Canjeaste '{titulo}' correctamente",
                "codigo": codigo,
                "puntos_utilizados": costo_puntos
            }
        except Exception:
            conexion.rollback()
            logger.exception("Error al canjear beneficio")
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

    @staticmethod
    def obtener_mis_canjes(usuario_id):
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute(
                """SELECT c.codigo, c.puntos_utilizados, c.usado, c.fecha_creacion,
                          b.titulo, e.nombre
                   FROM canjes c
                   INNER JOIN beneficios b ON c.beneficio_id = b.id
                   INNER JOIN empresas_recicladoras e ON b.empresa_id = e.id
                   WHERE c.usuario_id = %s
                   ORDER BY c.fecha_creacion DESC""",
                (usuario_id,)
            )
            filas = cursor.fetchall()
            cursor.close()
            return [{
                "codigo": f[0], "puntos_utilizados": f[1], "usado": f[2],
                "fecha": str(f[3]), "beneficio_titulo": f[4], "empresa_nombre": f[5]
            } for f in filas]
        except Exception:
            logger.exception("Error al consultar canjes")
            return []
        finally:
            liberar(conexion)

    @staticmethod
    def verificar_canje(codigo):
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute(
                """SELECT c.usado, c.fecha_creacion, b.titulo, e.nombre
                   FROM canjes c
                   INNER JOIN beneficios b ON c.beneficio_id = b.id
                   INNER JOIN empresas_recicladoras e ON b.empresa_id = e.id
                   WHERE c.codigo = %s""",
                (codigo,)
            )
            fila = cursor.fetchone()
            cursor.close()
            if not fila:
                return {"valido": False, "error": "Código no encontrado"}
            return {
                "valido": True,
                "usado": fila[0],
                "fecha": str(fila[1]),
                "beneficio_titulo": fila[2],
                "empresa_nombre": fila[3]
            }
        except Exception:
            logger.exception("Error al verificar canje")
            return {"valido": False, "error": "Ocurrió un error interno."}
        finally:
            liberar(conexion)

    @staticmethod
    def marcar_canje_usado(codigo):
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute(
                "UPDATE canjes SET usado=TRUE WHERE codigo=%s AND usado=FALSE",
                (codigo,)
            )
            if cursor.rowcount == 0:
                return {"error": "El código no existe o ya fue usado"}
            conexion.commit()
            cursor.close()
            return {"mensaje": "Canje marcado como usado"}
        except Exception:
            conexion.rollback()
            logger.exception("Error al marcar canje como usado")
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

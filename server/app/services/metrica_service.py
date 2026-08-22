from app.database.conexion import conectar, liberar
import logging


KG_ESTIMADO_POR_REPORTE_APROBADO = 2.5


logger = logging.getLogger(__name__)

class MetricaService:

    @staticmethod
    def obtener_metricas():
        conexion = conectar()
        try:
            cursor = conexion.cursor()

            cursor.execute("SELECT estado, COUNT(*) FROM reportes GROUP BY estado")
            por_estado = {fila[0]: fila[1] for fila in cursor.fetchall()}

            cursor.execute(
                "SELECT categoria, COUNT(*) FROM reportes GROUP BY categoria ORDER BY COUNT(*) DESC"
            )
            por_categoria = [{"categoria": f[0], "total": f[1]} for f in cursor.fetchall()]

            cursor.execute(
                "SELECT localidad, COUNT(*) FROM reportes GROUP BY localidad ORDER BY COUNT(*) DESC LIMIT 5"
            )
            por_localidad = [{"localidad": f[0], "total": f[1]} for f in cursor.fetchall()]

            cursor.execute("SELECT COUNT(*) FROM usuarios")
            total_usuarios = cursor.fetchone()[0]

            cursor.execute("SELECT COALESCE(SUM(puntos), 0) FROM usuarios")
            total_puntos = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM empresas_recicladoras")
            total_empresas = cursor.fetchone()[0]

            cursor.close()

            total_reportes = sum(por_estado.values())
            aprobados = por_estado.get('aprobado', 0)
            kg_estimados = round(aprobados * KG_ESTIMADO_POR_REPORTE_APROBADO, 1)

            return {
                "total_reportes": total_reportes,
                "reportes_por_estado": {
                    "pendiente": por_estado.get('pendiente', 0),
                    "aprobado": por_estado.get('aprobado', 0),
                    "rechazado": por_estado.get('rechazado', 0)
                },
                "reportes_por_categoria": por_categoria,
                "reportes_por_localidad": por_localidad,
                "total_usuarios": total_usuarios,
                "total_puntos_otorgados": int(total_puntos),
                "total_empresas": total_empresas,
                "kg_estimados_reciclados": kg_estimados
            }
        except Exception as e:
            logger.exception("Error inesperado en la operación")
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

from app.database.conexion import conectar, liberar
from app.models.empresa import Empresa
import logging


TIPOS_MATERIAL_VALIDOS = [
    'papel', 'plastico', 'vidrio', 'metal',
    'organico', 'electronico', 'textil', 'otro'
]


logger = logging.getLogger(__name__)

class EmpresaService:

    @staticmethod
    def crear_empresa(nombre, tipo_material, direccion, localidad,
                       telefono=None, correo_contacto=None,
                       latitud=None, longitud=None):
        if tipo_material not in TIPOS_MATERIAL_VALIDOS:
            return {"error": f"Tipo de material inválido. Debe ser uno de: {', '.join(TIPOS_MATERIAL_VALIDOS)}"}

        try:
            empresa = Empresa(nombre, tipo_material, direccion, localidad,
                               telefono, correo_contacto, latitud, longitud)
        except ValueError as e:
            return {"error": str(e)}

        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute(
                """INSERT INTO empresas_recicladoras
                   (nombre, tipo_material, direccion, localidad, telefono, correo_contacto, latitud, longitud)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                (empresa.get_nombre(), empresa.get_tipo_material(), empresa.get_direccion(),
                 empresa.get_localidad(), empresa.get_telefono(), empresa.get_correo_contacto(),
                 latitud, longitud)
            )
            conexion.commit()
            cursor.close()
            return {"mensaje": "Empresa registrada correctamente"}
        except Exception as e:
            logger.exception("Error al crear empresa")
            conexion.rollback()
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

    @staticmethod
    def obtener_empresas():
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute(
                """SELECT id, nombre, tipo_material, direccion, localidad,
                          telefono, correo_contacto, latitud, longitud, fecha_creacion
                   FROM empresas_recicladoras
                   ORDER BY nombre ASC"""
            )
            empresas = cursor.fetchall()
            cursor.close()
            return [{
                "id": e[0], "nombre": e[1], "tipo_material": e[2],
                "direccion": e[3], "localidad": e[4], "telefono": e[5],
                "correo_contacto": e[6],
                "latitud": float(e[7]) if e[7] else None,
                "longitud": float(e[8]) if e[8] else None,
                "fecha_creacion": str(e[9])
            } for e in empresas]
        except Exception:
            return []
        finally:
            liberar(conexion)

    @staticmethod
    def editar_empresa(empresa_id, nombre, tipo_material, direccion, localidad,
                        telefono=None, correo_contacto=None,
                        latitud=None, longitud=None):
        if tipo_material not in TIPOS_MATERIAL_VALIDOS:
            return {"error": f"Tipo de material inválido. Debe ser uno de: {', '.join(TIPOS_MATERIAL_VALIDOS)}"}

        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute(
                """UPDATE empresas_recicladoras
                   SET nombre=%s, tipo_material=%s, direccion=%s, localidad=%s,
                       telefono=%s, correo_contacto=%s, latitud=%s, longitud=%s
                   WHERE id=%s""",
                (nombre, tipo_material, direccion, localidad,
                 telefono, correo_contacto, latitud, longitud, empresa_id)
            )
            if cursor.rowcount == 0:
                return {"error": "Empresa no encontrada"}
            conexion.commit()
            cursor.close()
            return {"mensaje": "Empresa actualizada correctamente"}
        except Exception as e:
            logger.exception("Error inesperado en la operación")
            conexion.rollback()
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

    @staticmethod
    def eliminar_empresa(empresa_id):
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute("DELETE FROM empresas_recicladoras WHERE id=%s", (empresa_id,))
            if cursor.rowcount == 0:
                return {"error": "Empresa no encontrada"}
            conexion.commit()
            cursor.close()
            return {"mensaje": "Empresa eliminada correctamente"}
        except Exception as e:
            logger.exception("Error inesperado en la operación")
            conexion.rollback()
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

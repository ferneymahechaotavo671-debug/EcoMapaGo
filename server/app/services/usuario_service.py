import jwt
import datetime
import secrets
import hashlib
from flask import current_app
from werkzeug.security import generate_password_hash, check_password_hash
import logging


from app.models.usuario import Usuario
from app.database.conexion import conectar, liberar
from app.utils.validator import Validator


logger = logging.getLogger(__name__)

class UsuarioService:

    @staticmethod
    def crear_usuario(nombre, correo, password):
        if not Validator.validar_texto(nombre):
            return {"error": "Nombre inválido"}
        if not Validator.validar_correo(correo):
            return {"error": "Correo inválido"}
        if not Validator.validar_password(password):
            return {"error": "La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número"}

        try:
            usuario = Usuario(nombre, correo, password)
        except ValueError as e:
            return {"error": str(e)}

        password_hash = generate_password_hash(password)
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            # Verificar si correo ya existe
            cursor.execute("SELECT id FROM usuarios WHERE correo = %s", (correo,))
            if cursor.fetchone():
                return {"error": "El correo ya está registrado"}

            cursor.execute(
                "INSERT INTO usuarios (nombre, correo, password, rol) VALUES (%s, %s, %s, %s)",
                (usuario.get_nombre(), usuario.get_correo(), password_hash, "usuario")
            )
            conexion.commit()
            cursor.close()
            return {"mensaje": "Usuario creado correctamente"}
        except Exception as e:
            logger.exception("Error al crear usuario")
            conexion.rollback()
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

    @staticmethod
    def obtener_usuarios():
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute("SELECT id, nombre, correo, rol FROM usuarios ORDER BY id DESC")
            usuarios = cursor.fetchall()
            cursor.close()
            return [{"id": u[0], "nombre": u[1], "correo": u[2], "rol": u[3]} for u in usuarios]
        except Exception as e:
            logger.exception("Error al consultar datos")
            return []
        finally:
            liberar(conexion)

    @staticmethod
    def login(correo, password):
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute(
                "SELECT id, nombre, correo, password, rol FROM usuarios WHERE correo = %s",
                (correo,)
            )
            usuario = cursor.fetchone()
            cursor.close()
        except Exception as e:
            logger.exception("Error de conexión al validar login")
            return {"error": "Error de conexión"}
        finally:
            liberar(conexion)

        if not usuario:
            return {"error": "Correo o contraseña incorrectos"}

        if not check_password_hash(usuario[3], password):
            return {"error": "Correo o contraseña incorrectos"}

        token = jwt.encode({
            "id": usuario[0],
            "nombre": usuario[1],
            "correo": usuario[2],
            "rol": usuario[4],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=5)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')

        return {
            "token": token,
            "usuario": {
                "id": usuario[0],
                "nombre": usuario[1],
                "correo": usuario[2],
                "rol": usuario[4]
            }
        }

    @staticmethod
    def obtener_perfil(usuario_id):
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute(
                "SELECT id, nombre, correo, rol, puntos FROM usuarios WHERE id = %s",
                (usuario_id,)
            )
            usuario = cursor.fetchone()
            cursor.close()
            if not usuario:
                return {"error": "Usuario no encontrado"}
            return {
                "id": usuario[0],
                "nombre": usuario[1],
                "correo": usuario[2],
                "rol": usuario[3],
                "puntos": usuario[4] or 0
            }
        except Exception as e:
            logger.exception("Error inesperado en la operación")
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

    TOKEN_RECUPERACION_MINUTOS = 30

    @staticmethod
    def solicitar_recuperacion(correo):
        mensaje_generico = {"mensaje": "Si el correo existe, recibirás instrucciones de recuperación"}
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute("SELECT id FROM usuarios WHERE correo=%s", (correo,))
            fila = cursor.fetchone()
            if not fila:
                # No revelar si el correo existe o no (evita enumeración de usuarios)
                return mensaje_generico

            usuario_id = fila[0]
            token = secrets.token_urlsafe(32)
            token_hash = hashlib.sha256(token.encode()).hexdigest()
            expira_en = datetime.datetime.utcnow() + datetime.timedelta(
                minutes=UsuarioService.TOKEN_RECUPERACION_MINUTOS
            )

            cursor.execute(
                """INSERT INTO restablecimientos_password (usuario_id, token_hash, expira_en)
                   VALUES (%s, %s, %s)""",
                (usuario_id, token_hash, expira_en)
            )
            conexion.commit()
            cursor.close()

            # NOTA: no hay proveedor de correo configurado todavía (ej. Resend, SendGrid).
            # Mientras tanto, el enlace queda registrado en el log del servidor para pruebas.
            # En producción, este bloque debe reemplazarse por el envío real del correo.
            frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:5173')
            enlace = f"{frontend_url}/restablecer-password?token={token}"
            logger.info(f"[recuperacion-password] usuario_id={usuario_id} enlace={enlace}")

            return mensaje_generico
        except Exception:
            conexion.rollback()
            logger.exception("Error al solicitar recuperación de contraseña")
            return mensaje_generico
        finally:
            liberar(conexion)

    @staticmethod
    def restablecer_password(token, password_nueva):
        if not Validator.validar_password(password_nueva):
            return {"error": "La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número"}

        token_hash = hashlib.sha256(token.encode()).hexdigest()
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute(
                """SELECT id, usuario_id, expira_en, usado FROM restablecimientos_password
                   WHERE token_hash=%s ORDER BY id DESC LIMIT 1""",
                (token_hash,)
            )
            fila = cursor.fetchone()
            if not fila:
                return {"error": "El enlace de recuperación no es válido"}

            reset_id, usuario_id, expira_en, usado = fila
            if usado:
                return {"error": "Este enlace ya fue utilizado"}
            if expira_en < datetime.datetime.utcnow():
                return {"error": "El enlace de recuperación expiró. Solicita uno nuevo"}

            nuevo_hash = generate_password_hash(password_nueva)
            cursor.execute("UPDATE usuarios SET password=%s WHERE id=%s", (nuevo_hash, usuario_id))
            cursor.execute("UPDATE restablecimientos_password SET usado=TRUE WHERE id=%s", (reset_id,))
            conexion.commit()
            cursor.close()
            return {"mensaje": "Contraseña actualizada correctamente"}
        except Exception:
            conexion.rollback()
            logger.exception("Error al restablecer contraseña")
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

    @staticmethod
    def actualizar_perfil(usuario_id, nombre, password_actual, password_nueva):
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute(
                "SELECT id, password FROM usuarios WHERE id = %s",
                (usuario_id,)
            )
            usuario = cursor.fetchone()
            if not usuario:
                return {"error": "Usuario no encontrado"}

            if password_nueva:
                if not check_password_hash(usuario[1], password_actual):
                    return {"error": "Contraseña actual incorrecta"}
                if not Validator.validar_password(password_nueva):
                    return {"error": "La nueva contraseña no cumple los requisitos"}
                nuevo_hash = generate_password_hash(password_nueva)
                cursor.execute(
                    "UPDATE usuarios SET nombre = %s, password = %s WHERE id = %s",
                    (nombre, nuevo_hash, usuario_id)
                )
            else:
                cursor.execute(
                    "UPDATE usuarios SET nombre = %s WHERE id = %s",
                    (nombre, usuario_id)
                )

            conexion.commit()
            cursor.close()
            return {"mensaje": "Perfil actualizado correctamente"}
        except Exception as e:
            logger.exception("Error inesperado en la operación")
            conexion.rollback()
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

    @staticmethod
    def cambiar_rol(usuario_id, rol):
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute("UPDATE usuarios SET rol=%s WHERE id=%s", (rol, usuario_id))
            if cursor.rowcount == 0:
                return {"error": "Usuario no encontrado"}
            conexion.commit()
            cursor.close()
            return {"mensaje": f"Rol actualizado a '{rol}'"}
        except Exception as e:
            logger.exception("Error inesperado en la operación")
            conexion.rollback()
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

    @staticmethod
    def eliminar_usuario(usuario_id):
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute("DELETE FROM usuarios WHERE id=%s", (usuario_id,))
            if cursor.rowcount == 0:
                return {"error": "Usuario no encontrado"}
            conexion.commit()
            cursor.close()
            return {"mensaje": "Usuario eliminado"}
        except Exception as e:
            logger.exception("Error inesperado en la operación")
            conexion.rollback()
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

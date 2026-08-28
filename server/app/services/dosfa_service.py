import base64
import io
import logging

import pyotp
import qrcode
from werkzeug.security import check_password_hash

from app.database.conexion import conectar, liberar
from app.utils.cifrado import encriptar, desencriptar

logger = logging.getLogger(__name__)


class DosFAService:

    @staticmethod
    def iniciar_configuracion(usuario_id, correo):
        """Genera un nuevo secreto TOTP (aún no habilitado) y el QR para escanear."""
        secreto = pyotp.random_base32()
        secreto_cifrado = encriptar(secreto)

        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute(
                "UPDATE usuarios SET totp_secret=%s, totp_habilitado=FALSE WHERE id=%s",
                (secreto_cifrado, usuario_id)
            )
            conexion.commit()
            cursor.close()
        except Exception:
            conexion.rollback()
            logger.exception("Error al iniciar configuración 2FA")
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

        uri = pyotp.totp.TOTP(secreto).provisioning_uri(name=correo, issuer_name="EcoMapaGo")

        qr = qrcode.make(uri)
        buffer = io.BytesIO()
        qr.save(buffer, format="PNG")
        qr_base64 = base64.b64encode(buffer.getvalue()).decode()

        return {
            "secreto_manual": secreto,
            "qr": f"data:image/png;base64,{qr_base64}"
        }

    @staticmethod
    def activar(usuario_id, codigo):
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute("SELECT totp_secret FROM usuarios WHERE id=%s", (usuario_id,))
            fila = cursor.fetchone()
            if not fila or not fila[0]:
                return {"error": "Primero debes iniciar la configuración de 2FA"}

            secreto = desencriptar(fila[0])
            totp = pyotp.TOTP(secreto)
            if not totp.verify(codigo, valid_window=1):
                return {"error": "El código no es válido. Verifica la hora de tu dispositivo e intenta de nuevo."}

            cursor.execute("UPDATE usuarios SET totp_habilitado=TRUE WHERE id=%s", (usuario_id,))
            conexion.commit()
            cursor.close()
            return {"mensaje": "Verificación en dos pasos activada correctamente"}
        except Exception:
            conexion.rollback()
            logger.exception("Error al activar 2FA")
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

    @staticmethod
    def desactivar(usuario_id, password_actual):
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute("SELECT password FROM usuarios WHERE id=%s", (usuario_id,))
            fila = cursor.fetchone()
            if not fila:
                return {"error": "Usuario no encontrado"}
            if not check_password_hash(fila[0], password_actual):
                return {"error": "Contraseña incorrecta"}

            cursor.execute(
                "UPDATE usuarios SET totp_secret=NULL, totp_habilitado=FALSE WHERE id=%s",
                (usuario_id,)
            )
            conexion.commit()
            cursor.close()
            return {"mensaje": "Verificación en dos pasos desactivada"}
        except Exception:
            conexion.rollback()
            logger.exception("Error al desactivar 2FA")
            return {"error": "Ocurrió un error interno. Intenta de nuevo más tarde."}
        finally:
            liberar(conexion)

    @staticmethod
    def verificar_codigo_login(usuario_id, codigo):
        """Usado durante el login: valida el código TOTP de un usuario con 2FA habilitado."""
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute(
                "SELECT totp_secret, totp_habilitado FROM usuarios WHERE id=%s",
                (usuario_id,)
            )
            fila = cursor.fetchone()
            cursor.close()
            if not fila or not fila[1] or not fila[0]:
                return False
            secreto = desencriptar(fila[0])
            return pyotp.TOTP(secreto).verify(codigo, valid_window=1)
        except Exception:
            logger.exception("Error al verificar código 2FA en login")
            return False
        finally:
            liberar(conexion)

    @staticmethod
    def esta_habilitado(usuario_id):
        conexion = conectar()
        try:
            cursor = conexion.cursor()
            cursor.execute("SELECT totp_habilitado FROM usuarios WHERE id=%s", (usuario_id,))
            fila = cursor.fetchone()
            cursor.close()
            return bool(fila and fila[0])
        except Exception:
            logger.exception("Error al consultar estado de 2FA")
            return False
        finally:
            liberar(conexion)

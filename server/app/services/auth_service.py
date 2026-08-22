import jwt
import os

from datetime import datetime, timedelta
from werkzeug.security import check_password_hash

from app.database.conexion import conectar


class AuthService:

    @staticmethod
    def login(correo, password):

        conexion = conectar()
        cursor = conexion.cursor()

        query = """
        SELECT id, nombre, correo, password, rol
        FROM usuarios
        WHERE correo = %s
        """

        cursor.execute(query, (correo,))
        usuario = cursor.fetchone()

        cursor.close()
        conexion.close()

        if not usuario:
            return {
                "error": "Usuario no encontrado"
            }, 404

        password_correcta = check_password_hash(
            usuario[3],
            password
        )

        if not password_correcta:
            return {
                "error": "Contraseña incorrecta"
            }, 401

        token = jwt.encode({
            "id": usuario[0],
            "nombre": usuario[1],
            "correo": usuario[2],
            "rol": usuario[4],
            "exp": datetime.utcnow() + timedelta(hours=5)
        },
        os.getenv("SECRET_KEY"),
        algorithm="HS256")

        return {
            "mensaje": "Login exitoso",
            "token": token,
            "usuario": {
                "id": usuario[0],
                "nombre": usuario[1],
                "correo": usuario[2],
                "rol": usuario[4]
            }
        }, 200
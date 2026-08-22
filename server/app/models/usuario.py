import re

class Usuario:

    def __init__(self, nombre, correo, password):
        self._nombre = None
        self._correo = None
        self._password = None

        self.set_nombre(nombre)
        self.set_correo(correo)
        self.set_password(password)

    # =========================
    # GETTERS
    # =========================

    def get_nombre(self):
        return self._nombre

    def get_correo(self):
        return self._correo

    def get_password(self):
        return self._password

    # =========================
    # SETTERS
    # =========================

    def set_nombre(self, nombre):
        if re.match(r'^[A-Za-zÁÉÍÓÚáéíóúñÑ ]{3,50}$', nombre):
            self._nombre = nombre
        else:
            raise ValueError("Nombre inválido")

    def set_correo(self, correo):
        if re.match(r'^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$', correo):
            self._correo = correo
        else:
            raise ValueError("Correo inválido")

    def set_password(self, password):
        if re.match(r'^(?=.*[A-Z])(?=.*\d).{8,}$', password):
            self._password = password
        else:
            raise ValueError(
                "La contraseña debe tener 8 caracteres, una mayúscula y un número"
            )

    # =========================
    # MÉTODOS
    # =========================

    def mostrar_datos(self):
        return {
            "nombre": self._nombre,
            "correo": self._correo
        }
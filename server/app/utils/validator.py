import re


class Validator:

    @staticmethod
    def validar_correo(correo):

        regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'

        return re.match(regex, correo)

    @staticmethod
    def validar_password(password):
        """Devuelve True/False. Para el detalle de qué falta, usar evaluar_password()."""
        return Validator.evaluar_password(password)["valida"]

    @staticmethod
    def evaluar_password(password):
        """Valida una contraseña robusta y devuelve qué requisitos le faltan.
        Requisitos: minimo 10 caracteres, 1 mayuscula, 1 minuscula, 1 numero, 1 simbolo."""
        password = password or ""
        errores = []

        if len(password) < 10:
            errores.append("mínimo 10 caracteres")
        if not re.search(r'[A-Z]', password):
            errores.append("al menos 1 mayúscula")
        if not re.search(r'[a-z]', password):
            errores.append("al menos 1 minúscula")
        if not re.search(r'\d', password):
            errores.append("al menos 1 número")
        if not re.search(r'[!@#$%^&*()_\-+=\[\]{};:\'",.<>/?\\|`~]', password):
            errores.append("al menos 1 símbolo (ej: !@#$%&*)")

        return {"valida": len(errores) == 0, "errores": errores}

    @staticmethod
    def validar_texto(texto):

        return len(texto.strip()) > 3

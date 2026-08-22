import re


class Validator:

    @staticmethod
    def validar_correo(correo):

        regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'

        return re.match(regex, correo)

    @staticmethod
    def validar_password(password):

        regex = r'^(?=.*[A-Z])(?=.*\d).{8,}$'

        return re.match(regex, password)

    @staticmethod
    def validar_texto(texto):

        return len(texto.strip()) > 3
from app.models.usuario import Usuario

class Admin(Usuario):

    def __init__(self, nombre, correo, password, permisos):
        super().__init__(nombre, correo, password)
        self._permisos = permisos

    def get_permisos(self):
        return self._permisos

    def mostrar_admin(self):
        return {
            "nombre": self.get_nombre(),
            "correo": self.get_correo(),
            "permisos": self._permisos
        }
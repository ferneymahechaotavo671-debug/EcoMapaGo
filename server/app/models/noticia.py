class Noticia:

    def __init__(
        self,
        titulo,
        descripcion,
        imagen
    ):

        self.__titulo = titulo
        self.__descripcion = descripcion
        self.__imagen = imagen

    # GETTERS

    def get_titulo(self):
        return self.__titulo

    def get_descripcion(self):
        return self.__descripcion

    def get_imagen(self):
        return self.__imagen

    # SETTERS

    def set_titulo(self, titulo):
        self.__titulo = titulo

    def set_descripcion(self, descripcion):
        self.__descripcion = descripcion

    def set_imagen(self, imagen):
        self.__imagen = imagen
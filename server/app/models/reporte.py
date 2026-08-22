class Reporte:

    def __init__(
        self,
        titulo,
        descripcion,
        localidad,
        categoria,
        usuario_id,
        latitud,
        longitud
    ):

        self.__titulo = titulo
        self.__descripcion = descripcion
        self.__localidad = localidad
        self.__categoria = categoria
        self.__usuario_id = usuario_id
        self.__latitud = latitud
        self.__longitud = longitud

    # GETTERS

    def get_titulo(self):
        return self.__titulo

    def get_descripcion(self):
        return self.__descripcion

    def get_localidad(self):
        return self.__localidad

    def get_categoria(self):
        return self.__categoria

    def get_usuario_id(self):
        return self.__usuario_id

    def get_latitud(self):
        return self.__latitud

    def get_longitud(self):
        return self.__longitud

    # SETTERS

    def set_titulo(self, titulo):
        self.__titulo = titulo

    def set_descripcion(self, descripcion):
        self.__descripcion = descripcion

    def set_localidad(self, localidad):
        self.__localidad = localidad

    def set_categoria(self, categoria):
        self.__categoria = categoria

    def set_latitud(self, latitud):
        self.__latitud = latitud

    def set_longitud(self, longitud):
        self.__longitud = longitud
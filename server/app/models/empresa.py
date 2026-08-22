class Empresa:

    def __init__(
        self,
        nombre,
        tipo_material,
        direccion,
        localidad,
        telefono=None,
        correo_contacto=None,
        latitud=None,
        longitud=None
    ):
        if not nombre or len(nombre.strip()) < 3:
            raise ValueError("El nombre de la empresa no es válido")
        if not direccion or len(direccion.strip()) < 3:
            raise ValueError("La dirección no es válida")

        self.__nombre = nombre
        self.__tipo_material = tipo_material
        self.__direccion = direccion
        self.__localidad = localidad
        self.__telefono = telefono
        self.__correo_contacto = correo_contacto
        self.__latitud = latitud
        self.__longitud = longitud

    # GETTERS

    def get_nombre(self):
        return self.__nombre

    def get_tipo_material(self):
        return self.__tipo_material

    def get_direccion(self):
        return self.__direccion

    def get_localidad(self):
        return self.__localidad

    def get_telefono(self):
        return self.__telefono

    def get_correo_contacto(self):
        return self.__correo_contacto

    def get_latitud(self):
        return self.__latitud

    def get_longitud(self):
        return self.__longitud

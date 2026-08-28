import os
from cryptography.fernet import Fernet

_fernet = None


def _obtener_fernet():
    global _fernet
    if _fernet is None:
        clave = os.getenv("ENCRYPTION_KEY")
        if not clave:
            raise RuntimeError(
                "La variable de entorno ENCRYPTION_KEY es obligatoria para cifrar datos sensibles "
                "(como el secreto de la verificación en dos pasos). Genera una con: "
                "python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\""
            )
        _fernet = Fernet(clave.encode())
    return _fernet


def encriptar(texto_plano):
    return _obtener_fernet().encrypt(texto_plano.encode()).decode()


def desencriptar(texto_cifrado):
    return _obtener_fernet().decrypt(texto_cifrado.encode()).decode()

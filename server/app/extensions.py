from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Límite global por IP para TODOS los endpoints (punto 11). Los endpoints sensibles
# (login, registro, canje...) añaden límites propios más estrictos con @limiter.limit(...).
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["300 per minute", "5000 per day"],
)

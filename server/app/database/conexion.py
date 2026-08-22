import os
import psycopg2
from psycopg2 import pool

_pool = None

def get_pool():
    global _pool
    if _pool is None:
        database_url = os.getenv("DATABASE_URL")

        if database_url:
            # Conexión por URL (Supabase / Railway)
            _pool = psycopg2.pool.SimpleConnectionPool(
                1, 10,
                database_url,
                sslmode='require'
            )
        else:
            # Conexión por variables separadas (PostgreSQL local)
            _pool = psycopg2.pool.SimpleConnectionPool(
                1, 10,
                host=os.getenv("DB_HOST", "localhost"),
                database=os.getenv("DB_NAME"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASSWORD"),
                port=int(os.getenv("DB_PORT", 5432))
            )
    return _pool

def conectar():
    return get_pool().getconn()

def liberar(conexion):
    get_pool().putconn(conexion)

NIVELES = [
    {"umbral": 0, "nombre": "Semilla", "icono": "🌱"},
    {"umbral": 50, "nombre": "Reciclador Activo", "icono": "♻️"},
    {"umbral": 150, "nombre": "Guardián Ambiental", "icono": "🌳"},
    {"umbral": 300, "nombre": "Héroe Verde", "icono": "🌍"},
    {"umbral": 600, "nombre": "Leyenda EcoMapaGo", "icono": "🏆"},
]


def calcular_nivel(puntos):
    puntos = puntos or 0
    actual = NIVELES[0]
    siguiente = None

    for i, nivel in enumerate(NIVELES):
        if puntos >= nivel["umbral"]:
            actual = nivel
            siguiente = NIVELES[i + 1] if i + 1 < len(NIVELES) else None
        else:
            break

    if siguiente:
        rango = siguiente["umbral"] - actual["umbral"]
        avance = puntos - actual["umbral"]
        progreso = round(min(avance / rango, 1) * 100) if rango > 0 else 100
    else:
        progreso = 100

    return {
        "nombre": actual["nombre"],
        "icono": actual["icono"],
        "puntos_actuales": puntos,
        "siguiente_nombre": siguiente["nombre"] if siguiente else None,
        "puntos_siguiente_nivel": siguiente["umbral"] if siguiente else None,
        "progreso_porcentaje": progreso
    }

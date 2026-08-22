import { useEffect, useState } from 'react'

import api from '../services/api'

import Sidebar from '../components/Sidebar'
import Mapa from '../components/Mapa'

function Dashboard() {

    const [stats,setStats] = useState({

        reportes:0,
        noticias:0,
        usuarios:0,
        puntos:0

    })

    useEffect(()=>{

        cargarStats()

        // NUEVO: actualización automática cada 10 segundos
        const interval = setInterval(() => {
            cargarStats()
        }, 10000)

        // NUEVO: limpiar intervalo al salir del componente
        return () => clearInterval(interval)

    },[])

    const cargarStats = async() => {

        const token = localStorage.getItem('token')

        try{

            const [r1,r2,r3,r4] = await Promise.all([

                api.get('/reportes',{

                    headers:{
                        Authorization:`Bearer ${token}`
                    }

                }),

                api.get('/noticias'),

                api.get('/usuarios',{

                    headers:{
                        Authorization:`Bearer ${token}`
                    }

                }).catch(() => ({ data: [] })),

                api.get('/perfil',{

                    headers:{
                        Authorization:`Bearer ${token}`
                    }

                })

            ])

            setStats({

                reportes:r1.data.length,
                noticias:r2.data.length,
                usuarios:r3.data.length,
                puntos:r4.data.puntos || 0

            })

        } catch(error){

            console.log(error)

        }

    }

    return(

        <div className="dashboard-layout">

            <Sidebar />

            <div className="dashboard-content">

                <div className="dashboard-header">

                    <h1>
                        Bienvenido a EcoMapaGo 🌍
                    </h1>

                    <p>
                        Plataforma inteligente de reportes ambientales.
                    </p>

                </div>

                <div className="stats-grid">

                    <div className="stat-card">

                        <h2>
                            {stats.reportes}
                        </h2>

                        <span>
                            Reportes registrados
                        </span>

                    </div>

                    <div className="stat-card">

                        <h2>
                            {stats.noticias}
                        </h2>

                        <span>
                            Noticias publicadas
                        </span>

                    </div>

                    <div className="stat-card">

                        <h2>
                            {stats.usuarios}
                        </h2>

                        <span>
                            Usuarios activos
                        </span>

                    </div>

                    <div className="stat-card">

                        <h2>
                            🏆 {stats.puntos}
                        </h2>

                        <span>
                            Mis puntos EcoMapaGo
                        </span>

                    </div>

                </div>

                <div className="map-section">

                    <Mapa />

                </div>

            </div>

        </div>

    )

}

export default Dashboard
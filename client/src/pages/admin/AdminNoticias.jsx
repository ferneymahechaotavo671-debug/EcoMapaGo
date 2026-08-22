import { useEffect, useState } from 'react'

import Sidebar from '../../components/Sidebar'

import api from '../../services/api'

import '../../styles/admin.css'

function AdminNoticias(){

    const [noticias, setNoticias] = useState([])

    const [form, setForm] = useState({

        titulo:'',
        descripcion:'',
        imagen:''

    })

    useEffect(()=>{

        obtenerNoticias()

    },[])

    const obtenerNoticias = async() => {

        try{

            const respuesta = await api.get('/noticias')

            setNoticias(respuesta.data)

        }catch(error){

            console.log(error)

        }

    }

    const crearNoticia = async() => {

        if(
            !form.titulo ||
            !form.descripcion ||
            !form.imagen
        ){
            alert('Completa todos los campos')
            return
        }

        try{

            const token = localStorage.getItem('token')

            await api.post(

                '/noticias',

                form,

                {
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                }

            )

            alert('Noticia creada correctamente')

            setForm({
                titulo:'',
                descripcion:'',
                imagen:''
            })

            obtenerNoticias()

        }catch(error){

            console.log(error)

            alert('Error al crear noticia')

        }

    }

    const eliminarNoticia = async(id) => {

        const confirmar = window.confirm(
            '¿Deseas eliminar esta noticia?'
        )

        if(!confirmar) return

        try{

            const token = localStorage.getItem('token')

            await api.delete(

                `/noticias/${id}`,

                {
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                }

            )

            alert('Noticia eliminada')

            obtenerNoticias()

        }catch(error){

            console.log(error)

        }

    }

    return(

        <div className="admin-layout">

            <Sidebar />

            <div className="admin-container">

                <div className="admin-content">

                    <h1 className="admin-title">
                        📰 Gestionar Noticias
                    </h1>

                    <div className="admin-form-card">

                        <h2>
                            Crear Nueva Noticia
                        </h2>

                        <p className="admin-subtitle">
                            Publica noticias ambientales para los usuarios.
                        </p>

                        <input
                            type="text"
                            placeholder="Título de la noticia"
                            value={form.titulo}
                            onChange={(e)=>setForm({
                                ...form,
                                titulo:e.target.value
                            })}
                        />

                        <textarea
                            placeholder="Descripción"
                            value={form.descripcion}
                            onChange={(e)=>setForm({
                                ...form,
                                descripcion:e.target.value
                            })}
                        />

                        <input
                            type="text"
                            placeholder="URL de la imagen"
                            value={form.imagen}
                            onChange={(e)=>setForm({
                                ...form,
                                imagen:e.target.value
                            })}
                        />

                        <button
                            className="admin-primary-btn"
                            onClick={crearNoticia}
                        >
                            ➕ Crear Noticia
                        </button>

                    </div>

                    <div className="admin-grid">

                        {noticias.map((noticia)=>(

                            <div
                                className="admin-card"
                                key={noticia.id}
                            >

                                <img
                                    src={noticia.imagen}
                                    alt=""
                                    className="admin-image"
                                />

                                <h2>
                                    {noticia.titulo}
                                </h2>

                                <p>
                                    {noticia.descripcion}
                                </p>

                                <button
                                    className="admin-danger-btn"
                                    onClick={()=>eliminarNoticia(noticia.id)}
                                >
                                    🗑️ Eliminar
                                </button>

                            </div>

                        ))}

                    </div>

                </div>

            </div>

        </div>

    )

}

export default AdminNoticias
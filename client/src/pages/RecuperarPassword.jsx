import { useState } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'

function RecuperarPassword() {

    const [correo,setCorreo] = useState('')

    const recuperar = async(e)=>{

        e.preventDefault()

        try{

            await api.post(
                '/recuperar-password',
                {correo}
            )

            alert(
                'Se envió un enlace a tu correo'
            )

        }catch(error){

            alert(
                'No fue posible recuperar la contraseña'
            )

        }

    }

    return(

        <div style={{
            minHeight:'100vh',
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
            background:'linear-gradient(135deg,#d8f3dc,#f4f7f5)'
        }}>

            <form
                onSubmit={recuperar}
                className="card"
                style={{
                    width:'400px'
                }}
            >

                <h1>Recuperar contraseña 🔑</h1>

                <input
                    type="email"
                    placeholder="Correo"
                    value={correo}
                    onChange={(e)=>setCorreo(e.target.value)}
                />

                <button
                    type="submit"
                    style={{
                        width:'100%',
                        padding:'15px',
                        background:'#2d6a4f',
                        color:'white',
                        border:'none',
                        borderRadius:'12px',
                        marginTop:'20px'
                    }}
                >
                    Recuperar
                </button>

                <div style={{
    marginTop:'20px',
    textAlign:'center'
}}>

    <Link
        to="/"
        style={{
            color:'#2e7d32',
            fontWeight:'bold',
            textDecoration:'none'
        }}
    >
        ← Volver al Login
    </Link>

</div>

            </form>

        </div>

    )

}

export default RecuperarPassword
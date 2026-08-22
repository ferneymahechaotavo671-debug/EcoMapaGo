function LoadingScreen(){

    return(

        <div style={{

            position:'fixed',
            inset:'0',

            background:'rgba(255,255,255,0.7)',

            display:'flex',

            justifyContent:'center',
            alignItems:'center',

            zIndex:'99999',

            backdropFilter:'blur(6px)'

        }}>

            <div style={{

                padding:'25px 35px',

                background:'white',

                borderRadius:'20px',

                fontWeight:'bold',

                boxShadow:'0 5px 20px rgba(0,0,0,0.1)'

            }}>

                🌍 Cargando EcoMapaGo...

            </div>

        </div>

    )

}

export default LoadingScreen
import React, { useState, useEffect } from 'react';
import Lolly from '../components/lolly';
import { API } from 'aws-amplify'
import { getLolly } from '../graphql/queries'
import Header from '../components/header/header';
const style = require('../styles/main.module.css');
import { Container } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import Loader from '../components/loader'
import { navigate } from 'gatsby';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
}));

interface lolly {
    flavourTop    : string
    flavourMiddle : string
    flavourBottom : string
    message       : string
    recipientName : string
    senderName    : string
    lollyPath     : string
}

interface incomingData {
    data: {
        getLolly: lolly
    }
}

function showLolly({location}) {
    // console.log("location", location)
    
    const id = location.search

    const lollyPath = id.slice(4)

    const [todoData, setTodoData] = useState<incomingData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchLolly = async () => {


       try{
            const data = await API.graphql({
                query: getLolly,
                variables: {
                    lollyPath: lollyPath
                }  
            })
            
            setTodoData(data as incomingData)
            setLoading(false)
            // console.log("data", data)
       }
       catch(e){
           console.log(e)
       }
        
    }

    // console.log("todoData", todoData)

    useEffect(() => {
        fetchLolly()
      }, [])

    const classes = useStyles();

   

    return (
        <div>
           
            <Header />

            <div>

            {loading? (<div className={style.loader} ><Loader /></div>):(<div>
                <Container maxWidth='md' >
                    
                    <div className={style.showlolly_main_div} >
                        <div>
                        <Lolly fillLollyTop={todoData.data.getLolly.flavourTop} fillLollyBottom={todoData.data.getLolly.flavourBottom} fillLollyMiddle={todoData.data.getLolly.flavourMiddle} />
                        </div>
                        <div className={style.path_msg_div} >
                            <p style={{color:'white', textAlign:'center', fontSize:'18px'}} >Your lolly is freezing. Share it with this link:</p>
                        <div className={style.path_msg_link} >
                             <pre>{location.origin}/showLolly?id/{todoData.data.getLolly.lollyPath}</pre>
                        </div>
                        <div className={style.message_div} >
                           <p className={style.show_recipient_name} >{todoData.data.getLolly.recipientName}</p>
                           <p className={style.show_get_message} >{todoData.data.getLolly.message}</p>
                           <p className={style.show_sender_name} >{`___ ${todoData.data.getLolly.senderName}`}</p>
                        </div>
                        </div>
                      
 
                    </div>
                    <div className={style.show_lolly_para} >
                      <p>{todoData.data.getLolly.senderName}</p>
                        <span><p>made this virtual lollipop for you. You can <span style={{textDecoration:'underline', color:'purple',fontSize:'17px', cursor:'pointer'}} onClick={()=> {navigate('/createNew/')}} >make your own</span> to send to a friend who deserve some sugary treat which won't rot their teeth...</p></span>
                    </div>
                    
 
                 </Container>
            </div>)}
            </div>

        </div>
    )
}

export default showLolly
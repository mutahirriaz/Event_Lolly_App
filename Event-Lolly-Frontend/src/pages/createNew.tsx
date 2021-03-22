import React, { useEffect, useState } from 'react'
import Header from '../components/header/header';
import Lolly from '../components/lolly';
import { TextField, Button, Container } from '@material-ui/core';
import { navigate } from 'gatsby';
import { addLolly } from '../graphql/mutations'
import { getLolly } from '../graphql/queries'
import { API } from 'aws-amplify'
import awsmobile from '../aws-exports';
import Loader from '../components/loader'
const style = require('../styles/main.module.css');
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
}));


function createNew({ location }) {
    //localhost:8000/showLolly?id/tx31hzjz7i8
    const classes = useStyles();

    const queryParam = location.search
    const [user, setUser] = useState<any>("noUser")

    const code = queryParam.substring(6)
    // console.log(code)

    // console.log(location)

    useEffect(() => {
        const stored_token = sessionStorage.getItem("access_token")
        if (!!stored_token) {
            fetchUserDetails(stored_token)
        } else {
            fetchTokens()
        }
    }, [])

    function fetchTokens() {
        const authData = btoa(`${awsmobile.clientId}:${awsmobile.clientSecret}`)

        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${authData}`,
            },
        }
        fetch(
            `${awsmobile.domainUrl}/oauth2/token?grant_type=${awsmobile.grant_type}&code=${code}&client_id=${awsmobile.clientId}&redirect_uri=${awsmobile.loginRedirectUri}`,
            requestOptions
        )
            .then(response => response.json())
            .then(data => {
                sessionStorage.setItem("access_token", data.access_token)

                fetchUserDetails(data.access_token)
            })
    }

    function fetchUserDetails(accessToken: string) {
        const requestOptions = {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }

        fetch(`${awsmobile.domainUrl}/oauth2/userInfo`, requestOptions)
            .then(response => response.json())
            .then(data => {
                console.log(data)

                if (!!data.username) {
                    setUser(data)
                } else {
                    setUser(null)
                }
            })
    }

    const logout = () => {
        window.location.href = `${awsmobile.domainUrl}/logout?client_id=${awsmobile.clientId}&logout_uri=${awsmobile.logoutUri}`

        sessionStorage.removeItem("access_token")
    }


    const [uniqueId, setUniqueId] = useState<string>(Math.random().toString(36).substring(2))
    const [color1, setColer1] = useState('#d52358');
    const [color2, setColer2] = useState('#e95946');
    const [color3, setColer3] = useState('#deaa43');

    const [recipientName, setRecipientName] = useState('')
    const [message, setMessage] = useState('')
    const [sender, setSender] = useState('')



    const addLollyMutation = async () => {
        try {

            const data = await API.graphql({
                query: addLolly,
                variables: {
                    flavourTop: color1,
                    flavourMiddle: color2,
                    flavourBottom: color3,
                    message: message,
                    recipientName: recipientName,
                    senderName: sender,
                    lollyPath: uniqueId,

                },
            });




        }
        catch (e) {
            console.log(e)
        }
    }

    const getLollyQuery = async () => {
        try {

            const data = await API.graphql({
                query: getLolly,
                variables: {
                    lollyPath: uniqueId
                },
            });
            // console.log("dataquery" , data);
            navigate(`/showLolly?id=${data.data.getLolly.lollyPath}`)


        }
        catch (e) {
            console.log(e)
        }
    }

    return (
        <div className={style.container} >
            {user === "noUser" ? (
                <div className={style.loader}>
                    <Loader />
                </div>
            ) : !user ? (
                <h2>Error</h2>
            ) : (
                        <div>

                            <div className={classes.root}  >
                                <AppBar position="static" style={{backgroundColor: '#1f202a'}} >
                                    <Toolbar>
                                        <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                                            <MenuIcon />
                                        </IconButton>
                                        <Typography variant="h6" className={classes.title}>
                                            
                                    </Typography>
                                        <Button style={{color: 'white', fontWeight: 'bold'}} onClick={() => logout()}>Logout</Button>
                                    </Toolbar>
                                </AppBar>
                            </div>

                            <Header />
                            <div className={style.create_lolly_div} >

                                <div className={style.lolly_input_div} >
                                    <div className={style.lolly} >
                                        <Lolly fillLollyTop={color1} fillLollyMiddle={color2} fillLollyBottom={color3} />
                                    </div>

                                    <div className={style.input_div} >

                                        <label htmlFor="flavourTop" className={style.colorPickerLabel} >
                                            <input type='color' value={color1} className={style.colorPicker} name='flavourTop' id='flavourTop'
                                                onChange={(e) => setColer1(e.target.value)}
                                            />
                                        </label>

                                        <label htmlFor="flavourTop" className={style.colorPickerLabel} >
                                            <input type='color' value={color2} className={style.colorPicker} name='flavourTop' id='flavourTop'
                                                onChange={(e) => setColer2(e.target.value)}
                                            />
                                        </label>

                                        <label htmlFor="flavourTop" className={style.colorPickerLabel} >
                                            <input type='color' value={color3} className={style.colorPicker} name='flavourTop' id='flavourTop'
                                                onChange={(e) => setColer3(e.target.value)}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className={style.message_input_div} >
                                    <div style={{ color: 'white', textAlign: 'center' }} >
                                        <h1>{user.username}</h1>
                                    </div>
                                    <label htmlFor="to_input" className={style.to_input} >
                                        To
                                    </label>
                                    <TextField
                                        variant="outlined"
                                        color="primary"
                                        label="A lolly for"
                                        type="text"
                                        name='to_input'
                                        className={style.to_input}
                                        id={style.input}
                                        required
                                        onChange={(e) => {
                                            setRecipientName(e.target.value)
                                        }}
                                    />

                                    <label htmlFor="to_message" className={style.to_message} >
                                        Say something nice
                                    </label>
                                    <TextField multiline rows={7} name="to_message" id={style.textarea} className={style.to_message} label='Message' variant='outlined' onChange={(e) => {
                                        setMessage(e.target.value)
                                    }} />

                                    <label htmlFor="to_from" className={style.to_from} >
                                        From
                                    </label>
                                    <TextField
                                        variant="outlined"
                                        color="primary"
                                        label="from your friend"
                                        type="text"
                                        name='to_from'
                                        className={style.to_from}
                                        id={style.input}

                                        onChange={(e) => {
                                            setSender(e.target.value)
                                        }}
                                    />

                                    <div className={style.send_lolly_btn_div2}>
                                        <button onClick={async () => {
                                            await addLollyMutation()
                                            await getLollyQuery()
                                        }} type='button' className={style.send_lolly_btn2}  >Freeze this lolly and get this link</button>
                                    </div>

                                </div>

                            </div>
                        </div>
                    )}
        </div>
    )
}

export default createNew




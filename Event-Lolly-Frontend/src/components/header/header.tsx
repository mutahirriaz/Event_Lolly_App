import React from 'react';
const style = require ('../../styles/main.module.css')

function Header() {
    return (
        <div className={style.heading_div} >
            <h1 className={style.heading} >virtual lollipop</h1>
            <p className={style.paragraph} >because we all know someone<br/>
            who deserves some sugar.</p>
        </div>
    )
}

export default Header
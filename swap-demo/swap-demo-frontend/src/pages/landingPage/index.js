import React from 'react'

const LandingPage = ({connect}) => {
    return (
        <>
            <h1>Welcome to the swap demo</h1>
            <p>Plz log in with Metamask</p>
            <button onClick={connect}>Connect</button>
        </>
    )
}

export default LandingPage

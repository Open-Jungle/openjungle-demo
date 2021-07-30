import React from 'react'

const LandingPage = ({connectToDexBook , metamask}) => {
    return (
        <>
            {metamask ? 
                <button onClick={connectToDexBook}>
                    connect and access the dex
                </button>:
                'welcome to the JungleEx :) You will need metamask to access the exchange'
            }
        </>
    )
}

export default LandingPage

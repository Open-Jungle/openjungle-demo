import React from 'react'

import {
    LandingPageWrapper,
    LandingPageMsgBox,
    LandingPageButton
} from './landingPageElements'

const LandingPage = ({connectToDexBook , metamask}) => {
    return (
        <LandingPageWrapper>
            
            <LandingPageMsgBox>
                <h2>Welcome to the Jungle Exchange V0.1</h2> 
                {metamask ? 
                    <button onClick={connectToDexBook}>
                        connect and access the dex
                    </button>:
                    'welcome to the JungleEx :) You will need metamask to access the exchange'
                }
            </LandingPageMsgBox>
            
        </LandingPageWrapper>
    )
}

export default LandingPage

import React from 'react'
import LogoName from '../../images/logos/LogoName.png'

import {
    LandingPageWrapper,
    LandingPageMsgBox,
    LogoWrapper,
    Logo,
    LandinPageButton
} from './landingPageElements'

const LandingPage = ({connectToDexBook , metamask}) => {
    return (
        <LandingPageWrapper>
            
            <LandingPageMsgBox>
                <LogoWrapper>
                    <Logo src={LogoName} alt="Jungle Ex" />
                </LogoWrapper>
                {metamask ? 
                    <LandinPageButton onClick={connectToDexBook}>
                        connect and access the dex
                    </LandinPageButton>:
                    'welcome to the JungleEx :) You will need metamask to access the exchange'
                }
            </LandingPageMsgBox>
            
        </LandingPageWrapper>
    )
}

export default LandingPage

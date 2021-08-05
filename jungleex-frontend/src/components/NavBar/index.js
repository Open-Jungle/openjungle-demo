import React from 'react';
import { FaBars } from 'react-icons/fa';
import { AiOutlineSetting } from "react-icons/ai";
import LeafIcon from "../../images/logos/LogoName.png";
import { 
    Nav,
    NavBarContainer,
    NavLogo,
    MobileIcon,
    NavIcon,
    NavTempLogo,
    NavStatus,
    DexStatus,
    NextRefreshTimer,
    OtherStatus
} from './NavBarElements';


const NavBar = ({ 
            toggle,
            dexStatus,
            timerSeconds,
            scrapeStatus  
        }) => {



    return (
        <>
            <Nav>
                <NavBarContainer>
                    <NavLogo>
                            <NavIcon src={LeafIcon} type="img/png" />
                    </NavLogo>
                    <MobileIcon onClick={toggle}>
                        <FaBars />
                    </MobileIcon>
                    

                    <NavTempLogo>
                        <NavStatus>
                            <DexStatus>
                                <p>Status:</p> {dexStatus === "Live" ? <p>{dexStatus}</p> : <p style={{"color": "#FF6A00"}}>{dexStatus}</p>}
                            </DexStatus>
                            <NextRefreshTimer>
                                <p>Next Refresh:</p> <p>{timerSeconds}s</p>
                            </NextRefreshTimer>
                            <OtherStatus>
                                <p>synced with block:</p> <p>{scrapeStatus.latestBlock}</p>
                            </OtherStatus>
                            <OtherStatus>
                                <p>Last Update Took:</p> <p>{scrapeStatus.lastUpdateRunTime}ms</p>
                            </OtherStatus>
                        </NavStatus>

                        <AiOutlineSetting />
                    </NavTempLogo>
                </NavBarContainer>
            </Nav>
        </>
    )
}

export default NavBar
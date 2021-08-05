import React from 'react'
import LogoName from '../../images/logos/LogoName.png'
import { 
    SideBarContainer,
    Icon,
    CloseIcon,
    SideBarWrapper,
    LogoWrapper,
    Logo
} from './SideBarElements'

const SideBar = ({ 
            isOpen, 
            toggle, 
        }) => { 

    
    return (
        <SideBarContainer isOpen={isOpen} onClick={toggle}>
            <Icon onClick={toggle}>
                <CloseIcon />
            </Icon>
            <SideBarWrapper>
                <LogoWrapper>
                    <Logo src={LogoName} alt="Jungle Ex" />
                </LogoWrapper>
            </SideBarWrapper>
        </SideBarContainer>
    )
}

export default SideBar

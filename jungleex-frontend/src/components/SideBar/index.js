import React from 'react'
import { animateScroll as scroll } from 'react-scroll';
import { 
    SideBarContainer,
    Icon,
    CloseIcon,
    SideBarLink,
    SideBarWrapper,
    SideBarMenu,
    NavTempLogo
} from './SideBarElements'

const SideBar = ({ 
            isOpen, 
            toggle, 
        }) => { 

    const toggleHome = () => {
        scroll.scrollToTop();
    }
    
    return (
        <SideBarContainer isOpen={isOpen} onClick={toggle}>
            <Icon onClick={toggle}>
                <CloseIcon />
            </Icon>
            <SideBarWrapper>
                <SideBarMenu>
                    <SideBarLink to='about' onClick={toggle}>About</SideBarLink>
                    <SideBarLink to='projects' onClick={toggle}>Projects</SideBarLink>
                    <SideBarLink to='team' onClick={toggle}>Team</SideBarLink>  
                </SideBarMenu>
                <NavTempLogo onClick={toggleHome}>
                    Lex Propositum
                </NavTempLogo>
            </SideBarWrapper>
        </SideBarContainer>
    )
}

export default SideBar

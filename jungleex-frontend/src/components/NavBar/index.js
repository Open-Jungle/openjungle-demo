import React, {useState, useEffect} from 'react';
import { FaBars } from 'react-icons/fa';
import { AiOutlineSetting } from "react-icons/ai";
import Icon from "../../images/icons/monkey-logo-white-text.png";
import { animateScroll as scroll } from 'react-scroll';
import { 
    Nav,
    NavBarContainer,
    NavLogo,
    MobileIcon,
    NavMenu,
    NavItem,
    NavLinks,
    NavIcon,
    NavTempLogo,
} from './NavBarElements';


const NavBar = ({ toggle }) => {
    const [scrollNav, setScrollNav] = useState(false)
    
    const changeNav = () => {
        if(window.scrollY >= 80) {
            setScrollNav(true)
        } else {
            setScrollNav(false)
        }
    }

    useEffect(() => {
        window.addEventListener('scroll',changeNav)
    }, []);

    const toggleHome = () => {
        scroll.scrollToTop();
    }

    return (
        <>
            <Nav scrollNav={scrollNav}>
                <NavBarContainer>
                    <NavLogo onClick={toggleHome}>
                            <NavIcon src={Icon} type="img/png" />
                    </NavLogo>
                    <MobileIcon onClick={toggle}>
                        <FaBars />
                    </MobileIcon>
                    <NavMenu>
                        <NavItem>
                            <NavLinks 
                                to='about'
                                smoth='true'
                                duration={500}
                                spy={true}
                                exact='true'
                                offset={-20}
                            >
                                Exchange
                            </NavLinks>
                        </NavItem>
                        <NavItem>
                            <NavLinks 
                                to='projects'
                                smoth='true'
                                duration={500}
                                spy={true}
                                exact='true'
                            >
                                Learn More
                            </NavLinks>
                        </NavItem>
                        <NavItem>
                            <NavLinks 
                                to='team'
                                smoth='true'
                                duration={500}
                                spy={true}
                                exact='true'
                                offset={30}
                            >
                                Community
                            </NavLinks>
                        </NavItem>
                    </NavMenu> */}
                    <NavTempLogo onClick={toggleHome}>
                            <AiOutlineSetting />
                    </NavTempLogo>
                </NavBarContainer>
            </Nav>
        </>
    )
}

export default NavBar
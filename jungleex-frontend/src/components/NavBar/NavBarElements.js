import styled from 'styled-components';

export const Nav = styled.nav`
    background: white;
    height: 50px;
    margin-top: -50px;
    position: sticky;
    top: 0;
    z-index: 10;

    @media screen and (max-width: 960px){
        transition 0.8s all ease;
    }
`;

export const NavBarContainer = styled.div`
    display: fex;
    justify-content: space-between;
    height: 50px;
    z-index: 1;
    width: 100%;
    padding: 0 12px;
`;

export const NavLogo = styled.a`
    cursor: default;
`;

export const NavTempLogo = styled.a`
    color: #8AC53C;
    cursor: pointer;
    font-size: 30px;
    display: flex;
    align-items: center;

    &:hover {
        color: #6F9F2F;
    }

    @media screen and (max-width: 768px){
        display: none;
    }
`;
export const NavTempInfo = styled.a`
    color: #8AC53C;
    cursor: pointer;
    font-size: 30px;
    display: none;
    align-items: center;

    @media screen and (max-width: 768px){
        display: flex;
    }
`;

export const MobileIcon = styled.div`
    display: none;

    @media screen and (max-width: 768px){
        display: flex;
        align-items: center;
        font-size: 1.8rem;
        cursor: pointer;
        color: #8AC53C;
        
        &:hover {
            color: #6F9F2F;
        }
    }
`;

export const NavIcon = styled.img`
    height: 45px;
    margin-top: 3px;
    
    @media screen and (max-width: 768px) {
        height: 42px;
    }
`;

export const NavStatus = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: #6F9F2F;
    font-size: 8px;
    width: 150px;
    margin-right: 20px;

    @media screen and (max-width: 768px) {
        width: 120px;
    }
`;

export const DexStatus = styled.div`
    display: flex;
    justify-content: space-between;
`;

export const NextRefreshTimer = styled.div`
    display: flex;
    justify-content: space-between;
`;

export const OtherStatus = styled.div`
    display: flex;
    justify-content: space-between;
`;
import styled from 'styled-components';

export const LandingPageWrapper = styled.div`
    width: 100%,
    height: 1000px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    text-align: center;
    align-items: center;
`;

export const LandingPageMsgBox = styled.div`
    border: 3px solid #8AC53C;
    height: 300px;
    border-radius: 50px;
    text-align: center;
    margin: auto;
    margin-top: 100px;
    display: flex;
    justify-content: center;
    align-content: center;
    flex-direction: column;
    padding: 10%;
`;

export const LogoWrapper = styled.div`
    margin: auto;
    width: 200px;
`;

export const Logo = styled.img`
    width: 200px;
`;

export const LandinPageButton = styled.button`
    width: 200px;
    border-radius: 5px;
    padding: 5px;
    margin: auto;
`;
import styled from 'styled-components';

export const Bar = styled.nav`
    background: green;
    height: 40px;
    margin-top: 80px;
    display: flex;
    justify-content: center;
    font-size: 1rem;
    position: sticky;
    top: 0;
    z-index: 10;

    @media screen and (max-width: 960px){
        transition 0.8s all ease;
    }
`;

export const PairSelector = styled.div`
    display: flex;
    flex-direction: row;
`;

export const PairInfoDisplay = styled.div`

`;

export const PairInfoItem = styled.div`

`;
import styled from 'styled-components';

export const Bar = styled.nav`
    background: green;
    height: 60px;
    margin-top: 80px;
    display: flex;
    justify-content: space-between;
    font-size: 1rem;
    position: sticky;
    top: 80px;
    z-index: 10;

    @media screen and (max-width: 960px){
        transition 0.8s all ease;
    }
`;

export const PairSelector = styled.div`
    display: flex;
    flex-direction: row;
    margin-left: 25px;
`;

export const PairSelectorTitle = styled.div`
    font-size: 24px;
    color: white;
    padding-top: 18px;
    margin-right: 5px;
    cursor: default;
`;

export const PairInfoDisplay = styled.div`
    display: flex;
    flex-direction: row;
`;

export const PairInfoItem = styled.div`

`;
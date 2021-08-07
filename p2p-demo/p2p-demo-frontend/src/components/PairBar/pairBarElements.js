import styled from 'styled-components';

export const Bar = styled.nav`
    border-top: 3px solid #6F9F2F;
    background: #8AC53C;
    height: 60px;
    margin-top: 50px;
    display: flex;
    justify-content: space-between;
    font-size: 1rem;
    position: sticky;
    top: 50px;
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
    padding: 0 12px;
    width: 500px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    color: white;
`;

export const PairInfoItem = styled.div`
    height: 100%;
    padding-top: 20px;
`;
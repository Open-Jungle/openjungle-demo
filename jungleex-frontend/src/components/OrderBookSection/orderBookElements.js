import styled from "styled-components";

export const OrderBookWrapper = styled.ul`
    border: 2px solid black;
    margin: 2%;
    height: 300px;
    list-style-type:none;
    width: 100%;

    @media screen and (max-width: 768px) {
    }
`;

export const OrderWrapper = styled.li`
    border: 1px solid green;
    width: 98%;
    cursor: pointer;
    margin: 1%;
    border-radius: 5px;
`;
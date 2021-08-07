import styled from "styled-components";

export const Row = styled.div`
    display: flex;
    
    @media screen and (max-width: 768px) {
        display: block;
    }
`;

export const MyOrderSectionWrapper = styled.div`
    width: 100%;
    min-height: 150px;
`;

export const BalSectionWrapper = styled.div`
    width: 100%;
    min-height: 150px;
    border-left: 1px solid #e5e5e5;

    @media screen and (max-width: 768px) {
        border: none;
        margin-bottom: 300px;
    }
`;

export const BalSection = styled.table`
    width: 100%;
    padding-left: 12px;
`;

export const BalRowWrapper = styled.tr`
    width: 100%;
    cursor: pointer;
    margin: 1%;
`;

export const MyOrderSection = styled.table`
    width: 100%;
    padding-left: 12px;
`; 

export const OrderWrapper = styled.tr`
    width: 100%;
    cursor: pointer;
    margin: 1%;
`;

export const OrderBookTitle = styled.div`
    border-bottom: 1px solid #e5e5e5;
    font-size: 24px;
    font-weight: bold;
    margin: 0 12px;
    color: #6F9F2F;
`;

export const Td = styled.td`
`;

export const Subtitle = styled.td`
    font-size: 10px;
    color: #8AC53C;
`;

export const TableIcon = styled.img`
    margin-top: 2px;
    margin-right: 3px;
    height: 15px;
    border-radius: 50%;
    border: 2px solid #e5e5e5;
`;

export const MsgPannel = styled.div`

`;
    
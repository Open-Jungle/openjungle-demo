import styled from "styled-components";

export const OrderBookWrapper = styled.div`
    list-style-type:none;
    width: 100%;
    display: flex;

    @media screen and (max-width: 768px) {
    }
`;

export const OrderWrapper = styled.tr`
    width: 100%;
    cursor: pointer;
    margin: 1%;
`;

export const BuyBookWrapper = styled.table`
    border-right: 1px solid #e5e5e5;
    width: 50%;
    padding-right: 2px;
`;

export const SellBookWrapper = styled.table`
    width: 50%;
    padding-left: 2px;
`;

export const OrderBook = styled.div`
    width: 100%;
    margin-top: 15px;
    min-height: 150px;
`;

export const OrderBookTitle = styled.div`
    border-bottom: 1px solid #e5e5e5;
    font-size: 24px;
    font-weight: bold;
    margin: 0 12px;
    color: #6F9F2F;
`;

export const Obd = styled.td`
    text-align: right;
`;

export const ObdS = styled.td`
    text-align: left;
`;

export const Subtitle = styled.td`
    font-size: 10px;
    color: #8AC53C;
`;

export const SubtitleBuy = styled.td`
    font-size: 10px;
    color: #8AC53C;
    text-align: right;
`;

export const MsgPannel = styled.div`
    width: 100%;
    height: 100%;
    text-align: center;
    padding-top: 40%;
`;
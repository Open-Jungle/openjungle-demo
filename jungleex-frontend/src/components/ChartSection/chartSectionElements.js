import styled from "styled-components";

export const ChartSectionWrapper = styled.div`
    width: ${({width}) => (width)};
    position: fixed;
    bottom: 0;
    left: 0;
    display: ${({isChart}) => (isChart ? "block" : "none")};
    z-index: 10;
    height: ${({height}) => (height)};
    background-color: white;
`;

export const Chart = styled.div`
`;

export const ToggleChartButton = styled.div`
    cursor: pointer;
    position: fixed;
    padding: 10px;
    right: 20px;
    top: 60px;
    border-radius: 25px;
    color: blue;
    z-index: 20;
    background-color: #8AC53C;
    border: 2px solid #6F9F2F;
    color: white;

    &:hover{
        background-color: #6F9F2F;
    }
`;
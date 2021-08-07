import styled from "styled-components";

export const InteractionSectionWrapper = styled.div`
    height: 300px;
    width: 400px;
    margin: 5px;
    @media screen and (max-width: 1000px) {
        width: 250px;
    }
    @media screen and (max-width: 768px) {
        width: 100%;
        margin: 0px;
    }
`;

export const PannelMenu = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: left;
    width: 100%;
    height: 40px;
    background-color: rgba(0,0,0,0);
`;

export const PannelMenuOption = styled.div`
    padding: 10px;
    padding-top: 15px;
    cursor: pointer;
    border-radius: 20px 20px 0 0;
    background-color: ${({ isOpen }) => (isOpen ? '#8AC53C' : '#e5e5e5')};

    :hover {
        background-color: #8AC53C;
    }
`;

export const ClosePannelMobile = styled.div`
    margin-left: 10px;
    padding: 10px;
    padding-top: 15px;
    cursor: pointer;
    border-radius: 50%;
    background-color: #C18983;
    display: none;
    

    :hover {
        background-color: #BF483D;
    }

    @media screen and (max-width: 768px) {
        display: ${({ isOpen }) => (isOpen ? "block" : "none")};
    }
`;

export const CancelOrderSection = styled.div`
    display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
`;

export const FillOrderSection = styled.div`
    display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
`;

export const NewOrderSection = styled.div`
    display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
`;

export const PannelContent = styled.div`
    border-top: none;
    width: 100%;
    height: 80%;
`;

export const PannelRow = styled.div`
    width: 100%;
    height: ${({ height }) => (height)};
    display: ${({ display }) => (display)};
    flex-direction: row;
    text-align: ${({ align }) => (align)};
`;

export const ConfirmNewOrderPannelRow = styled.div`
    width: 100%;
    height: 100px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    text-align: center;
    align-items: center;
    background-color: ${({status}) => (status === 'Ready' ? '#9FC46B' : '#C18983')};

    &:hover {
        background-color: ${({status}) => (status === 'Ready' ? '#8AC53C' : '#C18983')};
    }
`;

export const ConfirmFillOrderPannelRow = styled.div`
    width: 100%;
    height: 55px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    text-align: center;
    align-items: center;
    background-color: ${({status}) => (status === 'Ready' ? '#9FC46B' : '#C18983')};

    &:hover {
        background-color: ${({status}) => (status === 'Ready' ? '#8AC53C' : '#C18983')};
    }
`;

export const NewOrderInputPannelRow = styled.div`
    width: 100%;
    height: 80px;
    background-color: #e5e5e5;
`;

export const FillOrderInfoPannelRow = styled.div`
    width: 100%;
    height: 45px;
    background-color: #e5e5e5;
    padding: 5px;
`;

export const FillOrderInputPannelRow = styled.div`
    width: 100%;
    height: 80px;
    background-color: #e5e5e5;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    text-align: center;
    align-items: center;
`;

export const FillOrderInputWrapper = styled.div`
    display: flex;
    justify-content: space-between;
`;

export const FillOrderSend = styled.button`
    width: 50%;
    margin: 5px;
`;

export const NewOrderCurrencyPannelRow = styled.div`
    width: 100%;
    height: 80px;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    text-align: center;
    align-items: center;
    background-color: #8AC53C;
`;

export const IconWrapper = styled.img`
    height: 45px;
    border-radius: 50%;
    margin: 3px;
`;

export const CurrencyWrapper = styled.div`
    padding: 5px 15px;
    font-size: 14px;
    display: flex;
    flex-direction: column;
    text-align: center;
    align-items: center;
`;

export const ArrowWrapper = styled.div`
    padding-top: 3px;
    font-size: 24px;
`;

export const CancelOrderArrowWrapper = styled.div`
    padding-top: 6px;
    font-size: 48px;
`;

export const InputWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

export const Input = styled.input`
    width: 300px;
    margin: 5px;
`;

export const FillOrderInput = styled.input`
    width: 50%;
    margin: 5px;
`;

export const Label = styled.label`
    padding: 10px;
`;

export const FillInfoText = styled.small`

`;

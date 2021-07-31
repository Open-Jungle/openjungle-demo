import styled from "styled-components";

export const InteractionSectionWrapper = styled.div`
    border: 2px solid black;
    margin: 2%;
    height: 300px;
    width: 34%;
`;

export const PannelMenu = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    width: 100%;
    height: 20%;
    padding: 5px;
`;

export const PannelMenuOption = styled.div`
    border: 1px solid black;
    padding: 10px;
    cursor: pointer;
    background-color: ${({ isOpen }) => (isOpen ? 'green' : 'white')};

    :hover {
        background-color: green;
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

export const CurrencyWrapper = styled.div`
    width: 40%;
    padding: 5px;
    font-size: 24px;
`;

export const ArrowWrapper = styled.div`
    width: 20%;
    padding: 5px;
    font-size: 24px;
`;

export const InputWrapper = styled.div`

`;

export const Input = styled.input`
    width: 100px;
    margin: 5px;
`;

export const Label = styled.label`
    padding: 10px;
`;

export const FillInfoText = styled.small`
    
`;

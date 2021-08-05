import styled from "styled-components";

export const BalOrderSectionWrapper = styled.div`
    border: 2px solid black;
    margin: 2%;
    list-style-type:none;
    width: 100%;
`;

export const SectionMenu = styled.div`
    display: flex;
    flex-direction: row;
`;

export const MenuOption = styled.div`
    border: 1px solid black;
    padding: 10px;
    cursor: pointer;
    background-color: ${({ isOpen }) => (isOpen ? 'green' : 'white')};

    :hover {
        background-color: green;
    }
`;

export const BalSection = styled.ul`
    display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
    list-style-type:none;
`;

export const BalRowWrapper = styled.li`
    border: 1px solid green;
    width: 98%;
    margin: 1%;
    border-radius: 5px;
`;

export const MyOrderSection = styled.ul`
    display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
    list-style-type:none;
`; 

export const OrderWrapper = styled.li`
    border: 1px solid green;
    width: 98%;
    cursor: pointer;
    margin: 1%;
    border-radius: 5px;
`;

    
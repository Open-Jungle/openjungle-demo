import styled from "styled-components";

export const DropDownContainer = styled("div")`
    width: 120px;
    margin: 0 auto;
    margin-top: 9.5px;
    margin-right: 5px;
    cursor: pointer;
`;

export const DropDownHeader = styled("div")`
    padding: 0.4em;
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.15);
    font-weight: 500;
    font-size: 1.3rem;
    color: white;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

export const DropDownListContainer = styled("div")`
    position: absolute;
    z-index: 100;
    width: 120px;
`;

export const DropDownList = styled("ul")`
    padding: 0;
    margin: 0;
    background: white;
    color: #8AC53C;
`;

export const ListItem = styled("li")`
    padding: 0.1em 0.4em;
    list-style: none;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #8AC53C;
    font-size: 1.2em;
    &:hover {
        color: #6F9F2F;

        background-color: #e5e5e5;
    }
`;

export const IconWrapper = styled.img`
    height: 25px;
    border-radius: 50%;
    margin-right: 10px;
`;

export const ListIconWrapper = styled.img`
    height: 16px;
    border-radius: 50%;
    margin-right: 10px;
    border: 2px solid gray;
`;
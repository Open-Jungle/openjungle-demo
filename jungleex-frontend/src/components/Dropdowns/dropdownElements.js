import styled from "styled-components";

export const DropDownContainer = styled("div")`
  width: 100px;
  margin: 0 auto;
  margin-top: 9.5px;
  margin-right: 5px;
  cursor: pointer;
`;

export const DropDownHeader = styled("div")`
  margin-bottom: 0.8em;
  padding: 0.4em 2em 0.4em 1em;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.15);
  font-weight: 500;
  font-size: 1.3rem;
  color: white;
`;

export const DropDownListContainer = styled("div")`
  position: absolute;
  z-index: 100;
  width: 100px;
`;

export const DropDownList = styled("ul")`
  padding: 0;
  margin: 0;
  padding-left: 1em;
  background: #ffffff;
  border: 2px solid #e5e5e5;
  box-sizing: border-box;
  color: #3faffa;
  font-size: 1.3rem;
  font-weight: 500;
  &:first-child {
    padding-top: 0.8em;
  }
`;

export const ListItem = styled("li")`
  list-style: none;
  margin-bottom: 0.8em;
  &:hover {
    color: green;
  }
`;
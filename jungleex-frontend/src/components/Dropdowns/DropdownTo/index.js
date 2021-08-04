import React, { useState } from "react";

import {
    DropDownContainer,
    DropDownHeader,
    DropDownListContainer,
    DropDownList,
    ListItem
} from '../dropdownElements'

export default function DropdownTo({ options, setPair, selection }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggling = () => setIsOpen(!isOpen);

  const onOptionClicked = value => () => {
    setPair(selection.pair.currencyFrom, value);
    setIsOpen(false);
  };

  return (
      <DropDownContainer>
        <DropDownHeader onClick={toggling}>
          {selection.pair.currencyToSymbol || "select"}
        </DropDownHeader>
        {isOpen && (
          <DropDownListContainer>
            <DropDownList>
              {options.map(option => (
                <ListItem onClick={onOptionClicked(option.address)} key={Math.random()}>
                  {option.name}
                </ListItem>
              ))}
            </DropDownList>
          </DropDownListContainer>
        )}
      </DropDownContainer>
  );
}
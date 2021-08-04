import React, { useState } from "react";

import {
    DropDownContainer,
    DropDownHeader,
    DropDownListContainer,
    DropDownList,
    ListItem
} from '../dropdownElements'

export default function DropdownFrom({ options, setPair, selection }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggling = () => setIsOpen(!isOpen);

  const onOptionClicked = value => () => {
    setPair(value, selection.pair.currencyTo);
    setIsOpen(false);
  };

  return (
      <DropDownContainer>
        <DropDownHeader onClick={toggling}>
          {selection.pair.currencyFromSymbol || "select"}
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
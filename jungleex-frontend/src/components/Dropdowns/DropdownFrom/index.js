import React, { useState, useEffect } from "react";

import {
    DropDownContainer,
    DropDownHeader,
    DropDownListContainer,
    DropDownList,
    ListItem
} from '../dropdownElements'

export default function DropdownFrom({ options, setCurrencyFrom }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const toggling = () => setIsOpen(!isOpen);

  const onOptionClicked = value => () => {
    setSelectedOption(value);
    setIsOpen(false);
  };

  useEffect(() => {
      setCurrencyFrom(selectedOption);
  }, [selectedOption, setCurrencyFrom])

  return (
      <DropDownContainer>
        <DropDownHeader onClick={toggling}>
          {selectedOption || "Select"}
        </DropDownHeader>
        {isOpen && (
          <DropDownListContainer>
            <DropDownList>
              {options.map(option => (
                <ListItem onClick={onOptionClicked(option)} key={Math.random()}>
                  {option}
                </ListItem>
              ))}
            </DropDownList>
          </DropDownListContainer>
        )}
      </DropDownContainer>
  );
}
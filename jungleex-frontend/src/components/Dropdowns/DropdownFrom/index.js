import React, { useState } from "react";

import {
    DropDownContainer,
    DropDownHeader,
    DropDownListContainer,
    DropDownList,
    ListItem,
    IconWrapper,
    ListIconWrapper
} from '../dropdownElements'

export default function DropdownFrom({ options, setPair, selection }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggling = () => setIsOpen(!isOpen);

  const onOptionClicked = value => () => {
    setPair(value, selection.pair.currencyTo);
    setIsOpen(false);
  };

  const handleOnMouseLeave = () => {
      setIsOpen(false);
  }

  return (
      <DropDownContainer onMouseLeave={handleOnMouseLeave}>
        <DropDownHeader onClick={toggling}>
          <IconWrapper src={`https://ipfs.io/ipfs/${selection.pair.currencyFromIPFSIcon}`} alt=""/>{selection.pair.currencyFromSymbol}
        </DropDownHeader>
        {isOpen && (
          <DropDownListContainer>
            <DropDownList>
              {options.map(option => (
                <ListItem onClick={onOptionClicked(option.address)} key={Math.random()}>
                    <ListIconWrapper src={`https://ipfs.io/ipfs/${option.icon}`} alt=""/> {option.symbol}
                </ListItem>
              ))}
            </DropDownList>
          </DropDownListContainer>
        )}
      </DropDownContainer>
  );
}
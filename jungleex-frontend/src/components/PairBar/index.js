import React, { useState, useEffect } from 'react';

import { 
    Bar,
    PairSelector,
    PairInfoDisplay,
    PairInfoItem,
    PairSelectorTitle
} from './pairBarElements';

import DropdownFrom from '../Dropdowns/DropdownFrom';
import DropdownTo from '../Dropdowns/DropdownTo';

const PairBar = ({currencyBook, setCurrencyFrom, setCurrencyTo}) => {
    const [menu, setMenu] = useState([]);

    useEffect(() => {
        function bookToOPtions(book) {
            var m = [];
            if(book){
                for(var i in book){
                    m.push(
                        book[i].name
                    );
                }
            }
            setMenu(m);
        }
        bookToOPtions(currencyBook);
    }, [currencyBook]);


    return (
        <Bar>
            <PairSelector>
                <PairSelectorTitle>
                    Pair
                </PairSelectorTitle>
                <DropdownFrom options={menu} setCurrencyFrom={setCurrencyFrom}/>
                <DropdownTo options={menu} setCurrencyTo={setCurrencyTo}/>
            </PairSelector>
            <PairInfoDisplay>
                <PairInfoItem>
                    Last Price:
                </PairInfoItem>
                <PairInfoItem>
                    Amount of orders:
                </PairInfoItem>
            </PairInfoDisplay>
        </Bar>
    )
}

export default PairBar

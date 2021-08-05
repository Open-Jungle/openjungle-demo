import React, { useState, useEffect } from 'react';

import { 
    Bar,
    PairSelector,
    //PairInfoDisplay,
    //PairInfoItem,
    PairSelectorTitle
} from './pairBarElements';

import DropdownFrom from '../Dropdowns/DropdownFrom';
import DropdownTo from '../Dropdowns/DropdownTo';

const PairBar = ({currencyBook, selection, setPair}) => {
    
    const [menuFrom, setMenuFrom] = useState([]);
    const [menuTo, setMenuTo] = useState([]);

    useEffect(() => {
        console.log("pair bar Loop");
        function bookToOPtions(currencyBook, selection) {
            var menuFrom = [];
            var menuTo = [];
            if(currencyBook){
                for(var currency in currencyBook){
                    if(currency !== selection.pair.currencyTo & currency !== selection.pair.currencyFrom){
                        menuFrom.push({ 
                            "symbol": currencyBook[currency].symbol,
                            "address": currency,
                            "icon": currencyBook[currency].iconIPFSLocation
                        })
                    }
                    if(currency !== selection.pair.currencyFrom & currency !== selection.pair.currencyTo){
                        menuTo.push({
                            "symbol": currencyBook[currency].symbol,
                            "address": currency,
                            "icon": currencyBook[currency].iconIPFSLocation
                        })
                    }
                }
            }
            setMenuFrom(menuFrom);
            setMenuTo(menuTo);
        }
        bookToOPtions(currencyBook, selection);
    }, [currencyBook, selection]);

    return (
        <Bar>
            <PairSelector>
                <DropdownFrom options={menuFrom} setPair={setPair} selection={selection}/>
                <PairSelectorTitle>
                    /
                </PairSelectorTitle>
                <DropdownTo options={menuTo} setPair={setPair} selection={selection}/>
            </PairSelector>
            {/* <PairInfoDisplay>
                 <PairInfoItem>
                    Last Price:
                </PairInfoItem>
                <PairInfoItem>
                    Amount of orders:
                </PairInfoItem> 
            </PairInfoDisplay> */}
        </Bar>
    )
}

export default PairBar

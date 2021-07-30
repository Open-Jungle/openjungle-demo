import React, { useState, useEffect } from 'react'
import Select from 'react-select'

import { 
    Bar,
    PairSelector,
    PairInfoDisplay,
    PairInfoItem
} from './pairBarElements'

const PairBar = ({currencyBook}) => {
    const [menu, setMenu] = useState([]);

    useEffect(() => {
        function bookToOPtions(book) {
            var m = [];
            if(book){
                for(var i in book){
                    m.push({value:i, label: book[i].name});
                }
            }
            setMenu(m);
        }
        bookToOPtions(currencyBook);
    }, [currencyBook])


    return (
        <Bar>
            <PairSelector>
                Pair
                <Select options={menu} />
                <Select options={menu} />
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

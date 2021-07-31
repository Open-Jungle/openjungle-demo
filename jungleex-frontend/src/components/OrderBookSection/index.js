import React, { useEffect, useState } from 'react'

import {
    OrderBookWrapper,
    OrderWrapper
} from './orderBookElements'

const OrderBookSection = ({ 
                    currencyFrom,
                    currencyTo,
                    orderBook,
                    setSelectedOrder,
                    setRefresh,
                    refresh,
                    getOrderById,
                }) => {
    const [filteredBook, setFilteredBook] = useState(undefined);
    
    
    useEffect(() => {
        function filterBook(currencyFrom, currencyTo, orderBook){
            const padHexPair = (hexFrom, hexTo) => {
                return '0x'+'00000000000000000000000000000000'.substring(0, 32 - hexFrom.length) + hexFrom + '00000000000000000000000000000000'.substring(0, 32 - hexTo.length) + hexTo;
            }
            if(currencyFrom === undefined || currencyTo === undefined){
                setFilteredBook(undefined);
            } else {
                var filteredBook = [];
                const hexPair = padHexPair(currencyFrom.toString(16), currencyTo.toString(16));
                for(var i in orderBook){
                    if(i === hexPair){
                        for(var ii in orderBook[i]){
                            orderBook[i][ii]["id"] = ii;
                            filteredBook.push(orderBook[i][ii]);
                        }
                    }
                }
                setFilteredBook(filteredBook);
            }
        };
        filterBook(currencyFrom, currencyTo, orderBook);
        setRefresh(true);
    }, [currencyFrom, currencyTo, orderBook, setRefresh, refresh])

    const onOptionClicked = value => () => {
        setSelectedOrder(getOrderById(value));
    };
    
    return (
        <OrderBookWrapper>
            {filteredBook === undefined ? 
                'Select a pair first' : 
                filteredBook.length === 0 ? 
                    'No orders for this pair' : 
                    filteredBook.map((item) => (
                        <OrderWrapper onClick={onOptionClicked(item.id)} key={Math.random()}>
                            ID: {item.id} Amount: {item.amount} Price: {item.price}
                        </OrderWrapper>
                    ))
            }
        </OrderBookWrapper>
    )
}

export default OrderBookSection

import React, { useEffect, useState } from 'react'

import {
    OrderBookWrapper,
    OrderWrapper
} from './orderBookElements'

const OrderBookSection = ({ 
                    orderBook,
                    selection,
                    setSelectionByOrderId
                }) => {
    const [filteredBuyBook, setFilteredBuyBook] = useState(undefined);
    const [filteredSellBook, setFilteredSellBook] = useState(undefined);
    
    useEffect(() => {
        console.log('orderBook Loop');
        function filterBook(){
            var filteredBuyBook = [];
            var filteredSellBook = [];
            for(let pair in orderBook){
                if(pair === selection.pair.pair){
                    for(let orderID in orderBook[pair]){        
                        let order = orderBook[pair][orderID];
                        order["id"] = orderID;
                        filteredBuyBook.push(order);
                    }
                    for(let orderID in orderBook[selection.pair.invertedPair]){
                        
                        let order = orderBook[selection.pair.invertedPair][orderID];
                        order["id"] = orderID;
                        filteredSellBook.push(order);
                    }
                    break;
                }
            }
            setFilteredBuyBook(filteredBuyBook);
            setFilteredSellBook(filteredSellBook);
        };
        filterBook();
    },[orderBook, selection])

    const onOptionClicked = value => () => {
        setSelectionByOrderId(value);
    };
    
    return (
        <OrderBookWrapper>
            {filteredBuyBook === undefined ? 
                'Select a pair first' : 
                filteredBuyBook.length === 0 ? 
                    'No buy orders for this pair' : 
                    filteredBuyBook.map((item) => (
                        <OrderWrapper onClick={onOptionClicked(item.id)} key={Math.random()}>
                            ID: {item.id} Amount: {item.amountFrom} Price: {item.price}
                        </OrderWrapper>
                    ))
            }
            {filteredSellBook === undefined ? 
                'Select a pair first' : 
                filteredSellBook.length === 0 ? 
                    'No sell orders for this pair' : 
                    filteredSellBook.map((item) => (
                        <OrderWrapper onClick={onOptionClicked(item.id)} key={Math.random()}>
                            ID: {item.id} Amount: {item.amountTo} Price: {1 / item.price}
                        </OrderWrapper>
                    ))
            }
        </OrderBookWrapper>
    )
}

export default OrderBookSection

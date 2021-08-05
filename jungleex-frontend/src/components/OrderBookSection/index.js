import React, { useEffect, useState } from 'react'

import {
    OrderBookWrapper,
    OrderWrapper,
    SellBookWrapper,
    BuyBookWrapper,
    OrderBook,
    OrderBookTitle,
    Obd,
    ObdS,
    Subtitle,
    SubtitleBuy,
    MsgPannel
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
            if(filteredBuyBook.length > filteredSellBook.length){
                for(let i = 0; i <= (filteredBuyBook.length - filteredSellBook.length); i++) {
                    filteredSellBook.push({
                        "id": '-',
                        "amountFrom": '-',
                        "amountTo": '-',
                        "price": '-'
                    })
                }
            } 
            if (filteredBuyBook.length < filteredSellBook.length){
                for(let i = 0; i <= (filteredSellBook.length - filteredBuyBook.length); i++) {
                    filteredBuyBook.push({
                        "id": '-',
                        "amountTo": '-',
                        "amountFrom": '-',
                        "price": '-'
                    })
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
        <OrderBook>
            <OrderBookTitle>
                Order Book
            </OrderBookTitle>
            <OrderBookWrapper>
                {filteredBuyBook === undefined ? 
                    <MsgPannel>
                        Orders Not loaded yet
                    </MsgPannel> :
                    
                    <BuyBookWrapper>
                        <tbody>
                            <OrderWrapper>
                                <SubtitleBuy>ID</SubtitleBuy><SubtitleBuy>Amount</SubtitleBuy><SubtitleBuy>Price</SubtitleBuy>
                            </OrderWrapper>
                            {filteredBuyBook.map((item) => (
                                <OrderWrapper onClick={onOptionClicked(item.id)} key={Math.random()}>
                                    <Obd>{item.id}</Obd>
                                    <Obd>{item.amountFrom === '-' ? item.amountFrom : (item.amountFrom / (10 ** selection.pair.currencyFromDecimals))}</Obd>
                                    <Obd>{item.price}</Obd>
                                </OrderWrapper>
                            ))}
                        </tbody>
                    </BuyBookWrapper>
                }

                {filteredBuyBook === undefined ? 
                    <MsgPannel>
                        Orders Not Loaded yet
                    </MsgPannel> :
                    <SellBookWrapper>
                        <tbody>
                            <OrderWrapper>
                                <Subtitle>Price</Subtitle><Subtitle>Amount</Subtitle><Subtitle>ID</Subtitle>
                            </OrderWrapper>
                            {filteredSellBook.map((item) => (
                                <OrderWrapper onClick={onOptionClicked(item.id)} key={Math.random()}>
                                    <ObdS>{item.price === '-' ? item.price : (1 / item.price)}</ObdS>
                                    <ObdS>{item.amountTo === '-' ? item.amountTo : (item.amountTo / (10 ** selection.pair.currencyFromDecimals))}</ObdS>
                                    <ObdS>{item.id}</ObdS>
                                </OrderWrapper>
                            ))}
                        </tbody>
                    </SellBookWrapper>
                }
            </OrderBookWrapper>
        </OrderBook>
    )
}

export default OrderBookSection

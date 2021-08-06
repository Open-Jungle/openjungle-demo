import React, { useState, useEffect } from 'react';
import getContract from '../../contracts/getContract';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';	

import {
    Row,
    MyOrderSectionWrapper,
    BalSectionWrapper,
    BalSection,
    MyOrderSection,
    BalRowWrapper,
    OrderWrapper,
    OrderBookTitle,
    Td,
    Subtitle,
    TableIcon,
    MsgPannel
} from './balOrderSectionElements';

const BalOrderSection = ({ 
                    currencyBook,
                    orderBook,
                    setSelectionByOrderId
                }) => {

    const [balBook, setBalBook] = useState(undefined);
    const [myOrderBook, setMyOrderBook] = useState(undefined);

    useEffect(() => {
        console.log("ordersection loop");
        
        async function filterBook(currencyBook, orderBook){

            let provider = await detectEthereumProvider();
            provider = new ethers.providers.Web3Provider(provider);
            const signer = await provider.getSigner().getAddress();

            var balBook = [];
            for(let currency in currencyBook) {
                if(currency === ''){ continue; } 
                const { contract } = await getContract(currency);
                const balance = await contract.balanceOf(signer);
                balBook.push({
                    "currency": currency,
                    "name": currencyBook[currency].name,
                    "symbol": currencyBook[currency].symbol,
                    "balance": balance
                });    
            }
            
            var myOrderBook = [];
            for(let pair in orderBook) {
                for(let order in orderBook[pair]){
                    if(orderBook[pair][order].owner.toLowerCase() === signer.toLowerCase()){
                        let tempOrder = orderBook[pair][order]
                        tempOrder["id"] = order;
                        myOrderBook.push(tempOrder);
                    }
                }
            }
            setMyOrderBook(myOrderBook);
            setBalBook(balBook);
        };
        filterBook(currencyBook, orderBook);
    }, [currencyBook, orderBook])

    const onOptionClicked = value => () => {
        setSelectionByOrderId(value);
    };

    return (
        <Row>
            <MyOrderSectionWrapper>
                <OrderBookTitle>
                    My Open Orders
                </OrderBookTitle>
                {myOrderBook === undefined ? 
                    <MsgPannel>
                        Orders not loaded yet
                    </MsgPannel> : 
                    <>
                        {myOrderBook.length === 0 ? 
                            <MsgPannel>
                                You have no open orders
                            </MsgPannel> :
                            <MyOrderSection>
                                <tbody>
                                    <OrderWrapper>
                                        <Subtitle>ID</Subtitle>
                                        <Subtitle>Currency From</Subtitle>
                                        <Subtitle>Currency To</Subtitle>
                                        <Subtitle>Amount From</Subtitle>
                                        <Subtitle>Price</Subtitle>
                                        <Subtitle>Amount To</Subtitle>
                                    </OrderWrapper>
                                    {myOrderBook.map((item) => (
                                        <OrderWrapper onClick={onOptionClicked(item.id)} key={Math.random()}>
                                            <Td>{item.id}</Td>
                                            <Td><TableIcon src={`https://ipfs.io/ipfs/${currencyBook[item.currencyFrom].iconIPFSLocation}`} />{currencyBook[item.currencyFrom].symbol}</Td>
                                            <Td><TableIcon src={`https://ipfs.io/ipfs/${currencyBook[item.currencyTo].iconIPFSLocation}`} />{currencyBook[item.currencyTo].symbol}</Td>
                                            <Td>{item.amountFrom / (10 ** currencyBook[item.currencyFrom].decimals)}</Td>
                                            <Td>{item.price}</Td>
                                            <Td>{item.amountTo / (10 ** currencyBook[item.currencyTo].decimals)}</Td>
                                        </OrderWrapper>
                                    ))}
                                </tbody>
                            </MyOrderSection>
                        }
                    </>
                }
            </MyOrderSectionWrapper>

            <BalSectionWrapper>
                <OrderBookTitle>
                    My Balances
                </OrderBookTitle>
                {balBook === undefined ? 
                    <MsgPannel>
                        Balances not loaded yet
                    </MsgPannel> : 
                    <BalSection>
                        <tbody>
                            <OrderWrapper>
                                <Subtitle>Icon</Subtitle>
                                <Subtitle>Name</Subtitle>
                                <Subtitle>Symbol</Subtitle>
                                <Subtitle>Balance</Subtitle>
                            </OrderWrapper>
                            {balBook.map((item) => (
                                <BalRowWrapper key={Math.random()}>
                                    <Td><TableIcon src={`https://ipfs.io/ipfs/${currencyBook[item.currency].iconIPFSLocation}`} /></Td>
                                    <Td>{item.name}</Td>
                                    <Td>{item.symbol}</Td>
                                    <Td>{item.balance / (10 ** currencyBook[item.currency].decimals)}</Td>
                                </BalRowWrapper>
                            ))}
                        </tbody>
                    </BalSection>
                }
            </BalSectionWrapper>
        </Row>
    )
}

export default BalOrderSection

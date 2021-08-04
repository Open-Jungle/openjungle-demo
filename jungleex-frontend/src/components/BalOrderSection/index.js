import React, { useState, useEffect } from 'react';
import getContract from '../../contracts/getContract';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';	

import {
    BalOrderSectionWrapper,
    SectionMenu,
    MenuOption,
    BalSection,
    MyOrderSection,
    BalRowWrapper,
    OrderWrapper
} from './balOrderSectionElements';

const BalOrderSection = ({ 
                    currencyBook,
                    orderBook,
                    setSelectionByOrderId
                }) => {

    const [isBal, setIsBal] = useState(true);
    const [isOrder, setIsOrder] = useState(false);
    const toggleBal = () => {setIsBal(true);setIsOrder(false)};
    const toggleOrder = () => {setIsBal(false);setIsOrder(true)};

    const [balBook, setBalBook] = useState(undefined);
    const [myOrderBook, setMyOrderBook] = useState(undefined);

    useEffect(() => {
        console.log("ordersection loop");
        
        const handleDecimal = (amount, decimals) => {
            const a = amount.toString();
            const l = a.length - decimals;
            return a.substring(0, l)+"."+a.substring(l);
        }
        
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
                    "name": currencyBook[currency].name,
                    "symbol": currencyBook[currency].symbol,
                    "balance": handleDecimal(balance, currencyBook[currency].decimals)
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
        <BalOrderSectionWrapper>
            <SectionMenu>
                <MenuOption onClick={toggleBal} isOpen={isBal}>
                    Balances
                </MenuOption>
                <MenuOption onClick={toggleOrder} isOpen={isOrder}>
                    My Orders
                </MenuOption>
            </SectionMenu>

            <BalSection isOpen={isBal}>
                {balBook === undefined ? 
                    'Balances not loaded yet' : 
                    balBook.map((item) => (
                        <BalRowWrapper key={Math.random()}>
                            Name: {item.name} Symbol: {item.symbol} Balance: {item.balance}
                        </BalRowWrapper>
                    ))
                }
            </BalSection>

            <MyOrderSection isOpen={isOrder}>
                {myOrderBook === undefined ? 
                    'Orders not loaded yet' :
                    myOrderBook.length === 0 ? 
                        'You have no open orders' : 
                        myOrderBook.map((item) => (
                            <OrderWrapper onClick={onOptionClicked(item.id)} key={Math.random()}>
                                ID: {item.id} Amount: {item.amount} Price: {item.price} 
                            </OrderWrapper>
                        ))
                }
            </MyOrderSection>
        </BalOrderSectionWrapper>
    )
}

export default BalOrderSection

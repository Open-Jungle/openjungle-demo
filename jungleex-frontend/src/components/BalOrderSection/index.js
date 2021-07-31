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
                    refresh,
                    setSelectedOrder,
                    getOrderById
                }) => {

    const [isBal, setIsBal] = useState(true);
    const [isOrder, setIsOrder] = useState(false);
    const toggleBal = () => {setIsBal(true);setIsOrder(false)};
    const toggleOrder = () => {setIsBal(false);setIsOrder(true)};

    const [balBook, setBalBook] = useState(undefined);
    const [myOrderBook, setMyOrderBook] = useState(undefined);

    useEffect(() => {
        async function filterBook(currencyBook, orderBook){
            
            const handleDecimal = (amount, decimals) => {
                const a = amount.toString();
                const l = a.length - decimals;
                return a.substring(0, l)+"."+a.substring(l);
            }

            let provider = await detectEthereumProvider();
            provider = new ethers.providers.Web3Provider(provider);
            const signer = await provider.getSigner().getAddress();

            var balBook = [];
            for(var i in currencyBook) {
                const { contract } = await getContract(currencyBook[i].address);
                const name = await contract.name();
                const symbol = await contract.symbol();
                const decimals = await contract.decimals();
                const balance = await contract.balanceOf(signer);
                balBook.push({
                    "name": name,
                    "symbol": symbol,
                    "balance": handleDecimal(balance, decimals)
                });    
            }
            
            var myOrderBook = [];
            for(var j in orderBook) {
                for(var jj in orderBook[j]){
                    if(orderBook[j][jj].owner.toLowerCase() === signer.toLowerCase()){
                        orderBook[j][jj]["id"] = jj;
                        myOrderBook.push(orderBook[j][jj]);
                    }
                }
            }
            setMyOrderBook(myOrderBook);
            setBalBook(balBook);
        };
        filterBook(currencyBook, orderBook);
    }, [currencyBook, orderBook, refresh])

    const onOptionClicked = value => () => {
        setSelectedOrder(getOrderById(value));
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

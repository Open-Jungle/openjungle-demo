import React, { useState }from 'react'
import getDexBook from '../contracts/getDexBook';
import getContract from '../contracts/getContract';

import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';

import IPFS from 'ipfs-core';

const HomePage = () => {
    const toBuffer = require('it-to-buffer');

    const [dexBook, setDexBook] = useState(undefined);
    const [bookSize, setBookSize] = useState(undefined);	
    const [currencyBookSize, setCurrencyBookSize] = useState(undefined);
    const [orderBook, setOrderBook] = useState(undefined);
    const [orderID, setOrderID] = useState(undefined);

    const addressFrom = '0x82e5bdA141c120c4d8750Aec4bfeFfc89698F2ea';	
    const addressTo = '0x1Df16Bba55D809d93Fb7D128a2DbF45F5ef38Af3';	

    const connectToDexBook = async e => {
        e.preventDefault();
        const { dexBook } = await getDexBook();
        setDexBook(dexBook);

        const bookSize = await dexBook.getOrderBookSize();
        const currencyBookSize = await dexBook.getCurrencyBookSize();
        
        setBookSize(bookSize.toString());
        setCurrencyBookSize(currencyBookSize.toString());
    };

    const newOrder = async e => {
        e.preventDefault();
        const { contract } = await getContract(addressFrom);
        const approve = await contract.approve('0x0a0CE136e6a653e7c30E8e681DcBfC5059EC0ea9', 1000);
        await approve.wait();

        const newOrder = await dexBook.newOrder(1, 2, 1000, 1);
        await newOrder.wait();

        getLatestOrderID()
    }

    const cancelOrder = async e => {
        e.preventDefault();
        await dexBook.cancelOrder(4);

        alert('order canceled');
    }

    const fillOrder = async e => {
        e.preventDefault();
        const { contract } = await getContract(addressTo);
        const approve = await contract.approve('0x0a0CE136e6a653e7c30E8e681DcBfC5059EC0ea9', 1000);
        await approve.wait();

        const fillOrder = await dexBook.fillOrder(9);
        await fillOrder.wait();

        alert('order filled');
    }

    const getLatestOrderID = async () => {
        let provider = await detectEthereumProvider();
        await provider.request({ method: 'eth_requestAccounts' });
        provider = new ethers.providers.Web3Provider(provider);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();

        var filter = {
            address: '0x0a0CE136e6a653e7c30E8e681DcBfC5059EC0ea9',
            topics: [
                '0x5278faed1185575ab8794d2f7094d533baa1889f86b34c254cc019ef59203bb5',
                '0x000000000000000000000000' + userAddress.substring(2)
            ],
            fromBlock: 10992452
        };

        var callPromise = provider.getLogs(filter);
        callPromise.then(function(events) {
            setOrderID(parseInt(events[events.length-1].topics[3]));
        }).catch(function(err){
            console.log(err);
        });
    }

    const loadOrderBook = async e => {
        e.preventDefault();
        const ipfs = await IPFS.create();
        const bufferedContents = await toBuffer(ipfs.cat('QmVBAeZZr4DaNbHJB8gzWpA2YdWEzW7EYk5fmTaNv8yP1H'));
        const orderBook = JSON.parse((new TextDecoder().decode(bufferedContents)));
        console.log(orderBook);
        setOrderBook(orderBook);
        ipfs.stop();
    }

    return (
        <>
            <button onClick={connectToDexBook}>connect Dex</button>
            <p>bookSize: {bookSize === undefined ? 'no data' : bookSize}</p>
            <p>currencyBookSize: {currencyBookSize === undefined ? 'no data' : currencyBookSize}</p>
            <p>==test for transactions==</p>
            <button onClick={newOrder}>new Order</button>
            <p>orderID: {orderID === undefined ? 'no data' : orderID}</p>
            <button onClick={cancelOrder}>cancel Order</button>
            <button onClick={fillOrder}>fill Order</button>
            <p>==IPFS==</p>
            <button onClick={loadOrderBook}>test IPFS</button>
            <p>{orderBook === undefined ? '' : orderBook['0x00010002']['1'].price}</p>
        </>
    );
}

export default HomePage

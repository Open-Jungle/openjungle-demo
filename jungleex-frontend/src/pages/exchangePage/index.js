import React, { useState, useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';

import NavBar from '../../components/NavBar';
import SideBar from '../../components/SideBar';
import PairBar from '../../components/PairBar';
import OrderBookSection from '../../components/OrderBookSection';
import InteractionSection from '../../components/InteractionSection';
import ChartSection from '../../components/ChartSection';
import BalOrderSection from '../../components/BalOrderSection';

import {
    FirstRow,
    SecondRow
} from './exchangePageElements'

const ExchangePage = ({ dexBook, ipfs, provider }) => {

    // === CONTRACT ADDRESS & MASTER POINTER ===
    const DEX_CONTRACT_ADDRESS = "0x21e71C0084b548EEE3b49F5E5a7C0650aCF504eE";
    const [dexBookDataIPFSHash, setDexBookDataIPFSHash] = useState(undefined);
    
    //data
    const [dexBookData, setDexBookData] = useState(undefined);
    const [chartData, setChartData] = useState(undefined);
    const [currencyBook, setCurrencyBook] = useState(undefined);
    const [orderBook, setOrderBook] = useState(undefined);

    //selections & status
    const [selectedPair, setSelectedPair] = useState(undefined);
    const [selectedOrder, setSelectedOrder] = useState(undefined);
    const [scrapeStatus, setScrapeStatus] = useState(undefined);
    const [status, setStatus] = useState("welcome");

    //toggles
    const [refresh, setRefresh] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => {setIsOpen(!isOpen)};

    useEffect(() => {
        async function initPage(ipfs, provider, dexBook) {
            let start = Date.now();

            const toBuffer = require('it-to-buffer');

            let dexBookDataIPFSHash = await dexBook.getDataIPFSLocation();
            dexBookDataIPFSHash = ethers.utils.base58.encode("0x1220" + dexBookDataIPFSHash);
            setDexBookData(dexBookDataIPFSHash);

            var bufferedContents = await toBuffer(ipfs.cat(dexBookDataIPFSHash));
            var dexBookData = JSON.parse((new TextDecoder().decode(bufferedContents)));
            
            bufferedContents = await toBuffer(ipfs.cat(dexBookData.currencyBook));
            var currencyBook = JSON.parse((new TextDecoder().decode(bufferedContents)));
           
            bufferedContents = await toBuffer(ipfs.cat(dexBookData.orderBook));
            var orderBook = JSON.parse((new TextDecoder().decode(bufferedContents)));
            
            bufferedContents = await toBuffer(ipfs.cat(dexBookData.chartData));
            var chartData = JSON.parse((new TextDecoder().decode(bufferedContents)));

            let latestBlock = dexBookData.lastIPFSUpdateBlock;
            
            let nbLogs = 0;
            let filter = { address: DEX_CONTRACT_ADDRESS, fromBlock: dexBookData.lastIPFSUpdateBlock };
            let callPromise = provider.getLogs(filter);
            callPromise.then( async function(events) {
                filterLogs(events);
            }
        }
        initPage(ipfs, provider, dexBook);
    }, [ipfs, provider, dexBook])
    
    useEffect(() => {
        const interval = setInterval( async () => {
            let nbLogs = 0;
            let filter = { address: DEX_CONTRACT_ADDRESS, fromBlock: scrapeStatus.latestBlock };
            let callPromise = provider.getLogs(filter);
            callPromise.then( async function(events) {
                filterLogs(events);
            }).catch(function(err){
                console.log(err);
            });
        }, refreshInterval);
        return () => { clearInterval(interval) }
    }, [orderBook, currencyBook, chartData, scrapeStatus, provider]);

    const filterLogs = async (events) => {
        let tempOrderBook = orderBook;
        let tempCurrencyBook = currencyBook;
        let tempChartData = chartData;
        let tempScrapeStatus = scrapeStatus;

        for(let i in events){
            switch(events[i].topics[0]){
                
                // set currency
                case "0xa83d05db890d90e2c4fcbcda6dcaf7496ec6d876345654077a40b81d87fea5af":
                    nbLogs = nbLogs + 1;
                    setStatus("scrapping log nb: " + (nbLogs) + " Set Currency");

                    var contractAddress = "0x" + events[i].topics[2].substring(26);
                    const { contract } = await getContract(contractAddress);

                    let currency = {
                        "currencyID": parseInt(events[i].data.substring(0,66)),
                        "name": await contract.name(),
                        "symbol": await contract.symbol(),
                        "oneMinusFees": parseInt("0x" + events[i].data.substring(66, 130)),
                        "decimals": await contract.decimals(),
                        "iconIPFSLocation": ethers.utils.base58.encode("0x1220" + events[i].data.substring(130))
                    }
                    tempCurrencyBook[contractAddress] = currency;

                    tempScrapeStatus.latestBlock = events[i].blockNumber;
                break;
                
                // new order
                case "0x29c530b05bef94e2779ef6c0fd084fea9cbfcad9a5a22811fe8a01e95f6acdb9": 
                    nbLogs = nbLogs + 1;
                    setStatus("scrapping log nb: " + (nbLogs) + " New Order");

                    let currencyFrom = "0x" + events[i].data.substring(26,66);
                    let currencyTo = "0x" + events[i].data.substring(90,130);
                    let pair = currencyFrom + currencyTo;
                    var orderID = parseInt(events[i].topics[2]);
                    let amountTo = await dexBook.getOrderAmountTo(orderID)
                    if(tempOrderBook[pair] === undefined){ tempOrderBook[pair] = {} }

                    let order = {
                        "owner": "0x" + events[i].topics[1].substring(26),
                        "currencyFrom": currencyFrom,
                        "currencyTo": currencyTo,
                        "amountFrom": parseInt("0x" + events[i].data.substring(130, 194)),
                        "amountTo": parseInt(amountTo.toString()),
                        "price": parseInt("0x" + events[i].data.substring(194)) / SIXTEEN_DECIMALS_ONE
                    };

                    tempOrderBook[pair][orderID] = order;

                    scrapeStatus.latestBlock = events[i].blockNumber;
                break;
                
                // cancel order
                case "0xafe5d45b77c7cea746dab67e30e6ca60c00cec51787feb121441c48ec20e3e57":
                    nbLogs = nbLogs + 1;
                    setStatus("scrapping log nb: " + (nbLogs) + " Cancel Order");

                    orderID = parseInt(events[i].topics[2]);
                    for(let pair in tempOrderBook){
                        if(tempOrderBook[pair][orderID] !== undefined) {
                            delete tempOrderBook[pair][orderID]
                            scrapeStatus.latestBlock = events[i].blockNumber;
                            break;
                        }
                    }
                break;
                
                // fill order
                case "0x4e359ed0bfd026757edbe34c77143705ed75e99be4048c6adf9a58f3c0db7211":
                    nbLogs = nbLogs + 1;
                    setStatus("scrapping log nb: " + (nbLogs) + " Fill Order");

                    orderID = parseInt(events[i].topics[3]);
                    for(let pair in tempOrderBook){
                        if(tempOrderBook[pair][orderID] !== undefined) {

                            const tickData  = await provider.getBlock(events[i].blockNumber);
                            let tick = {
                                time: parseInt(tickData.timestamp+"000"), 
                                value: tempOrderBook[pair][orderID].price
                            };
                            
                            if(tempChartData[pair] === undefined) { tempChartData[pair] = [tick] }
                            else {
                                let l = tempChartData[pair].length - 1;
                                for(let index in tempChartData[pair]){
                                    let tryIndex = l - index;
                                    if(tempChartData[pair][tryIndex].time <= tick.time){
                                        tempChartData[pair].splice(tryIndex+1, 0, tick);
                                        delete tempOrderBook[pair][orderID];
                                        scrapeStatus.latestBlock = events[i].blockNumber;
                                        break;    
                                    }
                                }
                            }
                            break;
                        }
                    }  
                break;

                // Set Currency Icon
                case "0x3c098e62c0feb3c01216f7e9358a236c2d15cf17d113e426c55b42e06b4ce3b1":
                    nbLogs = nbLogs + 1;
                    setStatus("scrapping log nb: " + (nbLogs) + " SetCurrency Icon");

                    contractAddress = "0x" + events[i].topics[2].substring(26);
                    tempCurrencyBook[contractAddress].iconIPFSLocation = ethers.utils.base58.encode("0x1220" + events[i].data.substring(2));
                break;

                // Set Main Data Location
                case "0xce825481561f2d9ff0108c267ccc1820f0a1f8d8920935c993ce8fbb59ddbbd3":
                    nbLogs = nbLogs + 1;
                    setStatus("scrapping log nb: " + (nbLogs) + " SetMainData");
                break;

                default:
                    alert('this should not happen');
                break;
            }
        }

        setDexBookData(dexBookData);
        setCurrencyBook(currencyBook);
        setOrderBook(orderBook);
        setChartData(chartData);

        setScrapeStatus({
            "lastUpdateTimeStamp": Date.now(),
            "lastUpdateNbLogSrapped": nbLogs,
            "lastUpdateRunTime": Date.now() - start,
            "mostRecentSeenBlock": latestBlock,
            "refeshInterval": 15000,
        });)
    }

    return (
        <>
            <SideBar 
                isOpen={isOpen} 
                toggle={toggle} 
            />

            <NavBar 
                toggle={toggle}
            />

            <PairBar 
                currencyBook={currencyBook}
                setCurrencyFrom={setCurrencyFrom}
                setCurrencyTo={setCurrencyTo}
            />

            <FirstRow>
                {/* <InteractionSection 
                    dexBook={dexBook}
                    selectedOrder={selectedOrder}
                    selectedPair={selectedPair}
                    setSelectedOrderById={setSelectedOrderById}
                /> */}
                {/* <OrderBookSection
                    orderBook={orderBook}
                    selectedPair={selectedPair}
                    setSelectedOrder={setSelectedOrder}
                /> */}
            </FirstRow>
           
            <SecondRow>
                {/* <ChartSection 
                    selectedPair={selectedPair}
                    chartData={chartData}
                /> */}
                {/* <BalOrderSection 
                    currencyBook={currencyBook}
                    orderBook={orderBook}
                    setSelectedOrder={setSelectedOrder}
                /> */}
            </SecondRow>
        </>
    );
}

export default ExchangePage

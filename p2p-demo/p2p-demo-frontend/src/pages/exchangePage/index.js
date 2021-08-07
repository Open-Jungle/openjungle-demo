import React, { useState, useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';
import getContract from '../../contracts/getContract';
import dexBookABI from '../../contracts/dexBook.json';

import LoadingPage from '../loadingPage';

import NavBar from '../../components/NavBar';
import SideBar from '../../components/SideBar';
import PairBar from '../../components/PairBar';
import OrderBookSection from '../../components/OrderBookSection';
import InteractionSection from '../../components/InteractionSection';
import ChartSection from '../../components/ChartSection';
import BalOrderSection from '../../components/BalOrderSection';

import {
    FirstRow,
    InteractionSectionWrapper
} from './exchangePageElements'

const ExchangePage = ({ dexBook, ipfs }) => {

    const SIXTEEN_DECIMALS_ONE = 10000000000000000;
    
    //data
    const [dexBookData, setDexBookData] = useState(undefined);
    const [chartData, setChartData] = useState(undefined);
    const [currencyBook, setCurrencyBook] = useState(undefined);
    const [orderBook, setOrderBook] = useState(undefined);

    //selections & status   
    const [selection, setSelection] = useState({
        "order": {
            "orderID": 0,
            "owner": '',
            "amountFrom": 0,
            "amountTo": 0,
            "price": 0
        },
        "pair": {
            "currencyFrom": '',
            "currencyTo": '',
            "currencyFromName": 'Select',
            "currencyToName": 'Select',
            "currencyFromSymbol": 'Select',
            "currencyToSymbol": 'Select',
            "pair": 'Select a pair',
            "invertedPair": 'Select a pair',
            "currencyFromIPFSIcon": '',
            "currencyToIPFSIcon": '',
            "currencyFromDecimals": 0,
            "currencyToDecimals": 0
        },
        "user": {
            "address": '',
        }
    });
    
    const [scrapeStatus, setScrapeStatus] = useState({
        "lastUpdateTimeStamp": 0,
        "lastUpdateNbLogSrapped": 0,
        "lastUpdateRunTime": 0,
        "latestBlock": 0,
    });

    const [dexStatus, setDexStatus] = useState("Unknow");
    const [initCompleted, setInitCompleted] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(undefined);
    const [refreshInterval] = useState(15000);

    //toggles
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => {setIsOpen(!isOpen)};

    const [isChart, setIsChart] = useState(false);
    const toggleChart = () => {setIsChart(!isChart)};

    const [isInteraction, setIsInteraction] = useState(false);
    const toggleInteraction = () => {setIsInteraction(!isInteraction)};

    useEffect(() => {
        console.log("init loop");
        async function initPage() {
            let start = Date.now();

            const toBuffer = require('it-to-buffer');

            let dexBookDataIPFSHash = await dexBook.getDataIPFSLocation();
            dexBookDataIPFSHash = ethers.utils.base58.encode("0x1220" + dexBookDataIPFSHash.substring(2));

            var bufferedContents = await toBuffer(ipfs.cat(dexBookDataIPFSHash));
            var dexBookData = JSON.parse((new TextDecoder().decode(bufferedContents)));

            bufferedContents = await toBuffer(ipfs.cat(dexBookData.currencyBook));
            var tempCurrencyBook = JSON.parse((new TextDecoder().decode(bufferedContents)));

            bufferedContents = await toBuffer(ipfs.cat(dexBookData.orderBook));
            var tempOrderBook = JSON.parse((new TextDecoder().decode(bufferedContents)));
            
            bufferedContents = await toBuffer(ipfs.cat(dexBookData.chartData));
            var tempChartData = JSON.parse((new TextDecoder().decode(bufferedContents)));

            let filter = { address: dexBookABI.networks["97"].address, fromBlock: dexBookData.lastIPFSUpdateBlock };
            let provider = await detectEthereumProvider();
            await provider.request({ method: 'eth_requestAccounts' });
            provider = new ethers.providers.Web3Provider(provider);
            let signer = await provider.getSigner().getAddress();
            let callPromise = provider.getLogs(filter);
            callPromise.then( async function(events) { 
                let latestBlock = dexBookData.lastIPFSUpdateBlock
                let nbLogs = dexBookData.totalNbLogs;

                for(let i in events){
                    switch(events[i].topics[0]){
                        
                        // set currency
                        case "0xa83d05db890d90e2c4fcbcda6dcaf7496ec6d876345654077a40b81d87fea5af":
                            nbLogs = nbLogs + 1;

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

                            latestBlock = events[i].blockNumber;
                        break;
                        
                        // new order
                        case "0x29c530b05bef94e2779ef6c0fd084fea9cbfcad9a5a22811fe8a01e95f6acdb9": 
                            nbLogs = nbLogs + 1;

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
                            latestBlock = events[i].blockNumber;
                        break;
                        
                        // cancel order
                        case "0xafe5d45b77c7cea746dab67e30e6ca60c00cec51787feb121441c48ec20e3e57":
                            nbLogs = nbLogs + 1;

                            orderID = parseInt(events[i].topics[2]);
                            for(let pair in tempOrderBook){
                                if(tempOrderBook[pair][orderID] !== undefined) {
                                    delete tempOrderBook[pair][orderID]
                                    latestBlock = events[i].blockNumber;
                                    break;
                                }
                            }
                        break;
                        
                        // fill order
                        case "0x4e359ed0bfd026757edbe34c77143705ed75e99be4048c6adf9a58f3c0db7211":
                            nbLogs = nbLogs + 1;

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
                                                break;    
                                            }
                                        }
                                    }
                                    latestBlock = events[i].blockNumber;
                                    delete tempOrderBook[pair][orderID];
                                    break;
                                }
                            }  
                        break;

                        // Set Currency Icon
                        case "0x3c098e62c0feb3c01216f7e9358a236c2d15cf17d113e426c55b42e06b4ce3b1":
                            nbLogs = nbLogs + 1;

                            contractAddress = "0x" + events[i].topics[2].substring(26);
                            tempCurrencyBook[contractAddress].iconIPFSLocation = ethers.utils.base58.encode("0x1220" + events[i].data.substring(2));
                            latestBlock = events[i].blockNumber;
                        break;

                        // Set Main Data Location
                        case "0xce825481561f2d9ff0108c267ccc1820f0a1f8d8920935c993ce8fbb59ddbbd3":
                            nbLogs = nbLogs + 1;

                            latestBlock = events[i].blockNumber;
                        break;

                        default:
                            alert('this should not happen');
                        break;
                    }
                }

                let currencyFrom = "0x7de87fe5a3ed18c9d354aeb94a32da98856d6239";
                let currencyTo = "0x7d8bcbcc2a3f86112e16c1afc3d9e72df661d86b";
                setSelection({
                    "order": {
                        "orderID": 0,
                        "owner": '',
                        "amountFrom": 0,
                        "amountTo": 0,
                        "price": 0
                    },
                    "pair":{
                        "currencyFrom": currencyFrom,
                        "currencyTo": currencyTo,
                        "currencyFromName": tempCurrencyBook[currencyFrom].name,
                        "currencyToName": tempCurrencyBook[currencyTo].name,
                        "currencyFromSymbol":  tempCurrencyBook[currencyFrom].symbol,
                        "currencyToSymbol": tempCurrencyBook[currencyTo].symbol,
                        "pair": "" + currencyFrom + currencyTo,
                        "invertedPair": "" + currencyTo + currencyFrom,
                        "currencyFromIPFSIcon": tempCurrencyBook[currencyFrom].iconIPFSLocation,
                        "currencyToIPFSIcon": tempCurrencyBook[currencyTo].iconIPFSLocation,
                        "currencyFromDecimals": tempCurrencyBook[currencyFrom].decimals,
                        "currencyToDecimals": tempCurrencyBook[currencyTo].decimals
                    },
                    "user":{
                        "address": signer
                    }
                });

                setDexBookData(dexBookData);
                setCurrencyBook(tempCurrencyBook);
                setOrderBook(tempOrderBook);
                setChartData(tempChartData);

                setScrapeStatus({
                    "lastUpdateTimeStamp": Date.now(),
                    "lastUpdateNbLogSrapped": nbLogs,
                    "lastUpdateRunTime": Date.now() - start,
                    "latestBlock": latestBlock,
                });

                setInitCompleted(true);
            }).catch(function(err){
                console.log(err);
            });
        }
        initPage();
    }, [dexBook, ipfs])
    
    useEffect(() => {
        let interval;
        const startTimer = () => {
            setDexStatus("Live");
            const nowPlusRefreshInt = new Date().getTime() + refreshInterval;

            interval = setInterval(() => {
                const now = new Date().getTime();
                const distance = nowPlusRefreshInt - now;
                const seconds = Math.floor((distance % (60 * 1000)) / 1000);

                if (distance < 0) {
                    // Stop Timer
                    setDexStatus("Updating ... ");
                    clearInterval(interval);
                } 
                else {
                    // Update Timer
                    setTimerSeconds(seconds);
                }
            });
        };

        const stopTimer = () => {
            clearInterval(interval);
        }

        if(initCompleted === true){
            stopTimer();
            startTimer();
            console.log("updateLoop from block: " + scrapeStatus.latestBlock);
            let start = Date.now();
            const interval = setInterval( async () => {
                let filter = { address: dexBookABI.networks["97"].address, fromBlock: scrapeStatus.latestBlock };
                let provider = await detectEthereumProvider();
                await provider.request({ method: 'eth_requestAccounts' });
                provider = new ethers.providers.Web3Provider(provider);
                let nowBlock = await provider.getBlockNumber();
                let callPromise = provider.getLogs(filter);
                callPromise.then( async function(events) {
                    let tempOrderBook = orderBook;
                    let tempCurrencyBook = currencyBook;
                    let tempChartData = chartData;
                    let tempScrapeStatus = scrapeStatus;
                    let nbLogs = 0;

                    for(let i in events){
                        switch(events[i].topics[0]){
                            
                            // set currency
                            case "0xa83d05db890d90e2c4fcbcda6dcaf7496ec6d876345654077a40b81d87fea5af":
                                nbLogs = nbLogs + 1;

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
                                tempScrapeStatus.latestBlock = events[i].blockNumber;
                            break;
                            
                            // cancel order
                            case "0xafe5d45b77c7cea746dab67e30e6ca60c00cec51787feb121441c48ec20e3e57":
                                nbLogs = nbLogs + 1;

                                orderID = parseInt(events[i].topics[2]);
                                for(let pair in tempOrderBook){
                                    if(tempOrderBook[pair][orderID] !== undefined) {
                                        delete tempOrderBook[pair][orderID]
                                        tempScrapeStatus.latestBlock = events[i].blockNumber;
                                        break;
                                    }
                                }
                            break;
                            
                            // fill order
                            case "0x4e359ed0bfd026757edbe34c77143705ed75e99be4048c6adf9a58f3c0db7211":
                                nbLogs = nbLogs + 1;

                                orderID = parseInt(events[i].topics[3]);
                                for(let pair in tempOrderBook){
                                    if(tempOrderBook[pair][orderID] !== undefined) {

                                        const tickData  = await provider.getBlock(events[i].blockNumber);
                                        let tick = {
                                            time: parseInt(tickData.timestamp), 
                                            value: tempOrderBook[pair][orderID].price
                                        };
                                        
                                        if(tempChartData[pair] === undefined) { tempChartData[pair] = [tick] }
                                        else {
                                            let l = tempChartData[pair].length - 1;
                                            for(let index in tempChartData[pair]){
                                                let tryIndex = l - index;
                                                if(tempChartData[pair][tryIndex].time <= tick.time){
                                                    tempChartData[pair].splice(tryIndex+1, 0, tick);
                                                    
                                                    break;    
                                                }
                                            }
                                        }
                                        delete tempOrderBook[pair][orderID];
                                        tempScrapeStatus.latestBlock = events[i].blockNumber;
                                        break;
                                    }
                                }  
                            break;

                            // Set Currency Icon
                            case "0x3c098e62c0feb3c01216f7e9358a236c2d15cf17d113e426c55b42e06b4ce3b1":
                                nbLogs = nbLogs + 1;
                                contractAddress = "0x" + events[i].topics[2].substring(26);
                                tempCurrencyBook[contractAddress].iconIPFSLocation = ethers.utils.base58.encode("0x1220" + events[i].data.substring(2));
                                tempScrapeStatus.latestBlock = events[i].blockNumber;
                            break;

                            // Set Main Data Location
                            case "0xce825481561f2d9ff0108c267ccc1820f0a1f8d8920935c993ce8fbb59ddbbd3":
                                nbLogs = nbLogs + 1;
                                tempScrapeStatus.latestBlock = events[i].blockNumber;
                            break;

                            default:
                                //alert('this should not happen');
                            break;
                        }
                    }

                    setDexBookData(dexBookData);
                    setCurrencyBook(tempCurrencyBook);
                    setOrderBook(tempOrderBook);
                    setChartData(tempChartData);

                    setScrapeStatus({
                        "lastUpdateTimeStamp": Date.now(),
                        "lastUpdateNbLogSrapped": nbLogs,
                        "lastUpdateRunTime": Date.now() - start - refreshInterval,
                        "latestBlock": nowBlock,
                    });
                }).catch(function(err){
                    console.log(err);
                });
            }, refreshInterval); 
            return () => { clearInterval(interval) }
        } else { console.log("aborted update") }
    }, [chartData, currencyBook, dexBook, dexBookData, orderBook, scrapeStatus, initCompleted, refreshInterval]);

    //Setters
    const setPair = (currencyFrom, currencyTo) => {
        currencyFrom = (currencyFrom === undefined ? '' : currencyFrom); 
        currencyTo = (currencyTo === undefined ? '' : currencyTo);
        let tempSelection = {
            "order": {
                "orderID": 0,
                "owner": '',
                "amountFrom": 0,
                "amountTo": 0,
                "price": 0
            },
            "pair":{
                "currencyFrom": currencyFrom,
                "currencyTo": currencyTo,
                "currencyFromName": (currencyBook[currencyFrom] === undefined ? '' : currencyBook[currencyFrom].name),
                "currencyToName": (currencyBook[currencyTo] === undefined ? '' : currencyBook[currencyTo].name),
                "currencyFromSymbol": (currencyBook[currencyFrom] === undefined ? '' : currencyBook[currencyFrom].symbol),
                "currencyToSymbol": (currencyBook[currencyTo] === undefined ? '' : currencyBook[currencyTo].symbol),
                "pair": "" + currencyFrom + currencyTo,
                "invertedPair": "" + currencyTo + currencyFrom,
                "currencyFromIPFSIcon": (currencyBook[currencyFrom] === undefined ? '' : currencyBook[currencyFrom].iconIPFSLocation),
                "currencyToIPFSIcon": (currencyBook[currencyTo] === undefined ? '' : currencyBook[currencyTo].iconIPFSLocation),
                "currencyFromDecimals": (currencyBook[currencyFrom] === undefined ? '' : currencyBook[currencyFrom].decimals),
                "currencyToDecimals": (currencyBook[currencyTo] === undefined ? '' : currencyBook[currencyTo].decimals)
            },
            "user": selection.user
        }
        setSelection(tempSelection);
    }

    const setSelectionByOrderId = (orderID) => {
        for(let pair in orderBook){
            if(orderBook[pair][orderID] !== undefined){
                let tempSelection = {
                    "order": {
                        "orderID": orderID,
                        "owner": orderBook[pair][orderID].owner,
                        "amountFrom": orderBook[pair][orderID].amountFrom,
                        "amountTo": orderBook[pair][orderID].amountTo,
                        "price": orderBook[pair][orderID].price
                    },
                    "pair":{
                        "currencyFrom": orderBook[pair][orderID].currencyFrom,
                        "currencyTo": orderBook[pair][orderID].currencyTo,
                        "currencyFromName": currencyBook[orderBook[pair][orderID].currencyFrom].name,
                        "currencyToName": currencyBook[orderBook[pair][orderID].currencyTo].name,
                        "currencyFromSymbol": currencyBook[orderBook[pair][orderID].currencyFrom].symbol,
                        "currencyToSymbol": currencyBook[orderBook[pair][orderID].currencyTo].symbol,
                        "pair": pair,
                        "invertedPair": "" + orderBook[pair][orderID].currencyTo + orderBook[pair][orderID].currencyFrom,
                        "currencyFromIPFSIcon": currencyBook[orderBook[pair][orderID].currencyFrom].iconIPFSLocation,
                        "currencyToIPFSIcon": currencyBook[orderBook[pair][orderID].currencyTo].iconIPFSLocation,
                        "currencyFromDecimals": currencyBook[orderBook[pair][orderID].currencyFrom].decimals,
                        "currencyToDecimals": currencyBook[orderBook[pair][orderID].currencyTo].decimals
                    },
                    "user": selection.user
                }
                setSelection(tempSelection);
                break;
            }
        }   
    }

    return (
        <>
            {!initCompleted ? 
                <LoadingPage /> : 
                <>
                    <SideBar 
                        isOpen={isOpen} 
                        toggle={toggle} 
                    />

                    <NavBar 
                        toggle={toggle}
                        dexStatus={dexStatus}
                        scrapeStatus={scrapeStatus}
                        timerSeconds={timerSeconds}
                    />

                    <PairBar 
                        currencyBook={currencyBook}
                        selection={selection}
                        setPair={setPair}
                    />

                    {isChart ? 
                        <></> :
                        <>
                            <FirstRow>
                                <OrderBookSection
                                    orderBook={orderBook}
                                    selection={selection}
                                    setSelectionByOrderId={setSelectionByOrderId}
                                />
                                <InteractionSectionWrapper isInteraction={isInteraction}>
                                    <InteractionSection
                                        DEX_ADDRESS={dexBookABI.networks["97"].address}
                                        dexBook={dexBook}
                                        selection={selection}
                                        setSelectionByOrderId={setSelectionByOrderId}
                                        toggleInteraction={toggleInteraction}
                                        isInteraction={isInteraction}
                                    /> 
                                </InteractionSectionWrapper>
                            </FirstRow>
                    
                            <BalOrderSection 
                                currencyBook={currencyBook}
                                orderBook={orderBook}
                                setSelectionByOrderId={setSelectionByOrderId}
                            />
                        </>
                    }
                    <ChartSection
                        selection={selection}
                        chartData={chartData}
                        isChart={isChart}
                        toggleChart={toggleChart}
                    />
                    

                    
                </>
            } 
        </>
    );
}

export default ExchangePage

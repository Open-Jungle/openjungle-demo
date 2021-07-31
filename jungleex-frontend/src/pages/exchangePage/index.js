import React, { useState, useEffect } from 'react';
import IPFS from 'ipfs-core';
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

import TestSection from '../../components/TestSection';

const ExchangePage = ({ dexBook }) => {
    const dexBookDataIPFSHash = 'QmRiiDoRDPDRwcWvhB5diHFg3kB6djbLVsQfTiFQeJkrYK';

    //data
    const [dexBookData, setDexBookData] = useState(undefined);
    const [chartData, setChartData] = useState(undefined);
    const [currencyBook, setCurrencyBook] = useState(undefined);
    const [orderBook, setOrderBook] = useState(undefined);
    const [upToBlock, setUpToBlock] = useState(11042349);
    const [refreshInterval] = useState(15000);

    //selections
    const [currencyFrom, setCurrencyFrom] = useState(undefined);
    const [currencyTo, setCurrencyTo] = useState(undefined);
    const [selectedOrder, setSelectedOrder] = useState(undefined);

    //toggles
    const [refresh, setRefresh] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => {setIsOpen(!isOpen)};

    useEffect(() => {
        async function loadData() {
            const toBuffer = require('it-to-buffer');
            const ipfs = await IPFS.create();

            var bufferedContents = await toBuffer(ipfs.cat(dexBookDataIPFSHash));
            const dexBookData = JSON.parse((new TextDecoder().decode(bufferedContents)));
            setDexBookData(dexBookData);

            bufferedContents = await toBuffer(ipfs.cat(dexBookData.currencyBook));
            const currencyBook = JSON.parse((new TextDecoder().decode(bufferedContents)));
            setCurrencyBook(currencyBook);
            
            bufferedContents = await toBuffer(ipfs.cat(dexBookData.orderBook));
            const orderBook = JSON.parse((new TextDecoder().decode(bufferedContents)));
            setOrderBook(orderBook);

            bufferedContents = await toBuffer(ipfs.cat(dexBookData.chartData));
            const chartData = JSON.parse((new TextDecoder().decode(bufferedContents)));
            setChartData(chartData);

            setUpToBlock(dexBookData.lastIPFSUpdateBlock);

            ipfs.stop();
        }
        loadData();
    }, [])

    useEffect(() => {
        const mkpair = (idFrom, idTo) => {
            if(parseInt(idFrom) < parseInt(idTo)){
                return idFrom + idTo.substring(2);
            } else {
                return idTo + idFrom.substring(2);
            }
        }

        const hex_to_ascii = (str1) => {
            var hex  = str1.toString();
            var str = '';
            for (var n = 0; n < hex.length; n += 2) {
                str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
            }
            return str;
        }

        const interval = setInterval( async () => {
            console.log('fetching logs ... ')
            let provider = await detectEthereumProvider();
            await provider.request({ method: 'eth_requestAccounts' });
            provider = new ethers.providers.Web3Provider(provider);

            var filter = {
                address: '0x0a0CE136e6a653e7c30E8e681DcBfC5059EC0ea9',
                fromBlock: upToBlock
            };

            var callPromise = provider.getLogs(filter);
            callPromise.then(function(events) {

                var tempOrderBook = orderBook;
                var tempCurrencyBook = currencyBook;
                var tempChartData = chartData;

                for(var i in events){
                    switch(events[i].topics[0]){

                        case "0x8b7c3b99fa246a94698cde11b32f366c6e0a7aad7a5be35b0a990203a77da18a":
                        // set currency
                        var currency = {
                            "address": "0x" + events[i].data.substring(26,66),
                            "name": hex_to_ascii("0x" + events[i].data.substring(258)).substring(33,36),
                            "oneMinusFees": parseInt("0x" + events[i].data.substring(130,194)),
                            "decimals": parseInt("0x" + events[i].data.substring(194, 258))
                        }
                        tempCurrencyBook[parseInt(events[i].topics[1].substring(0,34))] = currency;
                        setUpToBlock(events[i].blockNumber);
                        break;

                        case "0x5278faed1185575ab8794d2f7094d533baa1889f86b34c254cc019ef59203bb5": 
                        // new order
                        if(tempOrderBook[events[i].topics[2]] === undefined){
                            tempOrderBook[events[i].topics[2]] = {};
                        }

                        var order = {};
                        order["owner"] = "0x" + events[i].topics[1].substring(26);
                        order["currencyIDFrom"] = events[i].topics[2].substring(0,34);
                        order["currencyIDTo"] = "0x" + events[i].topics[2].substring(34);
                        order["amount"] = parseInt(events[i].data.substring(0,66));
                        order["price"] = parseInt("0x" + events[i].data.substring(66));

                        tempOrderBook[events[i].topics[2]][parseInt(events[i].topics[3])] = order;
                        setUpToBlock(events[i].blockNumber);
                        break;

                        case "0xcbfa7d191838ece7ba4783ca3a30afd316619b7f368094b57ee7ffde9a923db1":
                        // cancel order
                        delete tempOrderBook[events[i].topics[2]][parseInt(events[i].topics[3])];
                        break;

                        case "0xda67fd5efd7c65cc617b4e30cdd2569c6c2b3d0034729f3c616c6a83b4520a8f":
                        // fill order
                        var pair = mkpair(events[i].topics[2].substring(0,34), "0x" + events[i].topics[2].substring(34));
                        if(tempChartData[pair] === undefined){
                            tempChartData[pair] = {
                                blocks: [],
                                prices: []
                            }
                        }
                        
                        delete tempOrderBook[events[i].topics[2]][parseInt(events[i].topics[3])];
                        tempChartData[pair].blocks.push(parseInt(events[i].blockNumber));
                        tempChartData[pair].prices.push(parseInt("0x" + events[i].data.substring(66)));
                        setUpToBlock(events[i].blockNumber);
                        break;
                        default:
                            alert('this should not happen');
                        break;
                    }
                }
                setOrderBook(tempOrderBook);
                setCurrencyBook(tempCurrencyBook);
                setChartData(tempChartData);
                setRefresh(false);
            }).catch(function(err){
                console.log(err);
            });
        }, refreshInterval);
        return () => { clearInterval(interval) }
    }, [upToBlock, orderBook, currencyBook, chartData, refreshInterval]);

    const currencyNameToID = (name) => {
        for(var i in currencyBook){
            if(currencyBook[i].name === name){
                return i;
            }
        }
        return undefined;
    }

    const getOrderById = (id) => {
        for(var i in orderBook){
            for(var ii in orderBook[i]){
                if(ii === id){
                    return [i, ii, orderBook[i][ii]]
                }
            }
        }
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
                <InteractionSection 
                    selectedOrder={selectedOrder}
                    dexBook={dexBook}
                    safeScrappe={dexBookData === undefined ? upToBlock : dexBookData.lastIPFSUpdateBlock}
                    currencyFrom={currencyFrom}
                    currencyTo={currencyTo}
                    currencyNameToID={currencyNameToID}
                    currencyBook={currencyBook}
                    orderBook={orderBook}
                    getOrderById={getOrderById}
                    setSelectedOrder={setSelectedOrder}
                />
                <OrderBookSection
                    currencyFrom={currencyFrom}
                    currencyTo={currencyTo}
                    currencyNameToID={currencyNameToID}
                    currencyBook={currencyBook}
                    orderBook={orderBook}
                    setSelectedOrder={setSelectedOrder}
                    getOrderById={getOrderById}
                    refresh={refresh}
                    setRefresh={setRefresh}
                />
                
                
            </FirstRow>
           
            <SecondRow>
                <ChartSection 
                    currencyFrom={currencyNameToID(currencyFrom)}
                    currencyTo={currencyNameToID(currencyTo)}
                    chartData={chartData}
                    currencyBook={currencyBook}
                    refresh={refresh} 
                />
                <BalOrderSection 
                    currencyBook={currencyBook}
                    refresh={refresh}
                    setSelectedOrder={setSelectedOrder}
                    getOrderById={getOrderById}
                    orderBook={orderBook}
                />
            </SecondRow>
        </>
    );
}

export default ExchangePage

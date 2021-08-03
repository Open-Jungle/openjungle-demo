import React, { useState } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';

import getContract from '../utils/getContract'
import getDexBook from '../utils/getDexBook'

const HomePage = () => {

    const contractAddress = '0x21e71C0084b548EEE3b49F5E5a7C0650aCF504eE';
    const deployementBlock = 11134377;
    const SIXTEEN_DECIMALS_ONE = 10000000000000000;
    
    const [status, setStatus] = useState('Not started')

    const scrapper = async () => {
        
        const start = Date.now();
        let orderBook = {};
        let currencyBook = {};
        let chartData = {};
        let latestBlock = deployementBlock;
        let nbLogs = 0;
        let filter = { address: contractAddress, fromBlock: deployementBlock };

        
        setStatus("Connecting to provider");
        //let provider = await detectEthereumProvider();
        //await provider.request({ method: 'eth_requestAccounts' });
        //provider = new ethers.providers.Web3Provider(provider);
        const { dexBook, provider } = await getDexBook();

        
        setStatus("scrapping logs ...");
        let callPromise = provider.getLogs(filter);
        callPromise.then( async function(events) {
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
                        currencyBook[contractAddress] = currency;

                        latestBlock = events[i].blockNumber;
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
                        if(orderBook[pair] === undefined){ orderBook[pair] = {} }

                        let order = {
                            "owner": "0x" + events[i].topics[1].substring(26),
                            "currencyFrom": currencyFrom,
                            "currencyTo": currencyTo,
                            "amountFrom": parseInt("0x" + events[i].data.substring(130, 194)),
                            "amountTo": parseInt(amountTo.toString()),
                            "price": parseInt("0x" + events[i].data.substring(194)) / SIXTEEN_DECIMALS_ONE
                        };

                        orderBook[pair][orderID] = order;

                        latestBlock = events[i].blockNumber;
                    break;
                    
                    // cancel order
                    case "0xafe5d45b77c7cea746dab67e30e6ca60c00cec51787feb121441c48ec20e3e57":
                        nbLogs = nbLogs + 1;
                        setStatus("scrapping log nb: " + (nbLogs) + " Cancel Order");

                        orderID = parseInt(events[i].topics[2]);
                        for(let pair in orderBook){
                            if(orderBook[pair][orderID] !== undefined) {
                                delete orderBook[pair][orderID]
                                latestBlock = events[i].blockNumber;
                                break;
                            }
                        }
                    break;
                    
                    // fill order
                    case "0x4e359ed0bfd026757edbe34c77143705ed75e99be4048c6adf9a58f3c0db7211":
                        nbLogs = nbLogs + 1;
                        setStatus("scrapping log nb: " + (nbLogs) + " Fill Order");

                        orderID = parseInt(events[i].topics[3]);
                        for(let pair in orderBook){
                            if(orderBook[pair][orderID] !== undefined) {

                                const tickData  = await provider.getBlock(events[i].blockNumber);
                                let tick = {
                                    time: parseInt(tickData.timestamp+"000"), 
                                    value: orderBook[pair][orderID].price
                                };
                                
                                if(chartData[pair] === undefined) { chartData[pair] = [tick] }
                                else {
                                    let l = chartData[pair].length - 1;
                                    for(let index in chartData[pair]){
                                        let tryIndex = l - index;
                                        if(chartData[pair][tryIndex].time <= tick.time){
                                            chartData[pair].splice(tryIndex+1, 0, tick);
                                            break;    
                                        }
                                    }
                                }
                                delete orderBook[pair][orderID];
                                break;
                            }
                        }  
                    break;

                    // Set Currency Icon
                    case "0x3c098e62c0feb3c01216f7e9358a236c2d15cf17d113e426c55b42e06b4ce3b1":
                        nbLogs = nbLogs + 1;
                        setStatus("scrapping log nb: " + (nbLogs) + " SetCurrency Icon");

                        contractAddress = "0x" + events[i].topics[2].substring(26);
                        currencyBook[contractAddress].iconIPFSLocation = ethers.utils.base58.encode("0x1220" + events[i].data.substring(2));
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
            document.getElementById('orderBook').innerHTML = JSON.stringify(orderBook);
            document.getElementById('currencyBook').innerHTML = JSON.stringify(currencyBook);
            document.getElementById('chartData').innerHTML = JSON.stringify(chartData);
            document.getElementById('nbLogs').innerHTML = 'nbLogs: ' + nbLogs;
            document.getElementById('latestBlock').innerHTML = 'latestBlock: ' + latestBlock;
            document.getElementById('scrapeTime').innerHTML = 'scrapeTime: ' + (Date.now() - start);

            setStatus("Scrape complete");
        }).catch(function(err){
            console.log(err);
        });
    }

    const tscrappe = async () => {
        setStatus("doing total scrape ...");
        let provider = await detectEthereumProvider();
        await provider.request({ method: 'eth_requestAccounts' });
        provider = new ethers.providers.Web3Provider(provider);

        let filter = {
            address: contractAddress,
            fromBlock: deployementBlock
        };

        let callPromise = provider.getLogs(filter);
        callPromise.then(function(events) {
            for(let i in events){
                console.log(events[i]);
            }
        }).catch(function(err){
            console.log(err);
        });
        setStatus("Total scrape done");
    }

    return (
        <div style={{"marginLeft": "200px", "marginRight": "200px"}}>
            <h3>Status: {status}</h3>
            <h3>options</h3>
            <div>
                <label>scrape and format</label>
                <button onClick={scrapper}>srappe</button>
            </div>
            <div>
                <label>scrape without format</label>
                <button onClick={tscrappe}>total scrape</button>
            </div>
            <h3>Scrape Info</h3>
            <p>Started at block: {deployementBlock}</p>
            <p id={'latestBlock'}>up to Block:</p>
            <p id={'scrapeTime'}>scrape time:</p>
            <p id={'nbLogs'}>nb Logs:</p>
            <h3>orderBook</h3>
            <p id={'orderBook'} style={{"overflowWrap": "break-word"}}>-</p>
            <h3>currencyBook</h3>
            <p id={'currencyBook'} style={{"overflowWrap": "break-word"}}>-</p>
            <h3>chartData</h3>
            <p id={'chartData'} style={{"overflowWrap": "break-word"}}>-</p> 
        </div>
    )
}

export default HomePage

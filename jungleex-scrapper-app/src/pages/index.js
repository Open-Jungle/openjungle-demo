import React from 'react'
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';

const HomePage = () => {

    var orderBook = {};
    var currencyBook = {};
    var chartData = {};

    const scrapper = async () => {
        console.log("scrapping orders ...")
        let provider = await detectEthereumProvider();
        await provider.request({ method: 'eth_requestAccounts' });
        provider = new ethers.providers.Web3Provider(provider);

        var filter = {
            address: '0x0a0CE136e6a653e7c30E8e681DcBfC5059EC0ea9',
            fromBlock: 10000000
        };

        var callPromise = provider.getLogs(filter);
        callPromise.then(function(events) {
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
                    currencyBook[parseInt(events[i].topics[1].substring(0,34))] = currency;
                    break;

                    case "0x5278faed1185575ab8794d2f7094d533baa1889f86b34c254cc019ef59203bb5": 
                    // new order
                    if(orderBook[events[i].topics[2]] === undefined){
                        orderBook[events[i].topics[2]] = {};
                    }

                    var order = {};
                    order["owner"] = "0x" + events[i].topics[1].substring(26);
                    order["currencyIDFrom"] = events[i].topics[2].substring(0,34);
                    order["currencyIDTo"] = "0x" + events[i].topics[2].substring(34);
                    order["amount"] = parseInt(events[i].data.substring(0,66));
                    order["price"] = parseInt("0x" + events[i].data.substring(66));

                    orderBook[events[i].topics[2]][parseInt(events[i].topics[3])] = order;
                    break;

                    case "0xcbfa7d191838ece7ba4783ca3a30afd316619b7f368094b57ee7ffde9a923db1":
                    // cancel order
                    delete orderBook[events[i].topics[2]][parseInt(events[i].topics[3])];
                    break;

                    case "0xda67fd5efd7c65cc617b4e30cdd2569c6c2b3d0034729f3c616c6a83b4520a8f":
                    // fill order
                    var pair = mkpair(events[i].topics[2].substring(0,34), "0x" + events[i].topics[2].substring(34));
                    if(chartData[pair] === undefined){
                        chartData[pair] = {
                            blocks: [],
                            prices: []
                        }
                    }
                    
                    delete orderBook[events[i].topics[2]][parseInt(events[i].topics[3])];
                    chartData[pair].blocks.push(parseInt(events[i].blockNumber));
                    chartData[pair].prices.push(parseInt("0x" + events[i].data.substring(66)));
                    break;
                    default:
                        alert('this should not happen');
                    break;
                }

                
            }
            console.log(JSON.stringify(orderBook));
            console.log(JSON.stringify(currencyBook));
            console.log(JSON.stringify(chartData));
        }).catch(function(err){
            console.log(err);
        });
    }

    const tscrappe = async () => {
        console.log("scrapping orders ...")
        let provider = await detectEthereumProvider();
        await provider.request({ method: 'eth_requestAccounts' });
        provider = new ethers.providers.Web3Provider(provider);

        var filter = {
            address: '0x0a0CE136e6a653e7c30E8e681DcBfC5059EC0ea9',
            fromBlock: 10000000
        };

        var callPromise = provider.getLogs(filter);
        callPromise.then(function(events) {
            for(var i in events){
                console.log(events[i]);
            }
        }).catch(function(err){
            console.log(err);
        });
    }

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
  
    return (
        <>
            <button onClick={scrapper}>srappe</button>
            <button onClick={tscrappe}>total scrape</button>
        </>
    )
}

export default HomePage

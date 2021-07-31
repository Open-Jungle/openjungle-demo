import React, { useEffect } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';

import {
    ChartSectionWrapper,
    Chart
} from './chartSectionElements';

const ChartSection = ({ 
                    chartData,
                    currencyBook,
                    refresh,
                    currencyTo,
                    currencyFrom,
                }) => {

    useEffect(() => {
        const padHexPair = (hexFrom, hexTo) => {
            return '0x'+'00000000000000000000000000000000'.substring(0, 32 - hexFrom.length) + hexFrom + '00000000000000000000000000000000'.substring(0, 32 - hexTo.length) + hexTo;
        };

        const stampToDate = (stamp) => {
            var date_not_formatted = new Date(stamp);
            var formatted_string = date_not_formatted.getFullYear() + "-";
            if (date_not_formatted.getMonth() < 9) { formatted_string += "0"; }
            formatted_string += (date_not_formatted.getMonth() + 1);
            formatted_string += "-";
            if(date_not_formatted.getDate() < 10) { formatted_string += "0"; }
            formatted_string += date_not_formatted.getDate();
            return formatted_string;
        }
        
        async function setChartData(chartData, currencyTo, currencyFrom) {
            var formatedData = [];
            if(currencyFrom !== undefined & currencyTo !== undefined){
                
                const pair = padHexPair(currencyFrom, currencyTo)
                
                let provider = await detectEthereumProvider();
                await provider.request({ method: 'eth_requestAccounts' });
                provider = new ethers.providers.Web3Provider(provider);
                
                for(var i in chartData){
                    if(i === pair){
                        for(var ii in chartData[i].blocks){
                            const tickData  = await provider.getBlock(chartData[i].blocks[ii])
                            formatedData.push({
                                time: stampToDate(parseInt(tickData.timestamp+"000")), 
                                value: chartData[i].prices[ii]
                            })
                        }
                    }
                }
            }
            document.getElementById("chart1").innerHTML = '';
            var chart = createChart(document.getElementById("chart1"), {
                width: 450,
                height: 200,
                crosshair: {
                    mode: CrosshairMode.Normal
                },
                priceScale: {
                    scaleMargins: {
                    top: 0.3,
                    bottom: 0.25
                    },
                    borderVisible: false
                },
                layout: {
                    backgroundColor: "#131722",
                    textColor: "#d1d4dc"
                },
                grid: {
                    vertLines: {
                    color: "rgba(42, 46, 57, 0)"
                    },
                    horzLines: {
                    color: "rgba(42, 46, 57, 0.6)"
                    }
                }
            });

            var areaSeries = chart.addAreaSeries({
                topColor: "rgba(38,198,218, 0.56)",
                bottomColor: "rgba(38,198,218, 0.04)",
                lineColor: "rgba(38,198,218, 1)",
                lineWidth: 2
            });

            areaSeries.setData(formatedData);
        }
        setChartData(chartData, currencyTo, currencyFrom);
    }, [chartData, currencyTo, currencyFrom, refresh])

    return (
        <ChartSectionWrapper>
            <Chart id="chart1" />
        </ChartSectionWrapper>
    )
}

export default ChartSection

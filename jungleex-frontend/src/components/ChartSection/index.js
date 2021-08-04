import React, { useEffect } from 'react';
import { createChart } from 'lightweight-charts';

import {
    ChartSectionWrapper,
    Chart
} from './chartSectionElements';

const ChartSection = ({ 
                    chartData,
                    selection
                }) => {

    useEffect(() => {
        console.log("chart section loop");
        
        async function setChartData(chartData, selection) {
            let formatedData = [];
            if(selection.pair.pair.length === 84){
                for(let tick in chartData[selection.pair.pair]){
                    formatedData.push(chartData[selection.pair.pair][tick]);
                }
                for(let tick in chartData[selection.pair.invertedPair]){
                    let l = formatedData.length - 1;
                    for(let index in formatedData){
                        let tryIndex = l - index;
                        if(formatedData[tryIndex].time <= tick.time){
                            formatedData.splice(tryIndex + 1, 0, {
                                time: tick.time,
                                price: 1 / tick.price
                            });
                            break;    
                        }
                    }
                }
            }
        
            document.getElementById("chart1").innerHTML = '';
            var chart = createChart(document.getElementById("chart1"), {
                width: 450,
                height: 200,
                layout: {
                    backgroundColor: '#ffffff',
                    textColor: 'rgba(33, 56, 77, 1)',
                },
                grid: {
                    vertLines: {
                        color: 'rgba(197, 203, 206, 0.7)',
                    },
                    horzLines: {
                        color: 'rgba(197, 203, 206, 0.7)',
                    },
                },
                timeScale: {
                    timeVisible: true,
                secondsVisible: false,
                },
            });

            var lineSeries = chart.addLineSeries();

            lineSeries.setData(formatedData);
        }
        setChartData(chartData, selection);
    }, [chartData, selection])

    return (
        <ChartSectionWrapper>
            <Chart id="chart1" />
        </ChartSectionWrapper>
    )
}

export default ChartSection

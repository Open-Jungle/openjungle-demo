import React, { useEffect } from 'react';
import { createChart } from 'lightweight-charts';
import useWindowDimensions from '../../hooks/useWindowDimensions';

import {
    ChartSectionWrapper,
    Chart,
    ToggleChartButton
} from './chartSectionElements';

const ChartSection = ({ chartData, selection, isChart, toggleChart}) => {
    
    const { height, width } = useWindowDimensions();

    useEffect(() => {
        console.log("chart section loop");
        
        const setChartData = (chartData, selection) => {
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
                width: width,
                height: height - 115,
                grid: {
                    horzLines: {
                        color: '#eee',
                    visible: false,
                    },
                    vertLines: {
                        color: '#ffffff',
                    },
                },
                crosshair: {
                    horzLine: {
                        visible: true,
                        labelVisible: true
                    },
                    vertLine: {
                        visible: true,
                        style: 0,
                        width: 2,
                        color: 'rgba(32, 38, 46, 0.1)',
                        labelVisible: true,
                    }
                },
                layout: {
                    backgroundColor: '#ffffff',
                    textColor: 'rgba(33, 56, 77, 1)',
                },
                timeScale: {
                    timeVisible: true,
                    secondsVisible: true,
                },
            });

            var lineSeries = chart.addAreaSeries({	
                topColor: 'rgba(19, 68, 193, 0.4)',	
                bottomColor: 'rgba(0, 120, 255, 0.0)',
                lineColor: 'rgba(19, 40, 153, 1.0)',
                lineWidth: 3
            });

            chart.timeScale().fitContent();

            lineSeries.setData(formatedData);
        }
        setChartData(chartData, selection);
    }, [chartData, selection, width, height])

    return (
        <>
            <ToggleChartButton onClick={toggleChart} isChart={isChart}>
                {isChart ? 'Close Chart' : 'Open Chart'}
            </ToggleChartButton>
            <ChartSectionWrapper height={height} width={width} isChart={isChart}>
                <Chart id="chart1" />
            </ChartSectionWrapper>
        </>
    )
}

export default ChartSection

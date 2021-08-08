import { useState, useEffect } from 'react';

import detectEthereumProvider from '@metamask/detect-provider';
import { ethers, Contract } from 'ethers';

import IPancakeFactoryABI from './ABI/IPancakeFactoryABI.json';
import IPancakeRouterABI from './ABI/IPancakeRouterABI.json';

import SwapPage from './pages/swapPage';
import LandingPage from './pages/landingPage';

function App() {

    const [metamask, setMetamask] = useState(false);
    const [facory, setFactory] = useState(undefined);
    const [router, setRouter] = useState(undefined);
    const [signer, setSigner] = useState(undefined);

    useEffect(() => {
        async function detectMetaMask() {
            let provider = await detectEthereumProvider();
            if(provider) {
                setMetamask(true);
            }
        }
        detectMetaMask();
    },[])

    const connectToPancakeswap = () => 
        new Promise( async (resolve, reject) => {
            let provider = await detectEthereumProvider();
            if(provider){
                await provider.request({ method: 'eth_requestAccounts' });
                let networkId = await provider.request({ method: 'net_version' })
                if(parseInt(networkId) !== 97){ reject('Must be on network 97 (Bsc testnet)');} 
                else {
                    provider = new ethers.providers.Web3Provider(provider);
                    const signer = provider.getSigner();
                    let factory = new Contract(
                        "0x6725F303b657a9451d8BA641348b6761A6CC7a17",
                        IPancakeFactoryABI.abi,
                        signer
                    );
                    let router = new Contract(
                        "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
                        IPancakeRouterABI.abi,
                        signer
                    );
                    resolve({factory, router, signer});
                    return;
                }
            }
            reject("Install Matamask");
        });
    

    const connect = async e => {
        e.preventDefault();
        const { factory, router, signer } = await connectToPancakeswap();
        setFactory(factory);
        setRouter(router);
        setSigner(signer);
    }

    return (
        <>
            {!metamask ? 
                <div style={{'textAlign': 'center', 'marginTop': '150px'}}>
                    You need Metamask to access the demo.
                </div> :
                <>
                    {(facory === undefined || router === undefined) ?
                        <LandingPage connect={connect}/> : 
                        <SwapPage 
                            signer={signer}
                            facory={facory}
                            router={router}
                        />
                    }
                </>
                
            }
        </>
    );
}

export default App;

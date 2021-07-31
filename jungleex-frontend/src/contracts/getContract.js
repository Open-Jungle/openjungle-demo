import detectEthereumProvider from '@metamask/detect-provider';
import { ethers, Contract } from 'ethers';	
import IBEP20ABI from './IBEP20ABI.json';	

const getContract = (address) =>
    new Promise( async (resolve, reject) => {
        let provider = await detectEthereumProvider();
        if(provider) {
            await provider.request({ method: 'eth_requestAccounts' });
            provider = new ethers.providers.Web3Provider(provider);
            const signer = provider.getSigner();
            let contract = undefined;
            try {
                contract = new Contract(
                    address, 	
                    IBEP20ABI.abi,										
                    signer
                );
            } catch (TypeError) {}
            if(contract === undefined){
                alert('Try again with Binance Smart Chain!')
                reject('Try again with Binance Smart Chain!');
            }
            resolve({contract});									
            return;
        }
        reject('Install Metamask');
    });

export default getContract;
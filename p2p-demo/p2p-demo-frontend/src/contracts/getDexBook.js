import detectEthereumProvider from '@metamask/detect-provider';
import { ethers, Contract } from 'ethers';
import dexBookABI from './dexBook.json';	

const getDexBook = () =>
    new Promise( async (resolve, reject) => {
        let provider = await detectEthereumProvider();
        if(provider) {
            await provider.request({ method: 'eth_requestAccounts' });
            const networkId = await provider.request({ method: 'net_version' })
            if(parseInt(networkId) !== 97){
                reject('Must be on network 97 (Bsc testnet)')
            }
            provider = new ethers.providers.Web3Provider(provider);
            const signer = provider.getSigner();
            let dexBook = undefined;
            try {
                dexBook = new Contract(
                    dexBookABI.networks[networkId].address, 	
                    dexBookABI.abi,										
                    signer
                );
            } catch (TypeError) {}
            resolve({dexBook});									
            return;
        }
        reject('Install Metamask');
    });

export default getDexBook;
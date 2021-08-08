import React from 'react';

import { Contract } from 'ethers';

import IBEP20ABI from '../../ABI/IBEP20ABI.json';

const SwapPage = ({ signer, facory, router }) => {

    const getTokens = (addressA, addressB, signer) => new Promise( async (resolve) => {
        let ITokenA = await new Contract( addressA, IBEP20ABI.abi, signer );
        let ITokenB = await new Contract( addressB, IBEP20ABI.abi, signer );
        resolve({ITokenA, ITokenB});									
    });

    const approveLiquidity = async e => {
        e.preventDefault();
        const { ITokenA, ITokenB } = await getTokens('0x7de87fe5a3ed18c9d354aeb94a32da98856d6239', '0x7d8bcbcc2a3f86112e16c1afc3d9e72df661d86b', signer);
        const tx1 = await ITokenA.approve(router.address, 1000000);
        await tx1.wait();
        const tx2 = await ITokenB.approve(router.address, 1000000);
        await tx2.wait();
        alert('liquidity approved, you can now add');
    }

    const addLiquidity = async e => {
        e.preventDefault();
        const addLiqu = await router.addLiquidity(
            '0x7de87fe5a3ed18c9d354aeb94a32da98856d6239',
            '0x7d8bcbcc2a3f86112e16c1afc3d9e72df661d86b',
            1000000,
            1000000,
            900000,
            900000,
            '0x0DE4322e534b6e9883A410BD94B97aeb3Aa346ee',
            (Math.floor(Date.now() / 1000) + 60 * 10)
        );
        await addLiqu.wait();
        alert('liquidity added');
    }

    return (
        <>
            <h1>welcome to the swap</h1>
            <h3>add liquidity</h3>
            <div style={{"display": "flex", "flexDirection": "column", "margin": "10%"}}>
                <label>Token A (Address)</label><input id={"al-ta"} placeholder={'0x7de87fe5a3ed18c9d354aeb94a32da98856d6239'}></input>
                <label>Token B (Address)</label><input id={"al-tb"} placeholder={'0x7d8bcbcc2a3f86112e16c1afc3d9e72df661d86b'}></input>
                <label>Amount A</label><input id={"al-aa"} placeholder={'1000000'}></input>
                <label>Amount B</label><input id={"al-ab"} placeholder={'1000000'}></input>
                <label>Amount A Min</label><input id={"al-aa-min"}></input>
                <label>Amount B Min</label><input id={"al-ab-min"}></input>
                <label>To (Address)</label><input id={"al-to"}></input>
                <label>Deadline</label><input id={"al-dl"}></input>
                <button onClick={approveLiquidity}>approve liquidity</button>
                <button onClick={addLiquidity}>add liquidity</button>
            </div>
            <h3>swap tokens for tokens</h3>

        </>
    )
}

export default SwapPage

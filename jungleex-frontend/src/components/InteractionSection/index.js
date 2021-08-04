import React, { useState } from 'react';
import {FaArrowRight, FaSearch} from 'react-icons/fa';

import getContract from '../../contracts/getContract';

import {
    InteractionSectionWrapper,
    PannelMenu,
    PannelMenuOption,
    PannelContent,
    NewOrderSection,
    FillOrderSection,
    CancelOrderSection,
    PannelRow,
    CurrencyWrapper,
    ArrowWrapper,
    InputWrapper,
    Label,
    Input,
    FillInfoText
} from './interactionSectionElements'

const InteractionSection = ({ 
                    DEX_ADDRESS,
                    dexBook,
                    selection,
                    setSelectedOrderById
                }) => {

    // for handling big numbers
    const {parseUnits} = require("@ethersproject/units");

    // to manage the toogles ..
    const [isNew, setIsNew] = useState(true);
    const [isCancel, setIsCancel] = useState(false);
    const [isFill, setIsFill] = useState(false);
    const toggleNew = () => {setIsNew(true);setIsCancel(false);setIsFill(false)};
    const toggleCancel = () => {setIsNew(false);setIsCancel(true);setIsFill(false)};
    const toggleFill = () => {setIsNew(false);setIsCancel(false);setIsFill(true)};

    // inputs and displays
    const [amount, setAmount] = useState(0);
    const [price, setPrice] = useState(0);
    const [status, setStatus] = useState('');

    const newOrder = async e => {
        e.preventDefault();
        if(amount === 0 || price === 0){
            alert('cant send order with zero value');
            return;
        }
        
        setStatus('Confirm Approval');
        const { contract } = await getContract(selection.pair.currencyFrom);
        const approve = await contract.approve(DEX_ADDRESS, parseUnits(amount.toString(),selection.pair.currencyFromDecimals));
        setStatus('Awaiting Approval');
        await approve.wait();

        setStatus('Confirm Transaction');
        const newOrder = await dexBook.newOrder(
            selection.pair.currencyFrom, 
            selection.pair.currencyTo, 
            parseUnits(amount.toString(),selection.pair.currencyFromDecimals), 
            parseUnits(price.toString(),16)
        );
        setStatus('Awaiting Transaction');
        await newOrder.wait();
        setStatus('Order Is Live');
    }

    const fillOrder = async e => {
        e.preventDefault();
        if(selection.order.orderID === 0){
            alert('must first select an order');
            return;
        }
        setStatus('Confirm Approval');
        const { contract } = await getContract(selection.pair.currencyTo);
        const trueAmountTo = await dexBook.getOrderAmountTo(selection.order.orderID);
        const approve = await contract.approve(DEX_ADDRESS, parseUnits(trueAmountTo.toString(), selection.pair.currencyToDecimals));
        setStatus('Awaiting Approval');
        await approve.wait();

        setStatus('Confirm Transaction');
        const fillOrder = await dexBook.fillOrder(selection.order.orderID);
        setStatus('Awaiting Transaction');
        await fillOrder.wait();
        setStatus('Order filled');
    }

    const cancelOrder = async e => {
        e.preventDefault();
        if(selection.order.orderID === 0){
            alert('must first select an order');
            return;
        }
        setStatus('Confirm Transaction');
        const cancelOrder = await dexBook.cancelOrder(selection.order.orderID);
        setStatus('Awaiting Transaction');
        await cancelOrder.wait()
        setStatus('Order canceled');
    }

    const handleAmountChange = (e) => {
        e.preventDefault();
        setAmount(document.getElementById('amount').value);
    }

    const handlePriceChange = (e) => {
        e.preventDefault();
        setPrice(document.getElementById('price').value);
    }

    const handleSearchOrderById = (e) => {
        e.preventDefault();
        setSelectedOrderById(document.getElementById('fillID').value);
    }    

    return (
        <InteractionSectionWrapper>
            <PannelMenu>
                <PannelMenuOption onClick={toggleNew} isOpen={isNew}>
                    New Order
                </PannelMenuOption>
                <PannelMenuOption onClick={toggleFill} isOpen={isFill}>
                    Fill Order
                </PannelMenuOption>
                <PannelMenuOption onClick={toggleCancel}  isOpen={isCancel}>
                    Cancel Order
                </PannelMenuOption>
            </PannelMenu>
            <PannelContent>

                <NewOrderSection isOpen={isNew}>
                    <PannelRow height={'40%'} display={'flex'} align={'center'}>
                        <CurrencyWrapper>
                            {selection.pair.currencyFromSymbol}
                        </CurrencyWrapper>
                        <ArrowWrapper>
                            <FaArrowRight />
                        </ArrowWrapper>
                        <CurrencyWrapper>
                            {selection.pair.currencyToSymbol}
                        </CurrencyWrapper>
                    </PannelRow>
                    <PannelRow height={'40%'} display={'block'} align={''}>
                        <InputWrapper>
                            <Label>Amount:</Label>
                            <Input onChange={handleAmountChange} id={'amount'}></Input>
                        </InputWrapper>
                        <InputWrapper>
                            <Label>price</Label>
                            <Input onChange={handlePriceChange} id={'price'}></Input>
                        </InputWrapper>
                    </PannelRow>
                    <PannelRow height={'20%'} display={'block'} align={'center'}>
                        <p>{amount} {selection.pair.currencyFromSymbol} <FaArrowRight /> {amount * price} {selection.pair.currencyToSymbol}.</p>
                        <button onClick={newOrder}>Confirm New Order</button>
                        <p>{status}</p>
                    </PannelRow>
                </NewOrderSection>


                <FillOrderSection isOpen={isFill}>
                    <PannelRow height={'20%'} display={'block'} align={'center'}>
                        <FillInfoText>
                            Select an order to fill it or search by ID.
                        </FillInfoText>
                        <Input id={'fillID'}></Input>
                        <button onClick={handleSearchOrderById}>
                            <FaSearch />
                        </button><br/>
                        <FillInfoText>
                            {selection.order.orderID}
                        </FillInfoText>
                    </PannelRow>
                    <PannelRow height={'20%'} display={'flex'} align={'center'}>
                        <CurrencyWrapper>
                            {selection.pair.currencyToName}
                        </CurrencyWrapper>
                        <ArrowWrapper>
                            <FaArrowRight />
                        </ArrowWrapper>
                        <CurrencyWrapper>
                            {selection.pair.currencyFromName}
                        </CurrencyWrapper>
                    </PannelRow>
                    <PannelRow height={'20%'} display={'block'} align={''}>
                        <p>
                            Amount: {selection.order.amountTo}
                        </p>
                        <p>
                            Price: {selection.order.price}
                        </p>
                    </PannelRow>
                    <PannelRow height={'20%'} display={'block'} align={'center'}>
                        <p>
                            {selection.order.amountTo} {selection.pair.currencyToName}
                            <FaArrowRight />
                            {selection.order.amountFrom} {selection.pair.currencyFromName}
                        </p>
                        <button onClick={fillOrder}>Confirm Fill Order</button>
                        <p>{status}</p>
                    </PannelRow>
                </FillOrderSection>
                
                <CancelOrderSection isOpen={isCancel}>
                    <PannelRow height={'20%'} display={'block'} align={'center'}>
                        <FillInfoText>
                            Select an order to fill it or search by ID.
                        </FillInfoText>
                        <Input id={'fillID'}></Input>
                        <button onClick={handleSearchOrderById}>
                            <FaSearch />
                        </button><br/>
                        <FillInfoText>
                            {selection.order.orderID}
                        </FillInfoText>
                    </PannelRow>
                    <PannelRow height={'20%'} display={'block'} align={'center'}>
                        <button onClick={cancelOrder}>Confirm Cancel Order</button>
                        <p>{status}</p>
                    </PannelRow>
                </CancelOrderSection>
            </PannelContent>
        </InteractionSectionWrapper>
    )
}

export default InteractionSection

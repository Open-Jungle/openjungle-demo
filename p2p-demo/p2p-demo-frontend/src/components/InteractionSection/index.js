import React, { useState, useEffect } from 'react';
import {FaArrowRight, FaSearch, FaArrowLeft, FaArrowDown} from 'react-icons/fa';

import getContract from '../../contracts/getContract';

import {
    InteractionSectionWrapper,
    PannelMenu,
    PannelMenuOption,
    PannelContent,
    NewOrderSection,
    FillOrderSection,
    CancelOrderSection,
    NewOrderCurrencyPannelRow,
    CurrencyWrapper,
    ArrowWrapper,
    InputWrapper,
    Label,
    Input,
    FillInfoText,
    IconWrapper,
    NewOrderInputPannelRow,
    ConfirmNewOrderPannelRow,
    ConfirmFillOrderPannelRow,
    FillOrderInputPannelRow,
    FillOrderInputWrapper,
    FillOrderSend,
    FillOrderInput,
    FillOrderInfoPannelRow,
    CancelOrderArrowWrapper,
    ClosePannelMobile
} from './interactionSectionElements'

const InteractionSection = ({ 
                    DEX_ADDRESS,
                    dexBook,
                    selection,
                    setSelectionByOrderId,
                    toggleInteraction,
                    isInteraction
                }) => {

    // for handling big numbers
    const {parseUnits} = require("@ethersproject/units");

    // to manage the toogles ..
    const [isNew, setIsNew] = useState(false);
    const [isCancel, setIsCancel] = useState(false);
    const [isFill, setIsFill] = useState(true);
    const toggleNew = () => {
        setIsNew(true);setIsCancel(false);setIsFill(false)
        if(isInteraction === false){
            toggleInteraction();
        }
    };
    const toggleCancel = () => {
        setIsNew(false);setIsCancel(true);setIsFill(false)
        if(isInteraction === false){
            toggleInteraction();
        }
    };
    const toggleFill = () => {
        setIsNew(false);setIsCancel(false);setIsFill(true)
        if(isInteraction === false){
            toggleInteraction();
        }
    };

    // inputs and displays
    const [amount, setAmount] = useState(0);
    const [price, setPrice] = useState(0);
    const [status, setStatus] = useState('Amount and price must be non zero');
    const [fillStatus, setFillStatus] = useState('Select and order first');
    const [cancelStatus, setCancelStatus] = useState('Select and order first');

    const newOrder = async e => {
        e.preventDefault();
        if(status === 'Ready'){
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
            setStatus('Ready');
        }
    }

    const fillOrder = async e => {
        e.preventDefault();
        if(selection.order.orderID === 0){
            alert('must first select an order');
            return;
        }
        setFillStatus('Confirm Approval');
        const { contract } = await getContract(selection.pair.currencyTo);
        const trueAmountTo = await dexBook.getOrderAmountTo(selection.order.orderID);
        const approve = await contract.approve(DEX_ADDRESS, parseUnits(trueAmountTo.toString(), selection.pair.currencyToDecimals));
        setFillStatus('Awaiting Approval');
        await approve.wait();

        setFillStatus('Confirm Transaction');
        const fillOrder = await dexBook.fillOrder(selection.order.orderID);
        setFillStatus('Awaiting Transaction');
        await fillOrder.wait();
        setFillStatus('Order filled');
    }

    const cancelOrder = async e => {
        e.preventDefault();
        if(selection.order.orderID === 0){
            alert('must first select an order');
            return;
        }
        setCancelStatus('Confirm Transaction');
        const cancelOrder = await dexBook.cancelOrder(selection.order.orderID);
        setCancelStatus('Awaiting Transaction');
        await cancelOrder.wait()
        setCancelStatus('Order canceled');
    }

    useEffect(() => {
        if(amount * price === 0) {
            setStatus('Amount and price must be non zero');
        } else { setStatus('Ready') }

        if(selection.order.orderID === 0) {
            setFillStatus('Select an order first');
            setCancelStatus('Select an order first');
        } else {
            if (selection.order.owner.toLowerCase() === selection.user.address.toLowerCase()){
                setCancelStatus('Ready');
                setFillStatus("Can't fill your own order");
            } else { 
                setFillStatus('Ready');
                setCancelStatus('This order is not yours');
            }
        }
    }, [amount, price, selection])

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
        setSelectionByOrderId(document.getElementById('fillID').value);
    }

    return (
        <InteractionSectionWrapper>
            <PannelMenu>
                <PannelMenuOption onClick={toggleFill} isOpen={isFill}>
                    FILL
                </PannelMenuOption>
                <PannelMenuOption onClick={toggleNew} isOpen={isNew}>
                    NEW
                </PannelMenuOption>
                <PannelMenuOption onClick={toggleCancel}  isOpen={isCancel}>
                    CANCEL
                </PannelMenuOption>
                <ClosePannelMobile onClick={toggleInteraction} isOpen={isInteraction}>
                    <FaArrowDown />
                </ClosePannelMobile>
            </PannelMenu>
            <PannelContent>

                {/*======================== NEW OREDER ==============================*/}
                <NewOrderSection isOpen={isNew}>
                    <NewOrderCurrencyPannelRow>
                        <CurrencyWrapper>
                            <IconWrapper src={`https://ipfs.io/ipfs/${selection.pair.currencyFromIPFSIcon}`} alt=""/>{selection.pair.currencyFromName}
                        </CurrencyWrapper>
                        <ArrowWrapper>
                            <FaArrowRight />
                        </ArrowWrapper>
                        <CurrencyWrapper>
                            <IconWrapper src={`https://ipfs.io/ipfs/${selection.pair.currencyToIPFSIcon}`} alt=""/>{selection.pair.currencyToName}
                        </CurrencyWrapper>
                    </NewOrderCurrencyPannelRow>
                    <NewOrderInputPannelRow>
                        <InputWrapper>
                            <Label>Amount:</Label>
                            <Input onChange={handleAmountChange} id={'amount'}></Input>
                        </InputWrapper>
                        <InputWrapper>
                            <Label>Price:</Label>
                            <Input onChange={handlePriceChange} id={'price'}></Input>
                        </InputWrapper>
                    </NewOrderInputPannelRow>
                    <ConfirmNewOrderPannelRow onClick={newOrder} status={status}>
                        <p> Send {amount} {selection.pair.currencyFromSymbol} and get {amount * price} {selection.pair.currencyToSymbol}.</p>
                        <p>{status}</p>
                    </ConfirmNewOrderPannelRow>
                </NewOrderSection>

                {/*======================== FILL ORDER ==============================*/}
                <FillOrderSection isOpen={isFill}>
                    <NewOrderCurrencyPannelRow>
                        <CurrencyWrapper>
                            <IconWrapper src={`https://ipfs.io/ipfs/${selection.pair.currencyFromIPFSIcon}`} alt=""/>{selection.pair.currencyFromName}
                        </CurrencyWrapper>
                        <ArrowWrapper>
                            <FaArrowLeft />
                        </ArrowWrapper>
                        <CurrencyWrapper>
                            <IconWrapper src={`https://ipfs.io/ipfs/${selection.pair.currencyToIPFSIcon}`} alt=""/>{selection.pair.currencyToName}
                        </CurrencyWrapper>
                    </NewOrderCurrencyPannelRow>
                    <FillOrderInputPannelRow>
                        <FillInfoText>
                            Select an order to fill it or search by ID.
                        </FillInfoText>
                        <FillOrderInputWrapper style={{"display":"flex"}}>
                            <FillOrderInput id={'fillID'} placeholder={"Order ID"}></FillOrderInput>
                            <FillOrderSend onClick={handleSearchOrderById}>
                                <FaSearch /> search order ID
                            </FillOrderSend>
                        </FillOrderInputWrapper>
                        <FillInfoText>
                            {selection.order.orderID === 0 ? 'No order selected' : ('Selected order ID: '+selection.order.orderID)}
                        </FillInfoText>
                    </FillOrderInputPannelRow>
                
                    <FillOrderInfoPannelRow>
                        <p>
                            Amount: {selection.order.amountTo / (10 ** selection.pair.currencyToDecimals)}
                        </p>
                        <p>
                            Price: { 1 / selection.order.price}
                        </p>
                    </FillOrderInfoPannelRow>
                    <ConfirmFillOrderPannelRow onClick={fillOrder} status={fillStatus}>
                        <p> 
                            Send {selection.order.amountTo / (10 ** selection.pair.currencyToDecimals)} {selection.pair.currencyToSymbol} and get {selection.order.amountFrom / (10 ** selection.pair.currencyFromDecimals)} {selection.pair.currencyFromSymbol}.</p>
                        <p>{(fillStatus)}</p>
                    </ConfirmFillOrderPannelRow>
                </FillOrderSection>
                
                {/*======================== CANCEL ORDER ==============================*/}
                <CancelOrderSection isOpen={isCancel}>
                    <NewOrderCurrencyPannelRow>
                        <CancelOrderArrowWrapper>
                            <FaArrowLeft />
                        </CancelOrderArrowWrapper>
                        <CurrencyWrapper>
                            <IconWrapper src={`https://ipfs.io/ipfs/${selection.pair.currencyToIPFSIcon}`} alt=""/>{selection.pair.currencyToName}
                        </CurrencyWrapper>
                    </NewOrderCurrencyPannelRow>
                    <FillOrderInputPannelRow>
                        <FillInfoText>
                            Select one of your orders to cancel it or search by ID.
                        </FillInfoText>
                        <FillOrderInputWrapper style={{"display":"flex"}}>
                            <FillOrderInput id={'fillID'} placeholder={"Order ID"}></FillOrderInput>
                            <FillOrderSend onClick={handleSearchOrderById}>
                                <FaSearch /> search order ID
                            </FillOrderSend>
                        </FillOrderInputWrapper>
                        <FillInfoText>
                            {selection.order.orderID === 0 ? 'No order selected' : ('Selected order ID: '+selection.order.orderID)}
                        </FillInfoText>
                    </FillOrderInputPannelRow>
                    <FillOrderInfoPannelRow>
                        <p>
                            Amount: {selection.order.amountFrom / (10 ** selection.pair.currencyFromDecimals)}
                        </p>
                        <p>
                            Price: {selection.order.price}
                        </p>
                    </FillOrderInfoPannelRow>
                    <ConfirmFillOrderPannelRow onClick={cancelOrder} status={cancelStatus}>
                        <p> 
                            Get back {selection.order.amountFrom / (10 ** selection.pair.currencyFromDecimals)} {selection.pair.currencyFromSymbol}</p>
                        <p>{cancelStatus}</p>
                    </ConfirmFillOrderPannelRow>
                </CancelOrderSection>
            </PannelContent>
        </InteractionSectionWrapper>
    )
}

export default InteractionSection

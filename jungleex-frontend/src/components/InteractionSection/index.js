import React, { useState } from 'react';
import {FaArrowRight, FaSearch} from 'react-icons/fa';

import getContract from '../../contracts/getContract';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';

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
                    dexBook,
                    safeScrappe,
                    selectedOrder,
                    currencyFrom,
                    currencyTo,
                    currencyNameToID,
                    currencyBook,
                    orderBook,
                    getOrderById,
                    setSelectedOrder
                }) => {
    
    const [isNew, setIsNew] = useState(true);
    const [isCancel, setIsCancel] = useState(false);
    const [isFill, setIsFill] = useState(false);
    const toggleNew = () => {setIsNew(true);setIsCancel(false);setIsFill(false)};
    const toggleCancel = () => {setIsNew(false);setIsCancel(true);setIsFill(false)};
    const toggleFill = () => {setIsNew(false);setIsCancel(false);setIsFill(true)};

    const [orderID, setOrderID] = useState(undefined);
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
        const { contract } = await getContract(currencyBook[currencyNameToID(currencyFrom)].address);
        const approve = await contract.approve('0x0a0CE136e6a653e7c30E8e681DcBfC5059EC0ea9', amount * (10 ** currencyBook[currencyNameToID(currencyFrom)].decimals));
        setStatus('Awaiting Approval');
        await approve.wait();

        setStatus('Confirm Transaction');
        const newOrder = await dexBook.newOrder(currencyNameToID(currencyFrom), currencyNameToID(currencyTo), amount * (10 ** currencyBook[currencyNameToID(currencyFrom)].decimals), price);
        setStatus('Awaiting Transaction');
        await newOrder.wait();
        setStatus('Order Is Live');
    }

    const fillOrder = async e => {
        e.preventDefault();
        if(selectedOrder === undefined){
            alert('must first select an order');
            return
        }
        setStatus('Confirm Approval');
        const { contract } = await getContract(currencyBook[parseInt(selectedOrder[2].currencyIDTo)].address);
        const approve = await contract.approve('0x0a0CE136e6a653e7c30E8e681DcBfC5059EC0ea9', selectedOrder[2].amount * selectedOrder[2].price);
        setStatus('Awaiting Approval');
        await approve.wait();

        setStatus('Confirm Transaction');
        const fillOrder = await dexBook.fillOrder(selectedOrder[1]);
        setStatus('Awaiting Transaction');
        await fillOrder.wait();
        setStatus('Order filled');
    }

    const cancelOrder = async e => {
        e.preventDefault();
        setStatus('Confirm Transaction');
        const cancelOrder = await dexBook.cancelOrder(selectedOrder[1]);
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
        setSelectedOrder(getOrderById((document.getElementById('fillID').value)));
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
                            {currencyFrom}
                        </CurrencyWrapper>
                        <ArrowWrapper>
                            <FaArrowRight />
                        </ArrowWrapper>
                        <CurrencyWrapper>
                            {currencyTo}
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
                        <p>{amount} {currencyFrom} <FaArrowRight /> {amount * price} {currencyTo}.</p>
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
                            {selectedOrder === undefined ? '' : 
                                selectedOrder[1] === undefined ? '' : 
                                    'currently selected order: ' + selectedOrder[1]
                            }
                        </FillInfoText>
                    </PannelRow>
                    <PannelRow height={'20%'} display={'flex'} align={'center'}>
                        <CurrencyWrapper>
                            {selectedOrder === undefined ? '' : 
                                selectedOrder[2] === undefined ? '' :
                                    currencyBook[parseInt(selectedOrder[2].currencyIDTo)].name
                            }
                        </CurrencyWrapper>
                        <ArrowWrapper>
                            <FaArrowRight />
                        </ArrowWrapper>
                        <CurrencyWrapper>
                            {selectedOrder === undefined ? '' : 
                                selectedOrder[2] === undefined ? '' :
                                    currencyBook[parseInt(selectedOrder[2].currencyIDFrom)].name
                            }
                        </CurrencyWrapper>
                    </PannelRow>
                    <PannelRow height={'20%'} display={'block'} align={''}>
                        <p>
                            Amount: {selectedOrder === undefined || currencyBook === undefined ? '' : 
                                        selectedOrder[2] === undefined ? '' : 
                                            selectedOrder[2].amount / 10 ** currencyBook[parseInt(selectedOrder[2].currencyIDTo)].decimals
                                    }
                        </p>
                        <p>
                            Price: {selectedOrder === undefined ? '' : 
                                        selectedOrder[2] === undefined ? '' : 
                                            selectedOrder[2].price
                                    }
                        </p>
                    </PannelRow>
                    <PannelRow height={'20%'} display={'block'} align={'center'}>
                        <p>
                            {selectedOrder === undefined || currencyBook === undefined ? '' : 
                                selectedOrder[2] === undefined ? '' : 
                                    selectedOrder[2].amount / 10 ** currencyBook[parseInt(selectedOrder[2].currencyIDTo)].decimals
                            } {selectedOrder === undefined ? '' : 
                                selectedOrder[2] === undefined ? '' :
                                    currencyBook[parseInt(selectedOrder[2].currencyIDTo)].name
                            }
                            <FaArrowRight />
                            {selectedOrder === undefined || currencyBook === undefined ? '' : 
                                selectedOrder[2] === undefined ? '' : 
                                    selectedOrder[2].amount * (selectedOrder === undefined ? '' : 
                                        selectedOrder[2] === undefined ? '' : 
                                            selectedOrder[2].price) / 10 ** currencyBook[parseInt(selectedOrder[2].currencyIDTo)].decimals
                            } {selectedOrder === undefined ? '' : 
                                selectedOrder[2] === undefined ? '' :
                                    currencyBook[parseInt(selectedOrder[2].currencyIDFrom)].name
                            }.
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
                            {selectedOrder === undefined ? '' : 
                                selectedOrder[1] === undefined ? '' : 
                                    'currently selected order: ' + selectedOrder[1]
                            }
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

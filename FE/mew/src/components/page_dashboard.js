import axios from 'axios';

import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom';

import DisplayKey from './util_displayKey';
import BlockchainTable from './util_tableBlockchain';
import TransactionTable from './util_tableTransaction';
import SendPopup from './util_popupSend';

export default function Dashboard() {
    const navigate = useNavigate();
    const goToLogin = useCallback(() => {
        navigate('/')
    }, [navigate]);
    const privateKey = localStorage.getItem('privatekey');
    const publicKey = localStorage.getItem('publickey');
    const [balance, setBalance] = useState(0);
    const [blockchain, setBlockchain] = useState([]);
    const [history, setHistory] = useState({});
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const fetchData = useCallback(async (privateKey) => {
        try {
            const balanceResponse = await axios.post('http://localhost:5000/user/balance', { privateKey });
            setBalance(balanceResponse.data.data);

            const blockchainResponse = await axios.get('http://localhost:5000/user/blockchain');
            setBlockchain(blockchainResponse.data.data);

            const historyResponse = await axios.post('http://localhost:5000/user/history', { privateKey });
            setHistory(historyResponse.data.data);
        } catch (error) {
            alert("Error fetching data!");
        }
    }, [setBalance, setBlockchain, setHistory]);

    useEffect(() => {
        const privateKey = localStorage.getItem('privatekey');
        const publicKey = localStorage.getItem('publickey');
        if (!privateKey || !publicKey) {
            goToLogin();
        }
        if (privateKey) {
            fetchData(privateKey);
        }
    }
        , [privateKey, fetchData, goToLogin]);

    const handleOpenPopup = () => {
        setIsPopupOpen(true);
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
    };

    const handleSend = useCallback(async (address, amount) => {
        try {
            const response = await axios.post('http://localhost:5000/user/send', { privateKey, receiverAddress: address, amount: parseInt(amount) });
            if (response.status === 200) {
                alert("Transaction sent!");
                if (privateKey) {
                    fetchData(privateKey);
                }
            }
        } catch (error) {
            alert("Error sending transaction!");
        }
    }, [fetchData, privateKey])

    return (
        <main className="max-w-[1392px] px-10 mx-auto my-5">
            <div className='items-center text-center'>
                <div className='flex justify-center text-center mt-10'>
                    <div className='items-center justify-center ct-dashboard-column'>
                        <div className='py-3 text-xl font-bold'>Your Public Key:</div>
                        <DisplayKey publicKey={publicKey} />
                    </div>
                    <div className='items-center justify-center ct-dashboard-column'>
                        <div className='py-3 text-xl font-bold'>Your Balance:</div>
                        <div className='text-2xl font-bold'>{balance} ETH</div>
                        <div onClick={handleOpenPopup} className="cursor-pointer w-1/4 m-5 p-2 bg-red-500 text-white rounded hover:bg-red-700 transition duration-500 ease-in-out">
                            Send
                        </div>
                    </div>
                </div>
                <div className='flex justify-between text-center'>
                    <div className='content-center ct-dashboard-column'>
                        <div className='py-3 text-xl font-bold'>Your send transactions:</div>
                        <TransactionTable transfers={history.transfer} address={publicKey} />
                    </div>
                    <div className='content-center  ct-dashboard-column'>
                        <div className='py-3 text-xl font-bold'>Your receive transactions:</div>
                        <TransactionTable transfers={history.receive} address={publicKey} />
                    </div>
                </div>
                <div className='flex items-center justify-between text-center'>
                    <div className='flex-col flex items-center justify-center w-full h-max p-5 m-5 bg-white rounded-lg shadow-md'>
                        <div className='py-3 text-xl font-bold'>Blockchain:</div>
                        <BlockchainTable data={blockchain} />
                    </div>
                </div>
            </div>

            <SendPopup isOpen={isPopupOpen} onClose={handleClosePopup} onSubmit={handleSend} />
        </main>
    )
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import getUserInfo from '../../utilities/decodeJwt';
import axios from 'axios';
import Modal from 'react-modal';
import '../pages/PortfolioPage.css';

const PortfolioPage = () => {
    const [user, setUser] = useState({});
    const [holdings, setHoldings] = useState([]);
    const [totalValues, setTotalValues] = useState({});
    const [selectedStock, setSelectedStock] = useState('');
    const [sellAmount, setSellAmount] = useState(0);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const userInfo = getUserInfo();
            setUser(userInfo);
            try {
                const response = await axios.get(`http://localhost:8081/holdings/${userInfo.username}`);
                setHoldings(response.data);            
                await fetchTotalValues(response.data);
            } catch (error) {
                console.error('Error fetching user holdings:', error);
            }
        };
        fetchData();
    }, []);

    const getCurrentStockPrice = async (stock_name) => {
        try {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() - 1);
            const formattedDate = currentDate.toISOString().slice(0, 10);
            const response = await axios.get(`https://api.polygon.io/v1/open-close/${stock_name}/${formattedDate}?adjusted=true&apiKey=PIpKAl2a9S1w6fgammFWHLBX0DKkynpQ`);
            return response.data.close;
        } catch (error) {
            console.error('Error fetching current stock price:', error);
            throw new Error('Failed to fetch current stock price');
        }
    };

    const fetchTotalValues = async (holdings) => {
        const values = {};
        for (const holding of holdings) {
            try {
                const currentPrice = await getCurrentStockPrice(holding.stock_name);
                values[holding.stock_name] = currentPrice * holding.quantity;
            } catch (error) {
                console.error(`Error fetching current price for ${holding.stock_name}:`, error);
                values[holding.stock_name] = 'N/A';
            }
        }
        setTotalValues(values);
    };

    const handleClick = (e) => {
        e.preventDefault();
        localStorage.removeItem('accessToken');
        navigate('/');
    };

    const handleSell = (stock_name) => {
        setSelectedStock(stock_name);
        setModalIsOpen(true);
    };

    const handleModalClose = () => {
        setModalIsOpen(false);
        setSelectedStock('');
        setSellAmount(0);
    };

    const handleSellConfirm = async () => {
        console.log(`Selling ${sellAmount} of ${selectedStock}`);
        handleModalClose();
    };

    if (!user) {
        return <div><h4>Log in to view this page.</h4></div>;
    }

    return (
        <div className="container">
            <h1 className="text-center">{user.username}'s Portfolio</h1>
            {holdings.length > 0 ? (
                holdings.map((holding, index) => (
                    <div key={index} className="card mb-3">
                        <div className="card-body">
                            <h5 className="card-title">{holding.stock_name}</h5>
                            <p className="card-text">Shares Owned: {holding.quantity}</p>
                            <p className="card-text">Current Value: {totalValues[holding.stock_name] !== undefined ? totalValues[holding.stock_name] : 'Loading...'}</p>
                            <button onClick={() => handleSell(holding.stock_name)} className="sell-button">Sell</button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center">
                    <p>You currently have no holdings of stock. Please purchase stocks using your cash balance.</p>
                </div>
            )}

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={handleModalClose}
                className="sell-modal"
                overlayClassName="modal-overlay"
            >
                <h2>Sell {selectedStock}</h2>
                <input
                    type="number"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(parseFloat(e.target.value))}
                    placeholder="Enter amount to sell"
                />
                <button onClick={handleSellConfirm}>Sell</button>
                <button onClick={handleModalClose}>Cancel</button>
            </Modal>
        </div>
    );
};

export default PortfolioPage;
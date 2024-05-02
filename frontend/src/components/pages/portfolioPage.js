import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import getUserInfo from '../../utilities/decodeJwt';
import axios from 'axios';
import Modal from 'react-modal';
import './PortfolioPage.css'; // Import CSS file for styling

const PortfolioPage = () => {
    const [user, setUser] = useState({});
    const [holdings, setHoldings] = useState([]);
    const [totalValues, setTotalValues] = useState({});
    const [cashBalance, setCashBalance] = useState(0);
    const [selectedStock, setSelectedStock] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [sellAmount, setSellAmount] = useState(0);
    const [sellSuccess, setSellSuccess] = useState(false);
    const [sellError, setSellError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const userInfo = getUserInfo();
            setUser(userInfo);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URI}/holdings/${userInfo.username}`);
                setHoldings(response.data);
                await fetchTotalValues(response.data);
                const userResponse = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URI}/user/getUserByUsername/${userInfo.username}`);
                setCashBalance(userResponse.data.cashBalance);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchData();
    }, []);

    const getCurrentStockPrice = async (stock_name) => {
        try {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() - 2);
            const formattedDate = currentDate.toISOString().slice(0, 10);
            const response = await axios.get(`https://api.polygon.io/v1/open-close/${stock_name}/${formattedDate}?adjusted=true&apiKey=PIpKAl2a9S1w6fgammFWHLBX0DKkynpQ`);
            return {
                open: response.data.open,
                close: response.data.close
            };
        } catch (error) {
            console.error('Error fetching current stock price:', error);
            throw new Error('Failed to fetch current stock price');
        }
    };

    const fetchTotalValues = async (holdings) => {
        const values = {};
        for (const holding of holdings) {
            try {
                const { open, close } = await getCurrentStockPrice(holding.stock_name);
                const percentChange = ((close - open) / open) * 100;
                values[holding.stock_name] = {
                    currentValue: close * holding.quantity,
                    percentChange: percentChange
                };
            } catch (error) {
                console.error(`Error fetching current price for ${holding.stock_name}:`, error);
                values[holding.stock_name] = {
                    currentValue: 'N/A',
                    percentChange: 'N/A'
                };
            }
        }
        setTotalValues(values);
    };


    const handleSell = (stock_name) => {
        console.log(`Sell button clicked for ${stock_name}`);
        setSelectedStock(stock_name);
        setModalIsOpen(true);
    };

    const handleSellSubmit = async () => {
        // Find the total value of the selected stock
        const selectedStockValue = totalValues[selectedStock]?.currentValue;

        if (sellAmount <= 0 || sellAmount > selectedStockValue) {
            setSellError('This is either a negative value or you are attempting to sell more stock than you own.');
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_SERVER_URI}/transaction/createTransaction`, {
                stock_name: selectedStock,
                tran_type: 'SELL',
                tran_amount: sellAmount,
                username: user.username,
            });

            const userInfo = getUserInfo();
            const userResponse = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URI}/user/getUserByUsername/${userInfo.username}`);
            setCashBalance(userResponse.data.cashBalance);

            const response2 = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URI}/holdings/${userInfo.username}`);
            setHoldings(response2.data);
            await fetchTotalValues(response2.data);

            console.log('Transaction created successfully:', response.data);
            setSellSuccess(true);
            closeModal(); // Close the modal after successful sell
        } catch (error) {
            console.error('Error creating transaction:', error);
            setSellError('Failed to complete sell transaction.');
        }
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSellAmount(0);
        setSellSuccess(false);
        setSellError('');
    };

    const getPercentChangeColor = (percentChange) => {
        return percentChange < 0 ? 'red' : 'green';
    };

    if (!user) {
        return <div><h4>Log in to view this page.</h4></div>;
    }

    return (
        
            <div className="container">
                <div className="cash-balance-card top-right">
                    <h1 className="text-center cool-font">Cash Balance</h1>
                    <p className="text-center cool-font" style={{ fontSize: '2.4rem' }}>${cashBalance.toLocaleString(undefined, {maximumFractionDigits:2})}</p>
                </div>
                <div className="portfolio-section" style={{ paddingTop: '110px' }}>
                <h1 className="text-center cool-font">{user.username}'s Portfolio</h1>
                {holdings.length > 0 ? (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Stock Ticker</th>
                                <th>Shares Owned</th>
                                <th>Current Value</th>
                                <th>General Stock Daily Percent Change</th>
                                <th>Sell?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {holdings.map((holding, index) => (
                                <tr key={index}>
                                    <td>{holding.stock_name}</td>
                                    <td>{holding.quantity.toFixed(2)}</td>
                                    <td>
                                        {typeof totalValues[holding.stock_name]?.currentValue === 'number' ? 
                                        '$' + totalValues[holding.stock_name].currentValue.toFixed(2) : 'Loading...'}
                                    </td>
                                    <td>
                                        <span style={{ color: getPercentChangeColor(totalValues[holding.stock_name]?.percentChange), fontWeight: 'bold' }}>
                                            {typeof totalValues[holding.stock_name]?.percentChange === 'number' ? 
                                                totalValues[holding.stock_name].percentChange.toFixed(2) + '%' : 
                                                'Loading...'}
                                        </span>
                                    </td>
                                    <td>
                                        <button onClick={() => handleSell(holding.stock_name)}>Sell</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center">
                        <p>You currently have no holdings of stock. Please purchase stocks using your cash balance.</p>
                    </div>
                )}
                </div>

                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    contentLabel="Sell Modal"
                    className="sell-modal"
                    overlayClassName="modal-overlay"
                >
                    <h2>How much of {selectedStock} would you like to sell?</h2>
                    <div>
                        <p>Total Currently Owned: {
                        typeof totalValues[selectedStock]?.currentValue === 'number' ? 
                            '$' + totalValues[selectedStock].currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 }) : 
                            'Loading...'}
                        </p>
                        <label htmlFor="sellAmount">Enter dollar amount :</label>
                        <input type="number" id="sellAmount" value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} />
                    </div>
                    {sellSuccess && <p style={{ color: 'green' }}>Sell transaction completed successfully.</p>}
                    {sellError && <p style={{ color: 'red' }}>{sellError}</p>}
                    <button onClick={handleSellSubmit}>Sell</button>
                    <button onClick={closeModal}>Close</button>
                </Modal>
            </div>
    );
};

export default PortfolioPage;

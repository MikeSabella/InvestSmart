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
    const [cashBalance, setCashBalance] = useState(0); // State for cash balance
    const [selectedStock, setSelectedStock] = useState(null); // State to store the selected stock
    const [modalIsOpen, setModalIsOpen] = useState(false); // State to manage modal open/close
    const [sellAmount, setSellAmount] = useState(0);
    const [selectedStockValue, setSelectedStockValue] = useState(0);
    
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const userInfo = getUserInfo();
            setUser(userInfo);
            try {
                const response = await axios.get(`http://localhost:8081/holdings/${userInfo.username}`);
                setHoldings(response.data);
                await fetchTotalValues(response.data);
                // Fetch user's cash balance
                const userResponse = await axios.get(`http://localhost:8081/user/getUserByUsername/${userInfo.username}`);
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
            currentDate.setDate(currentDate.getDate() - 2); // Get the date of the previous day
            const formattedDate = currentDate.toISOString().slice(0, 10); // Format date as YYYY-MM-DD
            const response = await axios.get(`https://api.polygon.io/v1/open-close/${stock_name}/${formattedDate}?adjusted=true&apiKey=PIpKAl2a9S1w6fgammFWHLBX0DKkynpQ`);
            // Extract and return the open and close prices from the response
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
                    percentChange: percentChange.toFixed(2)
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

    const handleClick = (e) => {
        e.preventDefault();
        localStorage.removeItem('accessToken');
        navigate('/');
    };

    const handleSell = (stock_name) => {
        console.log(`Sell button clicked for ${stock_name}`);
        setSelectedStock(stock_name);
        setModalIsOpen(true);
    };

    const handleSellSubmit = async () => {
      // Validate the sell amount
      //TODO
      //if (sellAmount <= 0 || sellAmount > selectedStockValue) {
      if (sellAmount <= 0 ) {
        return 0;
      }
  
      // Call the createTransaction API endpoint with the sell transaction details
      try {
          const response = await axios.post('http://localhost:8081/transaction/createTransaction', {
              stock_name: selectedStock,
              tran_type: 'SELL',
              tran_amount: sellAmount,
              username: user.username,
          });


            const userInfo = getUserInfo();
            const userResponse = await axios.get(`http://localhost:8081/user/getUserByUsername/${userInfo.username}`);
            setCashBalance(userResponse.data.cashBalance);

            const response2 = await axios.get(`http://localhost:8081/holdings/${userInfo.username}`);
            setHoldings(response2.data);
            await fetchTotalValues(response2.data);

          console.log('Transaction created successfully:', response.data);
          
      } catch (error) {
          console.error('Error creating transaction:', error);
          
      }
  
      closeModal();
  };

    const closeModal = () => {
        setModalIsOpen(false);
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
                <h5>Cash Balance</h5>
                <p>${cashBalance}</p>
            </div>
            <div className="portfolio-section" style={{ paddingTop: '70px' }}>
                <h1 className="text-center">{user.username}'s Portfolio</h1>
                {holdings.length > 0 ? (
                    holdings.map((holding, index) => (
                        <div key={index} className="cool-card">
                            <div className="card-body">
                                <h5 className="card-title">{holding.stock_name}</h5>
                                <p className="card-text">Shares Owned: {holding.quantity}</p>
                                <p className="card-text">
                                    Current Value: <span style={{ fontWeight: 'bold' }}>
                                        {totalValues[holding.stock_name] !== undefined ? totalValues[holding.stock_name].currentValue : 'Loading...'}
                                    </span>
                                </p>
                                <p className="card-text">
                                    Daily Percent Change: <span style={{ color: getPercentChangeColor(totalValues[holding.stock_name]?.percentChange), fontWeight: 'bold' }}>
                                        {totalValues[holding.stock_name] !== undefined ? totalValues[holding.stock_name].percentChange + '%' : 'Loading...'}
                                    </span>
                                </p>
                                <button onClick={() => handleSell(holding.stock_name)} className="sell-button">Sell</button>
                            </div>
                        </div>
                    ))
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
                <h2>Sell {selectedStock}</h2>
                <div>
                    <label htmlFor="sellAmount">Enter total dollar amount you would like to sell:</label>
                    <input type="number" id="sellAmount" value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} />
                </div>
                <button onClick={handleSellSubmit}>Sell</button>
                <button onClick={closeModal}>Close Modal</button>
            </Modal>
        </div>
    );
};

export default PortfolioPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import getUserInfo from '../../utilities/decodeJwt';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import '../pages/PortfolioPage.css';

const BuyPage = () => {
    const [user, setUser] = useState({});
    const [show, setShow] = useState(false);
    const [stockName, setStockName] = useState('');
    const [buyAmount, setBuyAmount] = useState(0);
    const [cashBalance, setCashBalance] = useState(0);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [buySuccess, setBuySuccess] = useState(false);
    const [buyError, setBuyError] = useState('');
    const [transactions, setTransactions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const userInfo = getUserInfo();
            setUser(userInfo);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URI}/user/getUserByUsername/${userInfo.username}`);
                setCashBalance(response.data.cashBalance);
                const transactionsResponse = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URI}/transaction/getAll`);
                const sortedTransactions = transactionsResponse.data.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
                setTransactions(sortedTransactions);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchData();
    }, []);
    

    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);

    const handleBuySubmit = async () => {
        // Validate the buy amount
        if (buyAmount <= 0 || buyAmount > cashBalance) {
            setBuyError('Either the requested amount is negative or greater than cash balance');
            return;
        }

        try {
            // Call the createTransaction API endpoint with the buy transaction details
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_SERVER_URI}/transaction/createTransaction`, {
                stock_name: stockName,
                tran_type: 'BUY',
                tran_amount: buyAmount,
                username: user.username,
            });

            // Update user's cash balance
            const updatedBalance = cashBalance - buyAmount;
            setCashBalance(updatedBalance);

            // Optionally, you can fetch updated user data after the transaction
            const userResponse = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URI}/user/getUserByUsername/${user.username}`);
            setUser(userResponse.data);

            // Set buy success message
            setBuySuccess(true);

            // Close the modal after successful purchase
            setModalIsOpen(false);

            const fetchData = async () => {
                const userInfo = getUserInfo();
                setUser(userInfo);
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URI}/user/getUserByUsername/${userInfo.username}`);
                    setCashBalance(response.data.cashBalance);
                    const transactionsResponse = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URI}/transaction/getAll`);
                    const sortedTransactions = transactionsResponse.data.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
                    setTransactions(sortedTransactions);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };
            fetchData();
            
        } catch (error) {
            console.error('Error creating transaction:', error);
            setBuyError('Please enter a valid ticker or amount of stock to purchase');
        }
    };

    // handle logout button
    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    useEffect(() => {
        setUser(getUserInfo());
    }, []);

    if (!user) return <div><h4>Log in to view this page.</h4></div>;

    return (
        <div className="container">
            <div className="cash-balance-card top-right">
                <h1 className="text-center cool-font">Cash Balance</h1>
                <p className="text-center cool-font" style={{ fontSize: '2.4rem' }}>${cashBalance.toLocaleString(undefined, {maximumFractionDigits:2})}</p>
            </div>
            <div className="text-center cool-font">
                <h1>{user.username}</h1>
            </div>
            <div className="text-center cool-font">
                <>
                    <Button className="text-center cool-font " onClick={handleShow}>
                        Log Out
                    </Button>
                    <Modal
                        show={show}
                        onHide={handleClose}
                        backdrop="static"
                        keyboard={false}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Log Out</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Are you sure you want to Log Out?</Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                            <Button variant="primary" onClick={handleLogout}>
                                Yes
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            </div>
            <div className="col-md-12 text-center mt-5 cool-font">
                <Button variant="primary" style={{ fontSize: '2rem' }} onClick={() => setModalIsOpen(true)}>Buy Stock</Button>
            </div>
            <Modal
                show={modalIsOpen}
                onHide={() => setModalIsOpen(false)}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Would you like to purchase a stock?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="stockName">
                            <Form.Label>Please enter the ticker of the stock you would like to purchase:</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter stock name"
                                value={stockName}
                                onChange={(e) => setStockName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="buyAmount">
                            <Form.Label>Enter $ amount you look to purchase:</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Enter buy amount"
                                value={buyAmount}
                                onChange={(e) => setBuyAmount(parseFloat(e.target.value))}
                            />
                        </Form.Group>
                    </Form>
                    {buySuccess && <p style={{ color: 'green' }}>Buy transaction completed successfully.</p>}
                    {buyError && <p style={{ color: 'red' }}>{buyError}</p>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setModalIsOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleBuySubmit}>Buy</Button>
                </Modal.Footer>
            </Modal>
            <div>
                <h2 className="col-md-12 cool-font">Previous Transactions:</h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Stock Name</th>
                            <th>Transaction Type</th>
                            <th>Amount</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                    {transactions.map((transaction, index) => (
                    <tr key={index} className={transaction.tran_type === 'BUY' ? 'buy-row' : 'sell-row'}>
                    <td>{transaction.stock_name}</td>
                    <td>{transaction.tran_type}</td>
                    <td>${transaction.tran_amount}</td>
                    <td>{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                
                    </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BuyPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import getUserInfo from '../../utilities/decodeJwt';
import axios from 'axios';

const PortfolioPage = () => {
    const [user, setUser] = useState({});
    const [holdings, setHoldings] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const userInfo = getUserInfo();
            setUser(userInfo);
            try {
                const response = await axios.get(`http://localhost:8081/holdings/${userInfo.username}`);
                setHoldings(response.data);            
            } catch (error) {
                console.error('Error fetching user holdings:', error);
            }
        };
        fetchData();
    }, []);

    const handleClick = (e) => {
        e.preventDefault();
        localStorage.removeItem('accessToken');
        navigate('/');
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
                            <p className="card-text">Current Value: {holding.quantity * holding.currentPrice}</p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center">
                    <p>You currently have no holdings of stock. Please purchase stocks using your cash balance.</p>
                </div>
            )}
        </div>
    );
};

export default PortfolioPage;
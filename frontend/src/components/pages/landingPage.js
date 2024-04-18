import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import backgroundImage from '../pages/ISlogo.png'; // Import your PNG image
import getUserInfo from '../../utilities/decodeJwt';

const LandingPage = () => {
    const navigate = useNavigate();
    useEffect(() => {
        // Change background color randomly
        const getRandomColor = () => {
            const colors = ['#ff5733', '#33ff57', '#5733ff', '#ff33f9', '#33fff5']; // Add your desired colors
            const randomIndex = Math.floor(Math.random() * colors.length);
            return colors[randomIndex];
        };
        document.body.style.backgroundColor = getRandomColor();
    }, []);

    const handleRedirect = () => {
        const userInfo = getUserInfo();
        if(userInfo) {
            navigate('/portfolio');
        } else {
            navigate('/login');
        }
    };

    const handleEditProfile = () => {
        navigate('/edituser');
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
            <Card style={{ width: '45rem' }} className="mx-2 my-2 text-center">
                <Card.Body>
                    <div style={{ width: '200px', margin: '0 auto' }}> {/* Adjust the width as per your logo */}
                        <Card.Title className="mb-4">InvestSmart</Card.Title>
                    </div>
                    <Card.Subtitle className="text-center cool-font"style={{ fontSize: '1.9 rem' }}>Web application capstone project built by: Michael Sabella</Card.Subtitle>
                    <Card.Text>
                    </Card.Text>
                    <Card.Link href="#" onClick={handleRedirect}>Start Investing!</Card.Link>
                    {getUserInfo() && (
                        <Card.Link href="#" onClick={handleEditProfile}>Edit Profile</Card.Link>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default LandingPage;
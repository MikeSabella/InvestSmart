import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LeaderBoardPage = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URI}/user/getAll`);
                // Sort users by cash balance in descending order
                const sortedUsers = response.data.sort((a, b) => b.cashBalance - a.cashBalance);
                setUsers(sortedUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    return (
        <div className="container">
            <h1 className="text-center cool-font">Leaderboard</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>User</th>
                        <th>Cash Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{user.username}</td>
                            <td>${user.cashBalance.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LeaderBoardPage;

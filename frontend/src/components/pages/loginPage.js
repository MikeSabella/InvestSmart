import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import getUserInfo from "../../utilities/decodeJwt";

const PRIMARY_COLOR = "#007bff"; // Blue color for text and button
const SECONDARY_COLOR = '#0c0c1f';
const url = "http://localhost:8081/user/login";

const Login = () => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [light, setLight] = useState(false);
  const [bgColor, setBgColor] = useState(SECONDARY_COLOR);
  const [bgText, setBgText] = useState('Light Mode');
  const navigate = useNavigate();

  let labelStyling = {
    color: PRIMARY_COLOR,
    fontWeight: "bold",
    textDecoration: "none",
  };
  let backgroundStyling = { background: bgColor };
  let buttonStyling = {
    background: PRIMARY_COLOR,
    borderStyle: "none",
    color: "#fff", // White color for button text
  };

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  useEffect(() => {
    const obj = getUserInfo(user);
    setUser(obj);

    if (light) {
      setBgColor("white");
      setBgText('Dark mode');
    } else {
      setBgColor(SECONDARY_COLOR);
      setBgText('Light mode');
    }
  }, [light]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: res } = await axios.post(url, data);
      const { accessToken } = res;
      //store token in localStorage
      localStorage.setItem("accessToken", accessToken);
      navigate("/");
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }
    }
  };

  if (user) {
    navigate("/");
    return null;
  }

  return (
    <>
      <section className="vh-100">
        <div className="container-fluid h-custom vh-100">
          <div
            className="row d-flex justify-content-center align-items-center h-100 "
            style={backgroundStyling}
          >
            <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
              <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label style={labelStyling}>Username</Form.Label>
                  <Form.Control
                    type="username"
                    name="username"
                    onChange={handleChange}
                    placeholder="Enter username"
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label style={labelStyling}>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicCheckbox">
                  <Form.Text className="text-muted pt-1">
                    Don't have an account?
                    <span>
                      <Link to="/signup" style={labelStyling}> Sign up
                      </Link>
                    </span>
                  </Form.Text>
                </Form.Group>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="flexSwitchCheckDefault"
                    onChange={() => { setLight(!light) }}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexSwitchCheckDefault"
                    style={labelStyling}
                  >
                    {bgText}
                  </label>
                </div>
                {error && <div style={labelStyling} className='pt-3'>{error}</div>}
                <Button
                  variant="primary"
                  type="submit"
                  onClick={handleSubmit}
                  style={buttonStyling}
                  className='mt-2'
                >
                  Log In
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;

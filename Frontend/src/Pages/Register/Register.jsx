import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaRobot
} from "react-icons/fa";
import toast from "react-hot-toast";

import "./Register.css";
import useAuth from "../../hooks/useAuth";

const Register = () => {

  const navigate = useNavigate();

  const { register } = useAuth();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({

  username: "",

  email: "",

  password: ""

});

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value

    });

  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("REGISTER BUTTON CLICKED");
  console.log("FORM DATA:", formData);

  try {
    setLoading(true);

    await register(formData);

    console.log("REGISTER SUCCESS");

    toast.success("Account Created Successfully 🎉");

    navigate("/dashboard");

  } catch (err) {

    console.log("FULL ERROR:", err);
    console.log("ERROR RESPONSE:", err.response);
    console.log("ERROR DATA:", err.response?.data);

    toast.error(
      err?.response?.data?.message || "Registration Failed"
    );

  } finally {

    setLoading(false);

  }
};

  return (

    <div className="register-page">

      <div className="register-card">

        <div className="register-icon">

          <FaRobot />

        </div>

        <h1>Create Account 🚀</h1>

        <p>

          Start practicing AI Interviews today.

        </p>

        <form onSubmit={handleSubmit}>

          <div className="input-box">

            <FaUser />

            <input

  type="text"

  name="username"

  placeholder="Username"

  value={formData.username}

  onChange={handleChange}

  required

/>

          </div>

          <div className="input-box">

            <FaEnvelope />

            <input

              type="email"

              name="email"

              placeholder="Email Address"

              value={formData.email}

              onChange={handleChange}

              required

            />

          </div>

          <div className="input-box">

            <FaLock />

            <input

              type="password"

              name="password"

              placeholder="Password"

              value={formData.password}

              onChange={handleChange}

              required

            />

          </div>

          <button type="submit">

            {

              loading

              ?

              "Creating Account..."

              :

              "Register 🎉"

            }

          </button>

        </form>

        <p className="bottom-text">

          Already have an account?

          <Link to="/login">

            Login

          </Link>

        </p>

      </div>

    </div>

  );

};

export default Register;
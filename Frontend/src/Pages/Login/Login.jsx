import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaRobot } from "react-icons/fa";
import toast from "react-hot-toast";
import "./Login.css";

import useAuth from "../../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("LOGIN BUTTON CLICKED");

    try {
      setLoading(true);

      console.log("Sending data:", formData);

      await login(formData);

      console.log("LOGIN SUCCESS");

      toast.success("Login Successful 🎉");

      navigate("/dashboard");

    } catch (err) {

      console.log("LOGIN ERROR:", err);

      toast.error(
        err?.response?.data?.message || "Login Failed"
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-icon">
          <FaRobot />
        </div>


        <h1>
          Welcome Back 👋
        </h1>


        <p>
          Login to continue your AI Interview Journey
        </p>


        <form onSubmit={handleSubmit}>


          <div className="input-box">

            <FaEnvelope />

            <input
              type="email"
              placeholder="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

          </div>



          <div className="input-box">

            <FaLock />

            <input
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

          </div>



          <button type="submit" disabled={loading}>

            {loading ? "Logging in..." : "Login 🚀"}

          </button>


        </form>



        <p className="bottom-text">

          Don't have an account?

          <Link to="/register">
            Register
          </Link>


        </p>


      </div>


    </div>
  );
};


export default Login;
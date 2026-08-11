import "./Navbar.css";
import { Link, NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="container nav-container">
        <Link to="/" className="logo">
          AI Interview
        </Link>

        <nav className="nav-links">
          <NavLink to="/">Home</NavLink>

          {user && <NavLink to="/dashboard">Dashboard</NavLink>}

          {user && <NavLink to="/interview">Interview</NavLink>}
        </nav>

        <div className="nav-right">
          {user ? (
            <>
              <span className="username">
                {user.name}
              </span>

              <button onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button>Login</button>
              </Link>

              <Link to="/register">
                <button className="register-btn">
                  Register
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Friends } from './friends/friends';
import { Map } from './map/map';
import { Post } from './post/post';

export default function App() {
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  useEffect(() => {
    const handleStorageChange = () => {
      setUserName(localStorage.getItem('userName') || '');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const preventIfLoggedOut = (e) => {
    if (!userName) e.preventDefault();
  };

  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100 bg-light text-dark">
        <header>
          <nav className="navbar navbar-expand-lg navbar-dark w-100">
            <div className="container-fluid">
              <a className="navbar-brand fw-bold text-white" href="#">Taco Baco</a>
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
              >
                <span className="navbar-toggler-icon"></span>
              </button>

              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  <li className="nav-item">
                    {userName ? (
                      <button
                      className="btn btn-outline-light ms-2"
                      onClick={() => {
                        fetch('/api/auth/logout', { method: 'DELETE' }).catch(() => {});
                        localStorage.removeItem('userName');
                        setUserName(''); // ✅ immediately update React state
                      }}
                    >
                      Logout
                    </button>
                    
                    ) : (
                      <NavLink className="nav-link" to="/">Login</NavLink>
                    )}
                  </li>

                  <li className="nav-item">
                    <NavLink
                      className={`nav-link ${!userName ? 'disabled' : ''}`}
                      to={userName ? '/friends' : '#'}
                      onClick={preventIfLoggedOut}
                    >
                      Friends
                    </NavLink>
                  </li>

                  <li className="nav-item">
                    <NavLink
                      className={`nav-link ${!userName ? 'disabled' : ''}`}
                      to={userName ? '/post' : '#'}
                      onClick={preventIfLoggedOut}
                    >
                      Post
                    </NavLink>
                  </li>

                  <li className="nav-item">
                    <NavLink
                      className={`nav-link ${!userName ? 'disabled' : ''}`}
                      to={userName ? '/map' : '#'}
                      onClick={preventIfLoggedOut}
                    >
                      Map
                    </NavLink>
                  </li>
                </ul>

                <span className="text-white">
                  {userName ? `Hello ${userName}` : 'Hello'}
                </span>
              </div>
            </div>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<Login setUserName={setUserName} />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/post" element={<Post />} />
          <Route path="/map" element={<Map />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <footer className="text-white-50 text-center py-3 mt-auto">
          <div className="container-fluid">
            <span>Ricky Stephens</span><br />
            <a className="text-white" href="https://github.com/cedlark/CS-260-new.git">
              GitHub
            </a>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

function NotFound() {
  return <main className="container-fluid text-center">404: Return to sender. Address unknown.</main>;
}

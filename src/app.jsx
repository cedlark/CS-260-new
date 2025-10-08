import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

export default function App() {
    return (
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
                    <a className="nav-link text-white" href="index.html">Activity</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link text-white" href="friends.html">Friends</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link text-white" href="post.html">Make A Post</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link text-white" href="map.html">Map</a>
                  </li>
                </ul>
                <span className="text-white">Hello Username</span>
              </div>
            </div>
          </nav>
        </header>
  
        <main className="container my-5 text-center">
          App Components go here
        </main>
  
        <footer className="bg-dark text-white-50 text-center py-3 mt-auto">
          <div className="container-fluid">
            <span>Ricky Stephens</span><br />
            <a className="text-white" href="https://github.com/cedlark/CS-260-new.git">
              GitHub
            </a>
          </div>
        </footer>
      </div>
    );
  }
  
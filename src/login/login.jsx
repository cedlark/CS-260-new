import React from 'react';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault(); 
    navigate('/friends'); 
  }

  return (
    <main className="container-fluid text-center">
      <h1>Welcome to Taco Baco</h1>
      <form onSubmit={handleLogin} className="w-25 mx-auto">
        <div className="mb-3 input-group">
          <span className="input-group-text">@</span>
          <input type="text" className="form-control" placeholder="your@email.com" required />
        </div>
        <div className="mb-3 input-group">
          <span className="input-group-text">🔒</span>
          <input type="password" className="form-control" placeholder="password" required />
        </div>
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-dark w-50">Login</button>
          <button type="button" className="btn btn-secondary w-50">Create</button>
        </div>
      </form>
      <p>After you log in, your friends' posts go here.</p>
    </main>
  );
}

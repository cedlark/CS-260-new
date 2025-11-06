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
        <div>
          {authState !== AuthState.Unknown && <h1>Welcome to Simon</h1>}
          {authState === AuthState.Authenticated && (
            <Authenticated userName={userName} onLogout={() => onAuthChange(userName, AuthState.Unauthenticated)} />
          )}
          {authState === AuthState.Unauthenticated && (
            <Unauthenticated
              userName={userName}
              onLogin={(loginUserName) => {
                onAuthChange(loginUserName, AuthState.Authenticated);
              }}
            />
          )}
        </div>
      </form>
      <p>After you log in, your friends' posts go here.</p>
    </main>
  );
}

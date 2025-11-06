import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthState } from './authState';
import { Unauthenticated } from './unauthenticated';

export function Login({ setUserName }) {
  const navigate = useNavigate();

  const [authState, setAuthState] = React.useState(AuthState.Unknown);
  const [userName, setUserNameLocal] = React.useState(localStorage.getItem('userName') || '');

  function onAuthChange(loginUserName, newState) {
    setUserNameLocal(loginUserName);
    setAuthState(newState);

    if (typeof setUserName === 'function') {
      setUserName(loginUserName);
    }

    if (newState === AuthState.Authenticated) {
      navigate('/friends');
    }
  }

  React.useEffect(() => {
    if (userName) {
      setAuthState(AuthState.Authenticated);
    } else {
      setAuthState(AuthState.Unauthenticated);
    }
  }, [userName]);

  return (
    <main className="container-fluid text-center">
      <h1>Welcome to Taco Baco</h1>

      {authState === AuthState.Unauthenticated && (
        <Unauthenticated
          userName={userName}
          onLogin={(loginUserName) => onAuthChange(loginUserName, AuthState.Authenticated)}
        />
      )}

      {authState === AuthState.Authenticated && (
        <p>You’re already logged in as {userName}.</p>
      )}

      <p>After you log in, your friends' posts will appear here.</p>
    </main>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthState } from './authState';
import { Unauthenticated } from './unauthenticated';

export function Login() {
  const navigate = useNavigate();

  const [authState, setAuthState] = React.useState(AuthState.Unknown);
  const [userName, setUserName] = React.useState(localStorage.getItem('userName') || '');

  function onAuthChange(userName, newState) {
    setUserName(userName);
    setAuthState(newState);
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

      <div className="w-25 mx-auto">
        {authState !== AuthState.Unknown && <h2>Welcome to Simon</h2>}

        {authState === AuthState.Authenticated && (
          <Authenticated
            userName={userName}
            onLogout={() => onAuthChange('', AuthState.Unauthenticated)}
          />
        )}

        {authState === AuthState.Unauthenticated && (
          <Unauthenticated
            userName={userName}
            onLogin={(loginUserName) => {
              onAuthChange(loginUserName, AuthState.Authenticated);
              navigate('/friends'); 
            }}
          />
        )}
      </div>

      <p>After you log in, your friends' posts go here.</p>
    </main>
  );
}

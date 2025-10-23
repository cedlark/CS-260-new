import React from 'react';

export function Login() {
  return (
    <main className="container-fluid text-center">
      <h1>Welcome to Taco Baco</h1>
        <form method="get" action="play.html" class="w-25">
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
    </main>
  );
}
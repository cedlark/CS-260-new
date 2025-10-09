import React from 'react';

export function Login() {
  return (
    <main className="container-fluid bg-secondary text-center">
      <h1>Welcome to Taco Baco</h1>
        <form method="get" action="play.html" class="w-25">
          <div class="mb-3 input-group">
            <span class="input-group-text">@</span>
            <input type="text" class="form-control" placeholder="your@email.com" />
          </div>
          <div class="mb-3 input-group">
            <span class="input-group-text">🔒</span>
            <input type="password" class="form-control" placeholder="password" />
          </div>
          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-dark w-50">Login</button>
            <button type="submit" class="btn btn-secondary w-50">Create</button>
          </div>
        </form>
        <p>After you log in your friends posts go here</p>
    </main>
  );
}
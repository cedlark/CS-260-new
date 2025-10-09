import React from 'react';
import './friends.css'

export function Friends() {
  return (
    <main className="container-fluid bg-secondary text-center">
      <button id = "newFriend" onclick="foo()">Find New Friends</button>
      <p>
        
        Here you can see all of your current friends.
      </p>
    </main>
  );
}
import React from 'react';

export function Post() {
  return (
    <main className="container-fluid bg-secondary text-center">
      <br />

<div>
  <label htmlFor="count">Enter Text Here</label>
  <input type="text" id="count" defaultValue="--" readOnly />
</div>

<br />

<div>
  <button>Add A Post</button>
</div>

<br />

<div>
  <h2>Previous Posts</h2>
  <div>
      <p>mmmm Tacos</p>
      <img src = "tacos.svg" width = "300px" />
  </div>
</div>
    </main>
  );
}
import React, { useState, useEffect } from 'react';
import './friends.css';

export function Friends() {
  const [showPopup, setShowPopup] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [friends, setFriends] = useState([]);

  // Load your existing friend list when page opens
  useEffect(() => {
    fetch('/api/friends')
      .then(res => res.json())
      .then(setFriends);
  }, []);

  // Fetch search results whenever query changes
  useEffect(() => {
    const delay = setTimeout(() => {
      if (search.trim() !== "") {
        fetch(`/api/users/search?q=${encodeURIComponent(search)}`)
          .then(res => res.json())
          .then(setResults)
          .catch(() => setResults([]));
      } else {
        setResults([]);
      }
    }, 300); // debounce typing
    return () => clearTimeout(delay);
  }, [search]);

  const addFriend = async (friendEmail) => {
    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendEmail })
    });
    const updated = await res.json();
    setFriends(updated);
  };
  async function removeFriend(email) {
    const res = await fetch('/api/friends/remove', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendEmail: email }),
    });
    const updated = await res.json();
    setFriends(updated);
  }

  return (
    <main className="container-fluid text-center">
      <button id="newFriend" onClick={() => setShowPopup(true)}>
        Find New Friends
      </button>

      <h2>Your Friends</h2>
      {friends.length === 0 ? <p>No friends yet 😢</p> :
        <ul>{friends.map((f) => (
          <li key={f} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
            <span>{f}</span>
            <button onClick={() => removeFriend(f)}>Remove</button>
          </li>
        ))}</ul>
      }

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Search for Friends</h3>
            <input
              type="text"
              placeholder="Enter email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <ul style={{ textAlign: "left", maxHeight: "150px", overflowY: "auto", padding: 0 }}>
              {results.map((u) => (
                <li key={u.email} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{u.email}</span>
                  <button onClick={() => addFriend(u.email)}>Add</button>
                </li>
              ))}
              {results.length === 0 && search && <li>No users found</li>}
            </ul>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </main>
  );
}

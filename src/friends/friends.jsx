import React, { useState, useEffect } from 'react';
import './friends.css';
import usersData from './users.json';

export function Friends() {
  const [showPopup, setShowPopup] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    setUsers(usersData);
  }, []);

  const filteredUsers = users.filter((u) =>
    u.toLowerCase().includes(search.toLowerCase())
  );

  const addFriend = (username) => {
    if (!friends.includes(username)) {
      setFriends([...friends, username]);
    }
  };

  return (
    <main className="container-fluid text-center">
      <button id="newFriend" onClick={() => setShowPopup(true)}>
        Find New Friends
      </button>

      <h2>Friends Posts</h2>
      {friends.length === 0 ? (
        <p>No friends yet 😢</p>
      ) : (
        <div style={{ marginTop: "20px" }}>
          {friends.map((f) => (
            <div
              key={f}
              style={{
                border: "1px dashed gray",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            >
              <strong>{f}</strong>'s post will appear here.
            </div>
          ))}
        </div>
      )}

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Search for Friends</h3>
            <input
              type="text"
              placeholder="Enter username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <ul style={{ textAlign: "left", maxHeight: "150px", overflowY: "auto", padding: 0 }}>
              {filteredUsers.map((u) => (
                <li
                  key={u}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span>{u}</span>
                  <button
                    onClick={() => addFriend(u)}
                    style={{ padding: "4px 8px", fontSize: "0.9rem" }}
                  >
                    Add Friend
                  </button>
                </li>
              ))}
              {filteredUsers.length === 0 && <li>No users found</li>}
            </ul>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </main>
  );
}

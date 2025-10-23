import React, { useState, useEffect } from "react";
import "./posts.css";


export function Post() {
    const [showPopup, setShowPopup] = useState(false);
    const [text, setText] = useState("");
    const [image, setImage] = useState(null);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem("posts");
        if (saved) setPosts(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem("posts", JSON.stringify(posts));
      }, [posts]);

    const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePost = () => {
    if (text.trim() === "") return;
    const newPost = { text, image, id: Date.now() };
    setPosts([newPost, ...posts]);
    setText("");
    setImage(null);
    setShowPopup(false);
  };
  return (
    <main className="container-fluid  text-center">
      <br />

<div>
  <label htmlFor="count">Enter Text Here</label>
  <input type="text" id="count" defaultValue="--" readOnly />
</div>

<br />

<div>
    <button id="newFriend" onClick={() => setShowPopup(true)}>
        Make a Post
      </button>
</div>

<br />

<div>
  <h2>Previous Posts</h2>
  <div>
      <p>mmmm Tacos</p>
      <img src = "tacos.svg" width = "300px" />
  </div>
</div>
{showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Make a New post</h3>
            <input
              type="text"
              placeholder="Enter text here..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <ul style={{ textAlign: "left", maxHeight: "150px", overflowY: "auto", padding: 0 }}>
              {filteredUsers.map((u) => (
                <li key={u} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span>{u}</span>
                  <button
                    onClick={() => addPost(u)}
                    style={{ padding: "4px 8px", fontSize: "0.9rem" }}
                  >
                    Make Post
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
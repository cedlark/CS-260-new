import React, { useState, useEffect } from "react";
import "./post.css";

export function Post() {
  const [showPopup, setShowPopup] = useState(false);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [posts, setPosts] = useState([]);

  // Load posts from backend
  useEffect(() => {
    fetch("/api/post")
      .then((res) => res.json())
      .then(setPosts)
      .catch(() => setPosts([]));
  }, []);

  // Upload image file to backend
  async function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setImage(data.imagePath); // store server path instead of base64
  }

  // Submit new post
  async function handlePost() {
    if (text.trim() === "") return;
    const newPost = { text, image };
    const res = await fetch("/api/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost),
    });
    const updatedPosts = await res.json();
    setPosts(updatedPosts);
    setText("");
    setImage(null);
    setShowPopup(false);
  }

  return (
    <main className="container-fluid text-center">
      <br />
      <div>
        <button id="newPost" onClick={() => setShowPopup(true)}>
          Make a Post
        </button>
      </div>

      <br />
      <div>
        <h2>Previous Posts</h2>
        {!Array.isArray(posts) || posts.length === 0 ? (
          <p>No posts yet!</p>
        ) : (
          posts.map((p) => (
            <div key={p._id || p.id || Math.random()} className="post-card">
              {/* poster name on the left */}
              <div style={{ textAlign: 'left', fontWeight: 'bold' }}>
                {p.user || 'Unknown user'}
              </div>

              <p>{p.text}</p>

              {p.image && (
                <img
                  src={p.image}
                  alt="post"
                  width="300px"
                  style={{ marginTop: '8px', borderRadius: '8px' }}
                />
              )}
            </div>
          ))
        )}
      </div>


      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Create Post</h3>
            <textarea
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows="4"
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <label
              htmlFor="imageUpload"
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "inline-block",
                marginBottom: "10px",
              }}
            >
              Add Image
            </label>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />

            {image && (
              <img
                src={image}
                alt="preview"
                width="100%"
                style={{
                  marginTop: "10px",
                  borderRadius: "10px",
                  maxHeight: "300px",
                  objectFit: "cover",
                }}
              />
            )}

            <div style={{ marginTop: "15px" }}>
              <button onClick={handlePost}>Post</button>
              <button
                onClick={() => setShowPopup(false)}
                style={{ marginLeft: "10px" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

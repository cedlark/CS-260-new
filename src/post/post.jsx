import React, { useState, useEffect } from "react";
import "./post.css";


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
        {posts.length === 0 && <p>No posts yet!</p>}
        {posts.map((p) => (
          <div key={p.id} className="post-card">
            <p>{p.text}</p>
            {p.image && <img src={p.image} alt="post" width="300px" />}
          </div>
        ))}
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
                    marginBottom: "10px"
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
                        objectFit: "cover"
                        }}
                    />
                    )}
            {image && (
              <img
                src={image}
                alt="preview"
                width="100%"
                style={{ marginTop: "10px", borderRadius: "10px" }}
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
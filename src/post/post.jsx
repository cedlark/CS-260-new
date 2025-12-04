import React, { useState, useEffect, useRef } from "react";
import "./post.css";

export function Post() {
  const [showPopup, setShowPopup] = useState(false);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [posts, setPosts] = useState([]);

  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Load posts from backend
  useEffect(() => {
    fetch("/api/post", { credentials: "include" })
      .then((res) => res.json())
      .then((posts) => {
        posts.sort((a, b) => b.timestamp - a.timestamp);
        setPosts(posts);
      })
      .catch(() => setPosts([]));
  }, []);

  // Convert file to Base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Handle choosing an image from disk/gallery
  async function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setImage(base64);
  }

  // Open camera modal & start webcam
  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setShowCamera(true);

      setTimeout(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      }, 50);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera not accessible.");
    }
  }

  // Close camera modal & stop webcam
  function closeCamera() {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  }

  // Capture webcam frame → Base64
  async function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64 = canvas.toDataURL("image/png");
    setImage(base64);

    closeCamera();
  }

  // WebSocket for live posts
  useEffect(() => {
    const protocol = window.location.protocol === "http:" ? "ws" : "wss";
    const ws = new WebSocket(`${protocol}://${window.location.host}`);

    ws.onopen = () => {
      const token = document.cookie.split("=")[1];
      ws.send(JSON.stringify({ type: "auth", token }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "post") {
        setPosts((prev) => [data.post, ...prev]);
      }
    };

    return () => ws.close();
  }, []);

  // Create post (WebSocket will update feed)
  async function handlePost() {
    if (!text.trim()) return;

    const newPost = { text, image };

    await fetch("/api/post", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost),
    });

    setText("");
    setImage(null);
    setShowPopup(false);
  }

  return (
    <main className="container-fluid text-center">
      <br />
      <button id="newPost" onClick={() => setShowPopup(true)}>
        Make a Post
      </button>

      <br />
      <h2>Previous Posts</h2>

      {!Array.isArray(posts) || posts.length === 0 ? (
        <p>No posts yet!</p>
      ) : (
        posts.map((p) => (
          <div key={p._id || p.id || Math.random()} className="post-card">
            <div style={{ textAlign: "left", fontWeight: "bold" }}>
              {p.user || "Unknown user"}
            </div>

            <p>{p.text}</p>

            {p.image && (
              <img
                src={p.image}
                alt="post"
                width="300px"
                style={{ marginTop: "8px", borderRadius: "8px" }}
              />
            )}
          </div>
        ))
      )}

      {/* POST POPUP */}
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

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <button
                onClick={openCamera}
                style={{
                  backgroundColor: "#28a745",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  border: "none",
                }}
              >
                📸 Take Photo
              </button>

              <button
                onClick={() =>
                  document.getElementById("choosePhotoInput").click()
                }
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  border: "none",
                }}
              >
                📁 Choose Photo
              </button>
            </div>

            {/* Hidden input */}
            <input
              id="choosePhotoInput"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />

            {/* Preview */}
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

      {/* CAMERA MODAL */}
      {showCamera && (
        <div
          className="camera-modal"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "16px",
              borderRadius: "10px",
              maxWidth: "500px",
              width: "100%",
            }}
          >
            <h4>Take a Photo</h4>
            <video
              ref={videoRef}
              style={{
                width: "100%",
                height: "300px",
                borderRadius: "8px",
                backgroundColor: "black",
                objectFit: "cover",
              }}
              autoPlay
              playsInline
              muted
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            <div
              style={{
                marginTop: "10px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <button onClick={capturePhoto}>Capture</button>
              <button onClick={closeCamera}>Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

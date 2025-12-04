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
      .then(setPosts)
      .catch(() => setPosts([]));
  }, []);

  // Helper to upload any File/Blob to backend
  async function uploadImageFile(file) {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await res.json();
    setImage(data.imagePath); // store server path instead of base64
  }

  // Handle file chosen from disk / gallery
  async function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    await uploadImageFile(file);
  }

  // Open camera modal and start webcam
  async function openCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Camera not supported in this browser.");
      return;
    }
  
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }
      });
  
      setShowCamera(true);
  
      setTimeout(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      }, 50);
  
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Check permissions.");
    }
  }
  

  // Stop webcam stream and close modal
  function closeCamera() {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  }

  // Capture a frame from the video and upload it
  async function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;
  
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
  
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
  
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    canvas.toBlob(async (blob) => {
      const file = new File([blob], "captured.png", { type: "image/png" });
      await uploadImageFile(file);
      closeCamera();
    }, "image/png");
  }
  

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);

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

  // Submit new post (WebSocket will update the list)
  async function handlePost() {
    if (text.trim() === "") return;
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
              <div style={{ textAlign: "left", fontWeight: "bold" }}>
                {p.user || "Unknown user"}
              </div>

              <p>{p.text}</p>

              {p.image && (
                <img
                  src={`http://localhost:4000${p.image}`}
                  alt="post"
                  width="300px"
                  style={{ marginTop: "8px", borderRadius: "8px" }}
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

            {/* Take / Choose photo buttons */}
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

            {/* Hidden input for choosing photo */}
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
                src={`http://localhost:4000${image}`}
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

      {/* Camera modal */}
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

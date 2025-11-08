import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

const ObjectDetector = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [detectedObject, setDetectedObject] = useState(null); // notification state

  // List of objects that we are interested in detecting
  const knownObjects = ["handbag", "cell phone", "book"];

  useEffect(() => {
    const runDetection = async () => {
      const model = await cocoSsd.load();
      console.log("Model loaded ✅");

      setInterval(() => {
        detect(model);
      }, 1000);
    };

    const detect = async (model) => {
      const video = webcamRef.current?.video;
      if (video && video.readyState === 4) {
        const predictions = await model.detect(video);

        predictions.forEach((pred) => {
          // Exclude detection of person class
          if (pred.class === "person") {
            return; // Skip person detection
          }

          // Check if the detected object is in our known list
          if (knownObjects.includes(pred.class)) {
            console.log(`🔍 Detected: ${pred.class}`);
            showNotification(pred.class);
          } else {
            // If it's not in the known list, treat it as an unknown item
            console.log(`🔍 Unknown item detected: ${pred.class}`);
            showNotification("Something might be left behind");
          }
        });

        drawCanvas(predictions, video);
      }
    };

    const showNotification = (message) => {
      setDetectedObject(message); // show notification
      setTimeout(() => {
        setDetectedObject(null); // hide after 3 seconds
      }, 3000);
    };

    const drawCanvas = (predictions, video) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Set canvas to full screen
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings

      predictions.forEach((pred) => {
        const [x, y, width, height] = pred.bbox;
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(x * (canvas.width / video.videoWidth), y * (canvas.height / video.videoHeight), width * (canvas.width / video.videoWidth), height * (canvas.height / video.videoHeight));

        ctx.fillStyle = "red";
        ctx.font = "16px Arial";
        ctx.fillText(pred.class, x * (canvas.width / video.videoWidth), y > 10 ? y - 5 : 10);
      });
    };

    runDetection();
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Webcam
        ref={webcamRef}
        audio={false}
        mirrored={true}
        style={{ width: "100%", height: "100%" }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none", // Prevents canvas from blocking webcam interaction
        }}
      />

      {/* 🛎️ Notification Popup */}
      {detectedObject && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#ff4d4d",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "10px",
            fontWeight: "bold",
            zIndex: 999,
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          ⚠️ {detectedObject}
        </div>
      )}
    </div>
  );
};

export default ObjectDetector;

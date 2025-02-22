import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { Button, Typography, Box, CircularProgress } from "@mui/material";
import { useSnackbar } from "../context/snackbar_context/useSnackbar";

export default function CameraComponent() {
    const { showSnackbar } = useSnackbar(); // Lấy showSnackbar từ context
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const [capturedImages, setCapturedImages] = useState([]);
    const [bestImage, setBestImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = "/models";
            try {
                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                console.log("✅ Models loaded!");
            } catch (error) {
                console.error("❌ Error loading models:", error);
            }
        };
        loadModels();
    }, []);

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const startCamera = async () => {
        setCapturedImages([]);
        setBestImage(null);
        setIsProcessing(false);

        try {
            const userStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(userStream);
            if (videoRef.current) {
                videoRef.current.srcObject = userStream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play();
                    detectFaces();
                };
            }
        } catch (err) {
            setError(err);
        }
    };

    const captureImage = async (probability) => {
        if (capturedImages.length >= 5) return;

        const video = videoRef.current;
        if (!video) {
            console.error("Không thể truy cập videoRef.current");
            return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL("image/png");

        console.log(`📸 Ảnh ${capturedImages.length + 1} chụp với xác suất: ${probability}`);
        console.log(`🖼️ Image Data URL:`, imageData);

        setCapturedImages(prev => {
            const newImages = [...prev, { image: imageData, prob: probability }];
            if (newImages.length === 5) {
                console.log("✅ Đã chụp đủ 5 ảnh, dừng camera.");
                stopCamera();  // Dừng camera khi đủ 5 ảnh
            }
            return newImages;
        });
    };

    const detectFaces = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const displaySize = { width: video.videoWidth, height: video.videoHeight };
        faceapi.matchDimensions(canvas, displaySize);

        const interval = setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 }));

            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);

            resizedDetections.forEach(detection => {
                if (detection.score >= 0.8) {
                    captureImage(detection.score);
                }
            });

            if (capturedImages.length >= 5) {
                clearInterval(interval);
            }
        }, 200);
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
        setIsProcessing(true);
        showSnackbar('Điểm danh thành công!', 'success');
        setIsProcessing(false);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            {error && <Typography sx={{ color: "error.main" }}>{error.message}</Typography>}
            {isProcessing && <Typography variant="h6" sx={{ color: "success.main" }}>✅ Đã xử lý ảnh!</Typography>}
            <Box sx={{ position: "relative", width: "100%", maxWidth: 600 }}>
                {!isProcessing ? (
                    <>
                        <video ref={videoRef} autoPlay playsInline style={{ width: "100%", height: "auto", borderRadius: 2 }} />
                        <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
                    </>
                ) : bestImage ? (
                    <img src={bestImage} alt="Ảnh tốt nhất" style={{ width: "100%", maxWidth: 400, borderRadius: 2, border: "2px solid #007bff" }} />
                ) : null}
            </Box>
            {!isProcessing && (
                <Button variant="contained" color="primary" onClick={startCamera} sx={{ padding: "10px 15px" }}>
                    Mở Camera
                </Button>
            )}
            {isProcessing && !bestImage && <CircularProgress />}
        </Box>
    );
}

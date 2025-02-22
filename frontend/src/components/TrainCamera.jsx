import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { Button, Typography, Box, CircularProgress } from "@mui/material";
import { useSnackbar } from "../context/snackbar_context/useSnackbar";
import { useAuth } from "../context/auth_context/useAuth";

export default function CameraComponent() {
    const { showSnackbar } = useSnackbar();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const [capturedImages, setCapturedImages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [timer, setTimer] = useState(5); // 10 giây quay video
    const [message, setMessage] = useState("Quay video, xoay mặt mỗi 2s!");
    const { user } = useAuth()


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
        setIsProcessing(false);
        setTimer(10);
        setMessage("Quay video, xoay mặt mỗi 2s!");

        try {
            const userStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(userStream);
            if (videoRef.current) {
                videoRef.current.srcObject = userStream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play();
                    detectFaces();
                    startTimer();
                };
            }
        } catch (err) {
            setError(err);
        }
    };

    const startTimer = () => {
        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    stopCamera();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
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

        // Dùng hàm callback để đảm bảo cập nhật chính xác
        setCapturedImages(prev => {
            const newImages = [...prev, { image: imageData, prob: probability }];
            return newImages;
        });
    };

    useEffect(() => {
        console.log("Captured images have been updated:", capturedImages);
    }, [capturedImages]);

    const detectFaces = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const displaySize = { width: video.videoWidth, height: video.videoHeight };
        faceapi.matchDimensions(canvas, displaySize);

        const interval = setInterval(async () => {
            // Nhận diện tất cả khuôn mặt
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 }));

            // Điều chỉnh kích thước của các kết quả nhận diện với kích thước của video
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Xóa canvas mỗi lần trước khi vẽ lại

            // Vẽ bounding box cho tất cả khuôn mặt đã phát hiện
            faceapi.draw.drawDetections(canvas, resizedDetections);

            resizedDetections.forEach(detection => {
                if (detection.score >= 0.8) {
                    captureImage(detection.score); // Chụp ảnh nếu độ chính xác đủ cao
                }
            });

            // Dừng nhận diện sau khi đã chụp đủ ảnh (hoặc khi hết thời gian quay video)
            if (capturedImages.length >= 5 || timer <= 0) {
                clearInterval(interval);
            }
        }, 200); // Cập nhật bounding box và nhận diện mỗi 200ms
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
        setIsProcessing(true);
        // Di chuyển showSnackbar vào useEffect
        setTimeout(() => {
            showSnackbar("Quá trình quay video kết thúc!", "success");
        }, 0);

        // Gửi dữ liệu ảnh
        const formData = new FormData();
        // images.forEach((file) => {
        //     formData.append("images[]", file);  // Gửi tất cả ảnh vào một key "images[]"
        // });
        formData.append("label", user.name);
        console.log("Form data đã chuẩn bị:", formData);

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
                ) : (
                    <Typography variant="h6" sx={{ color: "success.main" }}>Ảnh chụp đã xong!</Typography>
                )}
            </Box>
            <Typography>{message} {timer > 0 && `(${timer}s)`}</Typography>
            {!isProcessing && (
                <Button variant="contained" color="primary" onClick={startCamera} sx={{ padding: "10px 15px" }}>
                    Mở Camera
                </Button>
            )}
            {isProcessing && <CircularProgress />}
        </Box>
    );
}

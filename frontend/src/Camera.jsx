import { useEffect, useRef, useState } from "react";
import "./index.css";

export default function CameraComponent() {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const startCamera = async () => {
        try {
            const userStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(userStream);
            if (videoRef.current) {
                videoRef.current.srcObject = userStream;
            }
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div className="camera-container">
            {error && <p className="error-message">{error}</p>}
            <video ref={videoRef} autoPlay playsInline className="camera-feed" />
            <button className="camera-button" onClick={startCamera}>Mở Camera</button>
        </div>
    );
}
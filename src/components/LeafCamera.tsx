import React, { useState, useEffect, useRef } from "react";
import { Camera, RotateCw, AlertCircle, X, Check } from "lucide-react";

interface LeafCameraProps {
  onCapture: (base64Image: string) => void;
  onClose?: () => void;
}

export function LeafCamera({ onCapture, onClose }: LeafCameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [permissionState, setPermissionState] = useState<"prompt" | "granted" | "denied">("prompt");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);

  // Enumerate available video input devices
  const enumerateDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((device) => device.kind === "videoinput");
      setDevices(videoDevices);
      
      // Select the first device if none selected
      if (videoDevices.length > 0 && !selectedDeviceId) {
        // Try to prioritize the rear camera ("environment") if available on mobile
        const backCamera = videoDevices.find((d) => 
          d.label.toLowerCase().includes("back") || 
          d.label.toLowerCase().includes("rear") || 
          d.label.toLowerCase().includes("environment")
        );
        setSelectedDeviceId(backCamera ? backCamera.deviceId : videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error("Error enumerating video devices:", err);
    }
  };

  // Start the video stream
  const startStream = async (deviceId?: string) => {
    stopStream();
    setIsInitializing(true);
    setErrorMsg(null);

    const targetDeviceId = deviceId || selectedDeviceId;
    const constraints: MediaStreamConstraints = {
      video: targetDeviceId 
        ? { deviceId: { exact: targetDeviceId } } 
        : { facingMode: "environment" }, // Default to back camera
      audio: false
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error("Video play interrupted:", e));
      }
      
      setPermissionState("granted");
      setCameraActive(true);
      
      // Enumerate devices again now that permission is granted to get real labels
      await enumerateDevices();
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionState("denied");
        setErrorMsg("Camera access denied. Please enable camera permissions in your browser settings.");
      } else {
        setErrorMsg(`Could not start video stream: ${err.message || "Unknown hardware error"}`);
      }
    } finally {
      setIsInitializing(false);
    }
  };

  // Stop the video stream
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Clean up stream on unmount
  useEffect(() => {
    // Attempt to auto-start stream on load
    startStream();
    return () => {
      stopStream();
    };
  }, []);

  // Handle switching camera source
  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    startStream(deviceId);
  };

  // Cycle to next camera device (helpful mobile toggle button)
  const cycleCamera = () => {
    if (devices.length <= 1) return;
    const currentIndex = devices.findIndex((d) => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDevice = devices[nextIndex];
    handleDeviceChange(nextDevice.deviceId);
  };

  // Capture a snapshot frame
  const captureFrame = () => {
    if (!videoRef.current || !cameraActive) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    
    // Set matching dimensions
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get Data URL
    try {
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      // Callback to parent with captured image
      onCapture(dataUrl);
      stopStream();
    } catch (e) {
      console.error("Failed to capture image canvas frame", e);
      setErrorMsg("Failed to capture image frame from video feed.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Device Selection dropdown if multiple are found */}
      {devices.length > 1 && (
        <div className="flex items-center justify-between gap-2 border border-editorial-dark/10 p-2 bg-editorial-bg text-left">
          <label className="text-[9px] uppercase tracking-wider font-bold text-gray-400">
            Source:
          </label>
          <select
            value={selectedDeviceId}
            onChange={(e) => handleDeviceChange(e.target.value)}
            className="text-[10px] bg-white border border-editorial-dark/10 p-1 text-editorial-dark focus:outline-none flex-1 max-w-[150px]"
          >
            {devices.map((device, idx) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${idx + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Video Viewfinder Screen */}
      <div className="relative aspect-video bg-editorial-dark flex items-center justify-center overflow-hidden border border-editorial-dark/20 shadow-sm group">
        {permissionState === "granted" && cameraActive && (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]" // mirror view for intuitive preview
            />
            {/* Viewfinder crosshair guidelines */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-2/3 h-2/3 border border-white/20 border-dashed relative">
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-editorial-green"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-editorial-green"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-editorial-green"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-editorial-green"></div>
                
                {/* Central guide prompt */}
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[8px] uppercase tracking-widest text-white/40 font-bold font-sans text-center">
                  Align Leaf Here
                </span>
              </div>
            </div>
          </>
        )}

        {isInitializing && (
          <div className="absolute inset-0 bg-editorial-dark flex flex-col items-center justify-center text-center p-4">
            <RotateCw className="w-6 h-6 text-white/50 animate-spin mb-2" />
            <span className="text-[10px] uppercase tracking-widest text-white/60 font-bold">
              Initializing Cam...
            </span>
          </div>
        )}

        {permissionState === "denied" && (
          <div className="absolute inset-0 bg-editorial-rust/10 flex flex-col items-center justify-center text-center p-4">
            <AlertCircle className="w-8 h-8 text-editorial-rust mb-2" />
            <span className="text-[10px] uppercase tracking-widest text-editorial-rust font-bold">
              Permission Blocked
            </span>
            <p className="text-[9px] text-gray-500 mt-1 max-w-[180px] leading-normal font-sans">
              Enable your browser's camera access in order to take live leaf snapshots.
            </p>
          </div>
        )}

        {errorMsg && !isInitializing && permissionState !== "denied" && (
          <div className="absolute inset-0 bg-editorial-rust/5 flex flex-col items-center justify-center text-center p-4">
            <AlertCircle className="w-8 h-8 text-editorial-rust mb-2" />
            <p className="text-[9px] text-editorial-rust font-semibold leading-normal font-sans max-w-[180px]">
              {errorMsg}
            </p>
            <button
              onClick={() => startStream()}
              className="mt-2 text-[9px] uppercase tracking-widest border border-editorial-rust/30 px-2 py-1 bg-white text-editorial-rust hover:bg-editorial-rust hover:text-white transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Control Actions Row */}
      <div className="grid grid-cols-3 gap-2">
        {onClose && (
          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="py-2.5 border border-editorial-dark/10 text-gray-500 hover:text-editorial-dark hover:border-editorial-dark text-[9px] uppercase tracking-widest bg-white flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
        )}

        {devices.length > 1 ? (
          <button
            type="button"
            onClick={cycleCamera}
            disabled={!cameraActive}
            className="py-2.5 border border-editorial-dark/10 text-editorial-dark hover:bg-editorial-bg text-[9px] uppercase tracking-widest bg-white flex items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Flip Cam
          </button>
        ) : (
          <div className="text-center py-2 text-[8px] text-gray-400 uppercase tracking-wider flex items-center justify-center font-bold">
            Single Cam
          </div>
        )}

        <button
          type="button"
          onClick={captureFrame}
          disabled={!cameraActive}
          className="py-2.5 bg-editorial-green hover:bg-editorial-dark text-white text-[9px] uppercase tracking-widest flex items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
        >
          <Camera className="w-3.5 h-3.5" />
          Capture
        </button>
      </div>
    </div>
  );
}

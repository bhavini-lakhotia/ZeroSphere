"use client";

import { useRef, useEffect, useState } from "react";
import { Camera, Loader2, ImagePlus, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { scanReceipt } from "@/actions/transaction";

export function ReceiptScanner({ onScanComplete }) {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraRequested, setCameraRequested] = useState(false); // <-- Track request state

  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
  } = useFetch(scanReceipt);

  const handleReceiptScan = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }
    await scanReceiptFn(file);
  };

  useEffect(() => {
    if (scannedData && !scanReceiptLoading) {
      onScanComplete(scannedData);
      toast.success("Receipt scanned successfully");
    }
  }, [scanReceiptLoading, scannedData]);

  // 🚀 Start camera AFTER video is rendered
  useEffect(() => {
    const startCamera = async () => {
      if (!videoRef.current) {
        console.warn("Video element not ready");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
        setCameraActive(true);
      } catch (err) {
        toast.error("Camera access failed: " + err.message);
      }
    };

    if (cameraRequested && !cameraActive) {
      startCamera();
    }
  }, [cameraRequested, cameraActive]);

  const stopCamera = () => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      const stream = video.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
    setCameraActive(false);
    setCameraRequested(false);
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "receipt.jpg", { type: "image/jpeg" });
        stopCamera();
        handleReceiptScan(file);
      }
    }, "image/jpeg");
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2 w-full">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity text-white"
          onClick={() => fileInputRef.current?.click()}
          disabled={scanReceiptLoading}
        >
          {scanReceiptLoading ? (
            <>
              <Loader2 className="mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <ImagePlus className="mr-2" />
              Upload Receipt
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="secondary"
          className="flex-1 h-10"
          onClick={() => {
            if (cameraActive) {
              stopCamera();
            } else {
              setCameraRequested(true); // ⬅️ Trigger video rendering, then start camera
            }
          }}
          disabled={scanReceiptLoading}
        >
          {cameraActive ? (
            <>
              <Video className="mr-2" />
              Stop Camera
            </>
          ) : (
            <>
              <Camera className="mr-2" />
              Open Camera
            </>
          )}
        </Button>
      </div>

      {cameraRequested && (
        <div className="relative w-full max-w-md mt-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-lg border shadow"
          />
          <canvas ref={canvasRef} className="hidden" />
          <Button
            onClick={captureImage}
            className="absolute bottom-2 right-2 bg-white text-black shadow"
          >
            Capture
          </Button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReceiptScan(file);
        }}
      />
    </div>
  );
}

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

  const [cameraRequested, setCameraRequested] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);

  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
  } = useFetch(scanReceipt);

  const handleReceiptScan = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be < 5MB");
      return;
    }
    await scanReceiptFn(file);
  };

  useEffect(() => {
    if (scannedData && !scanReceiptLoading) {
      toast.success("Receipt scanned");
      onScanComplete?.(scannedData);
    }
  }, [scannedData, scanReceiptLoading]);

  useEffect(() => {
    const startCamera = async () => {
      if (cameraStarted || !cameraRequested || !videoRef.current) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });

        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.onloadedmetadata = () => video.play();
          setCameraStarted(true);
        }
      } catch (err) {
        toast.error("Camera access error: " + err.message);
        setCameraRequested(false);
        setCameraStarted(false);
      }
    };

    startCamera();
  }, [cameraRequested, cameraStarted]);

  const stopCamera = () => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
    setCameraRequested(false);
    setCameraStarted(false);
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "receipt.jpg", { type: "image/jpeg" });
        stopCamera();
        handleReceiptScan(file);
      }
    }, "image/jpeg");
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Upload / Camera Buttons */}
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
          onClick={() =>
            cameraStarted ? stopCamera() : setCameraRequested(true)
          }
          disabled={scanReceiptLoading}
        >
          {cameraStarted ? (
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

      {/* Camera preview */}
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

      {/* Hidden file input */}
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
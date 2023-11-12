import React, { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";

interface Props {
  labeledFaceDescriptors: faceapi.LabeledFaceDescriptors[];
  onMatches?: (matches: faceapi.FaceMatch[]) => void;
  onVideoReady?: (ref: React.RefObject<HTMLVideoElement>) => void;
}

export default function Detector({
  labeledFaceDescriptors,
  onMatches,
  onVideoReady,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const timeoutRef = useRef<NodeJS.Timeout>();

  const renderVideo = async () => {
    if (!videoRef.current) return;
    if (!containerRef.current) return;

    const canvas = faceapi.createCanvasFromMedia(videoRef.current);
    containerRef.current.append(canvas);

    const displaySize = {
      width: videoRef.current.width,
      height: videoRef.current.height,
    };

    canvas.classList.add("absolute", "top-0", "left-0");
    faceapi.matchDimensions(canvas, displaySize);

    timeoutRef.current = setInterval(async () => {
      if (!videoRef.current) {
        if (timeoutRef.current) clearInterval(timeoutRef.current);
        return;
      }
      const start = Date.now();
      const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.5);

      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceDescriptors();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      const results = resizedDetections.map((d) =>
        faceMatcher.findBestMatch(d.descriptor)
      );

      if (onMatches) onMatches(results);

      canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
      results.forEach((result, i) => {
        const box = resizedDetections[i].detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, {
          label: result.toString(),
        });
        drawBox.draw(canvas);
      });

      const end = Date.now();
      const time = end - start;
      if (spanRef.current) spanRef.current.innerText = `${time}ms`;
    }, 100);
  };

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("play", renderVideo);

        if (onVideoReady) onVideoReady(videoRef);
      }
    });

    return () => {
      videoRef.current &&
        videoRef.current.removeEventListener("play", renderVideo);

      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };
  }, [labeledFaceDescriptors]);

  return (
    <div ref={containerRef} className="relative">
      <video
        id="video"
        ref={videoRef}
        width={720}
        height={560}
        autoPlay
        muted
      ></video>
      <span
        ref={spanRef}
        className="absolute bottom-0 right-0 bg-white p-1 text-xs text-black"
      ></span>
    </div>
  );
}

"use client";

import React, { useRef } from "react";
import { useState } from "react";
// Third party imports
import JSZip from "jszip";
import { saveAs } from "file-saver";

//Custom Imports
import FramesPerSecSelector from "./components/fps";
import ProgressBar from "./components/ProgressBar";

export default function VideoFrameExtractor() {
const [fps, setFps] = useState(1);
  const [progress, setProgress] = useState(0);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [labelText, setLabelText] = useState("Select Video File");
  const [frames, setFrames] = useState<Blob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const vidRef = useRef<HTMLVideoElement>(null);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vidRef.current) return;

    const video = vidRef.current;
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      setVideoLoaded(true);
      setLabelText(file.name);
    };
  };

  const handleExtractFrames = async () => {
    if (!vidRef.current) return;
    setIsProcessing(true);
    const extracted = await extractFrames(vidRef.current, fps);
    setFrames(extracted);
    setIsProcessing(false);
  };

  const handleDownloadZip = async () => {
    if (frames.length === 0) return;
    const zip = new JSZip();
    frames.forEach((blob, i) => {
      zip.file(`frame_${i + 1}.jpg`, blob);
    });
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "frames.zip");
  };

  const extractFrames = async (video: HTMLVideoElement, fps: number) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const extractedFrames: Blob[] = [];
    const thumbs: string[] = [];

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const totalFrames = Math.floor(video.duration * fps);
    let frameCount = 0;

    const seekToTime = (time: number) =>
      new Promise<void>((resolve) => {
        const onSeeked = () => {
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumb = canvas.toDataURL("image/jpeg");
          thumbs.push(thumb);

          canvas.toBlob((blob) => {
            if (blob) extractedFrames.push(blob);
            video.removeEventListener("seeked", onSeeked);
            frameCount++;
            setProgress(Math.round((frameCount / totalFrames) * 100));
            resolve();
          }, "image/jpeg");
        };
        video.addEventListener("seeked", onSeeked);
        video.currentTime = time;
      });

    for (let t = 0; t < video.duration; t += 1 / fps) {
      await seekToTime(t);
    }

    setThumbnails(thumbs);
    return extractedFrames;
  };

  return (
    <>
    <div className="mx-auto flex flex-col justify-between h-[300px] max-w-md gap-y-4 rounded-xl bg-white p-6 shadow-lg outline outline-black/5 dark:bg-slate-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
    {/* Top Controls */}
    <div className="flex justify-between items-center">
  <label
    htmlFor="video-upload"
    className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 text-center shadow-sm transition hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-200"
  >
    {labelText}
  </label>
  <input
    id="video-upload"
    type="file"
    accept="video/*"
    onChange={handleVideoUpload}
    className="hidden"
  />
        <video ref={vidRef} style={{ display: "none" }} />
    </div>
            {/* The Video control components!*/}
        <div className="w-full">
        {isProcessing && <ProgressBar progress={progress} />}
        </div>

    {/* Bottom Buttons */}
    <div className="flex justify-between mt-auto">
      <button
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        onClick={handleExtractFrames}
        disabled={!videoLoaded || isProcessing}
      >
        {isProcessing ? "Extracting..." : "Start Extraction"}
      </button>
      <button
        className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
        onClick={handleDownloadZip}
        disabled={frames.length === 0}
      >
        Download ZIP
      </button>
    </div>
    </div>
    </>
  );
}

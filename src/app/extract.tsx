"use client";

import React, { useRef } from "react";
import { useState } from "react";
// Third party imports
import JSZip from "jszip";
import { saveAs } from "file-saver";

//Custom Imports
import FramesPerSecSelector from "./components/fps";
import ProgressBar from "./components/ProgressBar";
import ThumbnailGallery from "./components/ThumbnailPreview";

export default function VideoFrameExtractor() {
  const [fps, setFps] = useState(1);
  const [progress, setProgress] = useState(0);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const vidRef = useRef<HTMLVideoElement>(null);

  // Arrow Function to handle video upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // This will grab the file in the html

    //Handler for if there is no file in place
    if (!file || !vidRef.current) {
      //Empty return
      return;
    }

    const video = vidRef.current;
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = async () => {
      setIsProcessing(true);
      const frames = await extractFrames(video, 1); //1FPS
      await zipFrames(frames);

      setIsProcessing(false);
    };
  };

  // Meat and potatoes here
const extractFrames = async (video: HTMLVideoElement, fps: number) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frames: Blob[] = [];
    const thumbs: string[] = [];

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const totalFrames = Math.floor(video.duration * fps);
    let frameCount = 0;

    const seekToTime = (time: number) =>
      new Promise<void>((resolve) => {
        const onSeeked = () => {
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumb = canvas.toDataURL('image/jpeg');
          thumbs.push(thumb);

          canvas.toBlob((blob) => {
            if (blob) frames.push(blob);
            video.removeEventListener('seeked', onSeeked);
            frameCount++;
            setProgress(Math.round((frameCount / totalFrames) * 100));
            resolve();
          }, 'image/jpeg');
        };
        video.addEventListener('seeked', onSeeked);
        video.currentTime = time;
      });

    for (let t = 0; t < video.duration; t += 1 / fps) {
      await seekToTime(t);
    }

    setThumbnails(thumbs);
    return frames;
  };

  const zipFrames = async (frames: Blob[]) => {
    const zip = new JSZip();
    frames.forEach((blob, i) => {
      zip.file(`frame_${i + 1}.jpg`, blob);
    });

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "frames.zip");
  };

  return (
    <>
      <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
        <FramesPerSecSelector fps={fps} onChange={setFps} />
        <br />
        <br />
        <input type="file" accept="video/*" onChange={handleVideoUpload} />
        <video ref={vidRef} style={{ display: "none" }} />

        {/* The Video control components!*/}
        {isProcessing && <ProgressBar progress={progress} />}
        <ThumbnailGallery thumbnails={thumbnails} />
      </div>
    </>
  );
}

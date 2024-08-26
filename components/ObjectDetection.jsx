"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { load as cocoSSDLoad } from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import { renderPredictions } from "@/utils/RenderPredictions";
import { Button } from "./ui/button";

let detectInterval;

const ObjectDetection = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [devices, setDevices] = useState([]);
    const [currentDeviceId, setCurrentDeviceId] = useState(null);
    const [key, setKey] = useState(0); // Add a key to force re-render

    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    const handleDevices = useCallback(
        (mediaDevices) =>
            setDevices(
                mediaDevices.filter(({ kind }) => kind === "videoinput")
            ),
        [setDevices]
    );

    const getDevices = async () => {
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        handleDevices(mediaDevices);
    };

    const stopVideoStream = () => {
        if (webcamRef.current && webcamRef.current.stream) {
            webcamRef.current.stream
                .getTracks()
                .forEach((track) => track.stop());
        }
    };

    const toggleCamera = async () => {
        if (devices.length > 0) {
            stopVideoStream();
            const currentIndex = devices.findIndex(
                (device) => device.deviceId === currentDeviceId
            );
            const nextIndex = (currentIndex + 1) % devices.length;
            setCurrentDeviceId(devices[nextIndex].deviceId);
            setKey((prevKey) => prevKey + 1); // Force re-render

            // Add a delay to ensure the video stream is properly stopped before switching
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
    };

    async function runCoco() {
        setIsLoading(true); // Set loading state to true when model loading starts
        const net = await cocoSSDLoad();
        setIsLoading(false); // Set loading state to false when model loading completes

        await getDevices(); // Get devices after model is loaded

        detectInterval = setInterval(() => {
            runObjectDetection(net); // will build this next
        }, 10);
    }

    async function runObjectDetection(net) {
        if (
            canvasRef.current &&
            webcamRef.current !== null &&
            webcamRef.current.video?.readyState === 4
        ) {
            const videoWidth = webcamRef.current.video.videoWidth;
            const videoHeight = webcamRef.current.video.videoHeight;

            if (videoWidth && videoHeight) {
                canvasRef.current.width = videoWidth;
                canvasRef.current.height = videoHeight;

                // find detected objects
                const detectedObjects = await net.detect(
                    webcamRef.current.video,
                    undefined,
                    0.6
                );

                const context = canvasRef.current.getContext("2d");
                renderPredictions(detectedObjects, context);
            }
        }
    }

    const showmyVideo = () => {
        if (
            webcamRef.current !== null &&
            webcamRef.current.video?.readyState === 4
        ) {
            const myVideoWidth = webcamRef.current.video.videoWidth;
            const myVideoHeight = webcamRef.current.video.videoHeight;

            if (myVideoWidth && myVideoHeight) {
                webcamRef.current.video.width = myVideoWidth;
                webcamRef.current.video.height = myVideoHeight;
            }
        }
    };

    useEffect(() => {
        runCoco();
    }, []);

    useEffect(() => {
        if (currentDeviceId) {
            showmyVideo();
        }
    }, [currentDeviceId]);

    return (
        <div className="mt-8">
            {isLoading ? (
                <div className="gradient-text">Loading AI Model...</div>
            ) : (
                <div className="relative flex justify-center items-center gradient p-1.5 rounded-md">
                    {/* webcam */}
                    <Webcam
                        key={key} // Force re-render on key change
                        ref={webcamRef}
                        className="rounded-md w-full lg:h-[720px]"
                        audio={false}
                        videoConstraints={{ deviceId: currentDeviceId }}
                        onUserMediaError={(error) =>
                            console.error("Webcam error:", error)
                        }
                        onUserMedia={() => console.log("Webcam started")}
                    />
                    {/* canvas */}
                    <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 z-99999 w-full lg:h-[720px]"
                    />
                </div>
            )}
            <div className="flex justify-center items-center w-full mt-4">
                <Button onClick={toggleCamera} className="">
                    Toggle Camera
                </Button>
            </div>
        </div>
    );
};

export default ObjectDetection;

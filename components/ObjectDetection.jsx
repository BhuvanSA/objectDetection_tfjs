"use client";

import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { load as cocoSSDLoad } from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import { renderPredictions } from "@/utils/RenderPredictions";

let detectInterval;

const ObjectDetection = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasPermission, setHasPermission] = useState(false);

    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    async function requestCameraPermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            // Stop the stream immediately after getting permission
            stream.getTracks().forEach((track) => track.stop());
            setHasPermission(true);
        } catch (err) {
            console.error("Error accessing camera:", err);
        }
    }

    async function runCoco() {
        setIsLoading(true); // Set loading state to true when model loading starts
        const net = await cocoSSDLoad();
        setIsLoading(false); // Set loading state to false when model loading completes

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
            canvasRef.current.width = webcamRef.current.video.videoWidth;
            canvasRef.current.height = webcamRef.current.video.videoHeight;

            // find detected objects
            const detectedObjects = await net.detect(
                webcamRef.current.video,
                undefined,
                0.6
            );

            //   console.log(detectedObjects);

            const context = canvasRef.current.getContext("2d");
            renderPredictions(detectedObjects, context);
        }
    }

    const showmyVideo = () => {
        if (
            webcamRef.current !== null &&
            webcamRef.current.video?.readyState === 4
        ) {
            const myVideoWidth = webcamRef.current.video.videoWidth;
            const myVideoHeight = webcamRef.current.video.videoHeight;

            webcamRef.current.video.width = myVideoWidth;
            webcamRef.current.video.height = myVideoHeight;
        }
    };

    useEffect(() => {
        if (hasPermission) {
            runCoco();
            showmyVideo();
        }
    }, [hasPermission]);

    const videoConstraints = {
        facingMode: "environment", // Use rear camera by default
    };

    return (
        <div className="mt-8">
            {isLoading ? (
                <div className="gradient-text">Loading AI Model...</div>
            ) : (
                <div className="relative flex justify-center items-center gradient p-1.5 rounded-md">
                    {!hasPermission ? (
                        <button
                            onClick={requestCameraPermission}
                            className="btn"
                        >
                            Grant Camera Access
                        </button>
                    ) : (
                        <>
                            {/* webcam */}
                            <Webcam
                                ref={webcamRef}
                                className="rounded-md w-full lg:h-[720px]"
                                audio={false}
                                videoConstraints={videoConstraints}
                                onUserMediaError={(error) =>
                                    console.error("Webcam error:", error)
                                }
                                onUserMedia={() =>
                                    console.log("Webcam started")
                                }
                            />
                            {/* canvas */}
                            <canvas
                                ref={canvasRef}
                                className="absolute top-0 left-0 z-99999 w-full lg:h-[720px]"
                            />
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ObjectDetection;

"use client";
import React from "react";
import Camera from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";

function App(props) {
    function handleTakePhoto(dataUri) {
        // Do stuff with the photo...
        console.log("takePhoto");
    }

    return <Camera isFullscreen={true} />;
}

export default App;

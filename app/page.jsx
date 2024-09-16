import ObjectDetection from "@/components/ObjectDetection";

export const metadata = {
    openGraph: {
        images: [
            {
                url: "/open-graph.png",
                width: 1200,
                height: 630,
                alt: "Object Detection using Tensorflow.js",
            },
        ],
    },
};

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center p-8">
            <h1 className="gradient-title font-extrabold text-3xl md:text-6xl lg:text-8xl tracking-tighter md:px-6 text-center">
                Object Detection using TensorFlow.js + CocoSSD
            </h1>
            <ObjectDetection />
        </main>
    );
}

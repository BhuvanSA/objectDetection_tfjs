import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Object Detection",
    description: "Object Detection using Tensorflow.js",
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

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    );
}

import { FilesetResolver, PoseLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";

let poseLandmarker;
const video = document.getElementById("video");
const canvas = document.getElementById("output");
const ctx = canvas.getContext("2d");

async function loadPoseLandmarker() {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
            //https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task
            //https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task
            delegate: "GPU", // Ensure it runs on GPU for better performance
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task",
        },
        runningMode: "VIDEO",
        numPoses: 1
    });
}

async function setupCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            video.onloadedmetadata = async () => {
                resizeCanvas();
                await loadPoseLandmarker();
                processVideo();
            };
        });
}

// ✅ Ensure the canvas resizes dynamically when window resizes
window.addEventListener("resize", () => {
    resizeCanvas();
});

// ✅ Resize the canvas to match the video size
function resizeCanvas() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
}

async function processVideo() {
    if (!poseLandmarker) return;

    // Ensure the video has valid dimensions before processing
    if (video.videoWidth === 0 || video.videoHeight === 0) {
        requestAnimationFrame(processVideo);
        return;
    }

    resizeCanvas(); // Ensure canvas matches video dynamically

    const poses = poseLandmarker.detectForVideo(video, performance.now(),{
        imageWidth: video.videoWidth,
        imageHeight: video.videoHeight
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (poses.landmarks && poses.landmarks.length > 0) {
        ctx.fillStyle = "red";
        poses.landmarks[0].forEach(({ x, y }) => {
            ctx.beginPath();
            ctx.arc(x * canvas.width, y * canvas.height, 5, 0, 2 * Math.PI);
            ctx.fill();
        });

        // ✅ Send Pose Data to WebSocket.js
        if (window.createPoseData) {
            window.createPoseData(poses.landmarks[0]);
        }
    }

    requestAnimationFrame(processVideo);
}

// ✅ Auto-move between octets in IP address input
window.moveToNext = (current, nextId) => {
    if (current.value.length === 3) {
        document.getElementById(nextId)?.focus();
    }
}

setupCamera();

// ✅ Named Pose Landmarks for WebSocket Transmission
const LANDMARK_NAMES = [
    "nose", "left_eye_inner", "left_eye", "left_eye_outer",
    "right_eye_inner", "right_eye", "right_eye_outer",
    "left_ear", "right_ear", "mouth_left", "mouth_right",
    "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
    "left_wrist", "right_wrist", "left_pinky", "right_pinky",
    "left_index", "right_index", "left_thumb", "right_thumb",
    "left_hip", "right_hip", "left_knee", "right_knee",
    "left_ankle", "right_ankle", "left_heel", "right_heel",
    "left_foot_index", "right_foot_index"
];

let socket;

function connectToUnity() {
    const ip = `${document.getElementById("ip1").value}.${document.getElementById("ip2").value}.${document.getElementById("ip3").value}.${document.getElementById("ip4").value}`;
    const port = document.getElementById("port").value || "8081"; // Default to 8081 if empty
    const url = `ws://${ip}:${port}/PoseData`;

    console.log(`Attempting connection to ${url}`);

    socket = new WebSocket(url);

    socket.onopen = () => {
        console.log("✅ Connected to Unity WebSocket server!");
        updatePoseDisplayColor(true); // ✅ Set background to green
    };

    socket.onerror = (error) => {
        console.error("❌ WebSocket Error:", error);
    };

    socket.onmessage = (event) => {
        console.log("📩 Message from Unity:", event.data);
    };

    socket.onclose = () => {
        console.log("❌ WebSocket connection closed");
        updatePoseDisplayColor(false); // ✅ Set background back to black
    };
}

// ✅ Auto-move between octets in IP address input
function moveToNext(current, nextId) {
    if (current.value.length === 3) {
        document.getElementById(nextId)?.focus();
    }
}

// ✅ Receive Pose Data from `script.js` and Send via WebSocket
window.sendPoseDataToWebSocket = function (poseLandmarks) {
    const poseData = {};

    poseLandmarks.forEach((kp, index) => {
        poseData[LANDMARK_NAMES[index]] = {
            x: kp.x.toFixed(3),
            y: kp.y.toFixed(3),
            z: kp.z ? kp.z.toFixed(3) : "0.000",
            visible: kp.visibility ? kp.visibility.toFixed(2) : "0.00" // ✅ Include visibility score
        };
    });

    // ✅ Display pose data on-screen
    document.getElementById("poseDataDisplay").innerText = JSON.stringify(poseData, null, 2);

    var jsonPayload = JSON.stringify({ landmarks: poseData });

    if (socket && socket.readyState === WebSocket.OPEN) {
        // ✅ Send formatted pose data to Unity
        socket.send(jsonPayload);
    }
};

// ✅ Function to Update Pose Display Background Color
function updatePoseDisplayColor(isConnected) {
    const poseDataDisplay = document.getElementById("poseDataDisplay");
    if (poseDataDisplay) {
        poseDataDisplay.style.backgroundColor = isConnected ? "green" : "black";
    }
}

// Expose function globally for HTML button
window.connectToUnity = connectToUnity;
window.moveToNext = moveToNext;

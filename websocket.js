let socket;

function connectToUnity() {
    const ip = `${document.getElementById("ip1").value}.${document.getElementById("ip2").value}.${document.getElementById("ip3").value}.${document.getElementById("ip4").value}`;
    const port = document.getElementById("port").value || "8081"; // Default to 8081 if empty
    const url = `wss://${ip}:${port}/PoseData`;

    console.log(`Attempting connection to ${url}`);

    socket = new WebSocket(url);

    socket.onopen = () => {
        console.log("✅ Connected to Unity WebSocket server!");
        window.updatePoseDisplayColor(true); // ✅ Set background to green
    };

    socket.onerror = (error) => {
        console.error("❌ WebSocket Error:", error);
    };

    socket.onmessage = (event) => {
        console.log("📩 Message from Unity:", event.data);
    };

    socket.onclose = () => {
        console.log("❌ WebSocket connection closed");
        window.updatePoseDisplayColor(false); // ✅ Set background back to black
    };
}

// ✅ Auto-move between octets in IP address input
function moveToNext(current, nextId) {
    if (current.value.length === 3) {
        document.getElementById(nextId)?.focus();
    }
}

// ✅ Receive Pose Data from `script.js` and Send via WebSocket
window.sendPoseDataToWebSocket = function (poseData) {
    // ✅ Display pose data on-screen
    document.getElementById("poseDataDisplay").innerText = JSON.stringify(poseData, null, 2);

    var jsonPayload = JSON.stringify({ landmarks: poseData });

    if (socket && socket.readyState === WebSocket.OPEN) {
        // ✅ Send formatted pose data to Unity
        socket.send(jsonPayload);
    }
};

// Expose function globally for HTML button
window.connectToUnity = connectToUnity;
window.moveToNext = moveToNext;

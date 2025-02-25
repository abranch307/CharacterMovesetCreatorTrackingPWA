let socket;

function connectToUnity () {
    // Get wss url
    const url = `${getWssBaseUrl()}/PoseData`;

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

function getBaseUrl(portParam)
{
    const ip = `${document.getElementById("ip1").value}.${document.getElementById("ip2").value}.${document.getElementById("ip3").value}.${document.getElementById("ip4").value}`;
    const port = portParam || "8081"; // Default to 8081 if empty
    return `${ip}:${port}`;
}

function getHttpBaseUrl()
{
    return `http://${getBaseUrl(8082)}`;
}

function getWssBaseUrl()
{
    return `wss://${getBaseUrl(8081)}`;
}

// ✅ Auto-move between octets in IP address input
window.moveToNext = (current, nextId) => {
    if (current.value.length === 3) {
        document.getElementById(nextId)?.focus();
    }
}

// ✅ Receive Pose Data from `script.js` and Send via WebSocket
function sendPoseDataToWebSocket(poseData) {
    // ✅ Display pose data on-screen
    document.getElementById("poseDataDisplay").innerText = JSON.stringify(poseData, null, 2);

    var jsonPayload = JSON.stringify({ landmarks: poseData });

    if (socket && socket.readyState === WebSocket.OPEN) {
        // ✅ Send formatted pose data to Unity
        socket.send(jsonPayload);
    }
};

async function downloadCertificate() {
    let certURL = `${getHttpBaseUrl()}/cert`;

    window.open(certURL, "_blank");
    
    console.log("✅ Redirecting to certificate download:", certURL);
}


window.connectToUnity = connectToUnity;
window.downloadCertificate = downloadCertificate;
window.sendPoseDataToWebSocket = sendPoseDataToWebSocket;
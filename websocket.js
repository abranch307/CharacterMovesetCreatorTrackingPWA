let socket;

async function requestLocalNetworkAccess() {
    try {
        // ✅ Make a simple request to a local device (your Unity game)
        const response = await fetch(`${getHttpBaseUrl(8082)}`, { mode: "no-cors" });

        console.log("📡 Local network request sent:", response);
    } catch (error) {
        console.warn("⚠️ Local network request failed (this is normal):", error);
    }
}

async function connectToUnity () {
    // ✅ Require user interaction (iOS restriction workaround)
    alert("Press OK to allow local network access.");
    
    await requestLocalNetworkAccess(); // 🟢 Ensures iOS prompts for Local Network

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

function getHttpBaseUrl(portParam)
{
    return `http://${getBaseUrl(portParam)}`;
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
    let certURL = `${getHttpBaseUrl(8082)}/cert`;

    window.open(certURL, "_blank");
    
    console.log("✅ Redirecting to certificate download:", certURL);
}


window.connectToUnity = connectToUnity;
window.downloadCertificate = downloadCertificate;
window.sendPoseDataToWebSocket = sendPoseDataToWebSocket;
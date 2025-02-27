let dataChannel;
let peerConnection;
let sentCandidates = new Set(); // ✅ Track sent ICE candidates to avoid duplicates
let isWebRTCStarted = false;

const port = 8081;

function getSignalingServerUrl()
{
    return `http://${getBaseUrl(port)}/signal/`;
    //return `https://${getBaseUrl(port)}/signal/`;
}

function getBaseUrl(portParam)
{
    const ip = `${document.getElementById("ip1").value}.${document.getElementById("ip2").value}.${document.getElementById("ip3").value}.${document.getElementById("ip4").value}`;
    const port = portParam || "8081"; // Default to 8081 if empty
    return `${ip}:${port}`;
}

async function startWebRTC() {
    // if(isWebRTCStarted) {
    //     console.warn("⚠️ WebRTC already started, ignoring duplicate call...");
    //     return;
    // }

    isWebRTCStarted = true; // ✅ Prevent multiple calls
    console.log("📡 Starting WebRTC Connection...");
    let signalingServer = getSignalingServerUrl();

    console.log("📡 Signaling Server:", signalingServer);

    // ✅ Create PeerConnection WITHOUT ICE Servers
    peerConnection = new RTCPeerConnection({ iceServers: [] });

    // ✅ Create Ordered DataChannel
    const dataChannelConfig = {
        ordered: true, // ✅ Ensure Ordered Data Transmission
        maxRetransmits: -1 // ✅ No Retransmit Limit (Ensures Reliability)
    };
    dataChannel = peerConnection.createDataChannel("poseData", dataChannelConfig);
    dataChannel.onopen = () => 
    {
        console.log("✅ Data Channel Open");
        window.updatePoseDisplayColor(true); // ✅ Set background to green
    };
    dataChannel.onmessage = event => console.log("📩 Received in data channel:", event.data);
    dataChannel.onclose = () => {
        console.error("❌ DataChannel Closed! Reconnecting...");
        window.updatePoseDisplayColor(false); // ✅ Set background back to black
    };
    

    // ✅ Listen for ICE Candidates
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            const candidateData = {
                candidate: event.candidate.candidate,
                sdpMid: event.candidate.sdpMid || "0",  // ✅ Ensure `sdpMid` is present
                sdpMLineIndex: event.candidate.sdpMLineIndex ?? 0 // ✅ Default to 0 if null
            };

            console.log("🔹 Sending ICE Candidate:", candidateData);
            fetch(signalingServer, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(candidateData)
            }).catch(err => console.error("❌ Failed to send ICE Candidate:", err));
        };
    };

    try {
        // ✅ Create SDP Offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        // // ✅ Send Offer to Signaling Server as JSON
        console.log("📡 Sending SDP Offer...");

        const offerPayload = JSON.stringify({ type: "offer", sdp: peerConnection.localDescription.sdp });
        console.log("📡 SDP Offer pre-normalized:", offerPayload);

        // ✅ Normalize line breaks before sending the SDP
        let normalizedSdp = offer.sdp.replace(/\r\n/g, "\n");
        console.log("📡 SDP Offer post-normalized:", normalizedSdp);

        const response = await fetch(signalingServer, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "offer", sdp: normalizedSdp })
        });

        const answerJson = await response.json(); // ✅ Wait for SDP Answer in Callback

        if (!answerJson.sdp) {
            console.error("❌ Invalid SDP Answer received:", answerJson);
            return;
        }

        console.log("📡 Received SDP Answer:", answerJson.sdp);
        const answerDesc = new RTCSessionDescription({ type: "answer", sdp: answerJson.sdp });

        await peerConnection.setRemoteDescription(answerDesc);
        console.log("✅ SDP Answer successfully applied!");
    } catch (err) {
        console.error("❌ Failed to send SDP Offer:", err);
    }
}

// ✅ Send Pose Data Over WebRTC
function sendPoseData(poseData) {
    // if (!dataChannel) {
    //     console.warn("❌ Data channel is not initialized yet.");
    //     return;
    // }

    // ✅ Display pose data on-screen
    document.getElementById("poseDataDisplay").innerText = JSON.stringify(poseData, null, 2);

    var jsonPayload = JSON.stringify({ landmarks: poseData });

    if (dataChannel && dataChannel.readyState === "open") {
        dataChannel.send(JSON.stringify(jsonPayload));
    }
}

setInterval(() => {
    if (dataChannel.readyState === "open") {
        dataChannel.send("ping");
        console.log("📡 Sent Keep-Alive Ping");
    }
}, 5000); // Send every 5 seconds


// ✅ Attach to Button Click
document.getElementById("connectButton").addEventListener("click", startWebRTC);

window.sendPoseDataOverWebRTC = sendPoseData;

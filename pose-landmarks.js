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

window.createPoseData = (poseLandmarks) => 
{
    const poseData = {};

    poseLandmarks.forEach((kp, index) => {
        var rotations = getLandmarkRotations(poseLandmarks, LANDMARK_NAMES[index]);
        poseData[LANDMARK_NAMES[index]] = {
            xPosition: kp.x.toFixed(3),
            yPosition: kp.y.toFixed(3),
            zPosition: kp.z ? kp.z.toFixed(3) : "0.000",
            xRotation: rotations?.xRotation ? rotations.xRotation.toFixed(3) : "0.000",    
            yRotation: rotations?.yRotation ? rotations.yRotation.toFixed(3) : "0.000",
            zRotation: rotations?.zRotation ? rotations.zRotation.toFixed(3) : "0.000",
            visible: kp.visibility ? kp.visibility.toFixed(2) : "0.00" // ✅ Include visibility score
        };
    });

    //window.sendPoseDataToWebSocket(poseData);
    window.sendPoseDataOverWebRTC(poseData);
}

// ✅ Function to Update Pose Display Background Color
window.updatePoseDisplayColor = (isConnected) => {
    const poseDataDisplay = document.getElementById("poseDataDisplay");
    if (poseDataDisplay) {
        poseDataDisplay.style.backgroundColor = isConnected ? "green" : "black";
    }
}

function getVector(p1, p2) {
    return {
        x: p2.x - p1.x,
        y: p2.y - p1.y,
        z: (p2.z || 0) - (p1.z || 0)
    };
}

function getRotation(fromVec, toVec) {
    let angleX = Math.atan2(toVec.y, toVec.z) * (180 / Math.PI);
    let angleY = Math.atan2(toVec.z, toVec.x) * (180 / Math.PI);
    let angleZ = Math.atan2(toVec.y, toVec.x) * (180 / Math.PI);

    // ✅ Normalize rotation between 0 and 1
    function normalize(angle) {
        return (angle + 180) / 360;
    }

    return {
        xRotation: normalize(angleX),
        yRotation: normalize(angleY),
        zRotation: normalize(angleZ)
    };
}

function getLandmarkRotations(poseLandmarks, landmarkName) {
    switch (landmarkName) {
        case "nose":
            if (poseLandmarks[11] && poseLandmarks[12] && poseLandmarks[0]) { // shoulders and nose
                let shoulderMid = {
                    x: (poseLandmarks[11].x + poseLandmarks[12].x) / 2,
                    y: (poseLandmarks[11].y + poseLandmarks[12].y) / 2,
                    z: (poseLandmarks[11].z + poseLandmarks[12].z) / 2
                };
                let headDirection = getVector(shoulderMid, poseLandmarks[0]);
                return getRotation({ x: 0, y: 1, z: 0 }, headDirection);
            }
            break;

        case "left_shoulder":
        case "right_shoulder":
            let hipIndex = landmarkName === "left_shoulder" ? 23 : 24;
            let oppositeShoulder = landmarkName === "left_shoulder" ? 12 : 11;
            if (poseLandmarks[hipIndex] && poseLandmarks[oppositeShoulder] && poseLandmarks[LANDMARK_NAMES.indexOf(landmarkName)]) {
                let shoulderVec = getVector(poseLandmarks[hipIndex], poseLandmarks[LANDMARK_NAMES.indexOf(landmarkName)]);
                return getRotation({ x: 0, y: 1, z: 0 }, shoulderVec);
            }
            break;

        case "left_elbow":
        case "right_elbow":
            let wristIndex = landmarkName === "left_elbow" ? 15 : 16;
            let shoulderIndex = landmarkName === "left_elbow" ? 11 : 12;
            if (poseLandmarks[wristIndex] && poseLandmarks[shoulderIndex] && poseLandmarks[LANDMARK_NAMES.indexOf(landmarkName)]) {
                let elbowVec = getVector(poseLandmarks[shoulderIndex], poseLandmarks[LANDMARK_NAMES.indexOf(landmarkName)]);
                return getRotation({ x: 0, y: 1, z: 0 }, elbowVec);
            }
            break;

        case "left_wrist":
        case "right_wrist":
            let elbowIndex = landmarkName === "left_wrist" ? 13 : 14;
            if (poseLandmarks[elbowIndex] && poseLandmarks[LANDMARK_NAMES.indexOf(landmarkName)]) {
                let wristVec = getVector(poseLandmarks[elbowIndex], poseLandmarks[LANDMARK_NAMES.indexOf(landmarkName)]);
                return getRotation({ x: 0, y: 1, z: 0 }, wristVec);
            }
            break;

        case "left_hip":
        case "right_hip":
            let kneeIndex = landmarkName === "left_hip" ? 25 : 26;
            if (poseLandmarks[kneeIndex] && poseLandmarks[LANDMARK_NAMES.indexOf(landmarkName)]) {
                let hipVec = getVector(poseLandmarks[kneeIndex], poseLandmarks[LANDMARK_NAMES.indexOf(landmarkName)]);
                return getRotation({ x: 0, y: 1, z: 0 }, hipVec);
            }
            break;

        case "left_knee":
        case "right_knee":
            let ankleIndex = landmarkName === "left_knee" ? 27 : 28;
            let hipIdx = landmarkName === "left_knee" ? 23 : 24;
            if (poseLandmarks[ankleIndex] && poseLandmarks[hipIdx] && poseLandmarks[LANDMARK_NAMES.indexOf(landmarkName)]) {
                let kneeVec = getVector(poseLandmarks[hipIdx], poseLandmarks[LANDMARK_NAMES.indexOf(landmarkName)]);
                return getRotation({ x: 0, y: 1, z: 0 }, kneeVec);
            }
            break;

        case "left_ankle":
        case "right_ankle":
            let footIndex = landmarkName === "left_ankle" ? 31 : 32;
            let kneeIdx = landmarkName === "left_ankle" ? 25 : 26;
            if (poseLandmarks[footIndex] && poseLandmarks[kneeIdx] && poseLandmarks[LANDMARK_NAMES.indexOf(landmarkName)]) {
                let ankleVec = getVector(poseLandmarks[kneeIdx], poseLandmarks[LANDMARK_NAMES.indexOf(landmarkName)]);
                return getRotation({ x: 0, y: 1, z: 0 }, ankleVec);
            }
            break;

        default:
            return null;
    }
}

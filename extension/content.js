let recorder = null;
let videoChunks = [];
let eventsLog = [];
let isRecording = false;
let combinedStream = null;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === "INITIATE_RECORDING") {
    startCapture();
    sendResponse({ status: "started" });
  } else if (message.command === "TERMINATE_RECORDING") {
    stopCapture();
    sendResponse({ status: "stopped" });
  }
  return true;
});
async function startCapture() {
  try {
    console.log("📷 Requesting permissions...");
    //geting screen
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: { mediaSource: "screen" },
      audio: false
    });
    //getting mic 
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });

    //combining audio and video in a single stream
    combinedStream = new MediaStream([
      ...screenStream.getVideoTracks(),
      ...audioStream.getAudioTracks()
    ]);
    recorder = new MediaRecorder(combinedStream, { mimeType: "video/webm; codecs=vp9" });
    videoChunks = [];
    eventsLog = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) videoChunks.push(e.data);
    };
    //handling "stop sharing" ui btn
    screenStream.getVideoTracks()[0].onended = () => stopCapture();
    recorder.start();
    isRecording = true;
    document.addEventListener("click", logUserClick, true);
    console.log("✅ Recording Started");
  } catch (err) {
    console.error("❌ Error starting capture:", err);
    alert("Permission Error: " + err.message);
  }
}
//function to log user event(clicks)
function logUserClick(event) {
  if (!isRecording) return;
  eventsLog.push({
    timestamp: new Date().toISOString(),
    x: event.clientX,
    y: event.clientY,
    tagName: event.target.tagName,
    text: (event.target.innerText || "").substring(0, 50).trim(),
    url: window.location.href
  });
}
//function to stop recording
function stopCapture() {
  if (!recorder || !isRecording) return;
  isRecording = false;
  recorder.stop();
  document.removeEventListener("click", logUserClick, true);
  combinedStream.getTracks().forEach(track => track.stop());
  console.log("Recording Stopped. Processing...");
  //small delay to ensure last chunk is pushed
  setTimeout(uploadData, 500);
}

async function uploadData() {
  console.log("Preparing Upload...");
  const blob = new Blob(videoChunks, { type: "video/webm" });
  console.log(`Video Size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
  if (blob.size === 0) {
    alert("Error: Recorded video is empty!");
    return;
  }
  const formData = new FormData();
  formData.append("video", blob, "recording.webm");
  formData.append("steps", JSON.stringify(eventsLog));
  try {
    const res = await fetch("http://localhost:3001/api/guides/upload", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    if (res.ok) {
      console.log("Upload Success:", data);
      alert("Guide Uploaded Successfully!");
    } else {
      console.error("Server Error:", data);
      alert("Upload Failed: " + data.message);
    }
  } catch (err) {
    console.error("Network Error:", err);
    alert("Network Error: Is backend running on 3001?");
  }
}
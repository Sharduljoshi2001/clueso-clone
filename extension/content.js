let recorder = null; //MediaRecorder instance
let videoChunks = [];
let eventsLog = []; //click or any kind ov event performed by the user will bhe stored in this list
let isRecording = false; // is recording on / off bool flag
//listening to popup.js command
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  //if command is INITIATE_RECORDING
  if (message.command === "INITIATE_RECORDING") {
    console.log("recording started...");
    startCapture();
    sendResponse({ status: "success" });
    //if command is TERMINATE_RECORDING
  } else if (message.command === "TERMINATE_RECORDING") {
    console.log("stop recording");
    stopCapture();
    sendResponse({ status: "success" });
  }
  return true;
});
//startCapture function to start recording
async function startCapture() {
  try {
    //getting media screen from the browser(share screen popup comes up)
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { mediaSource: "screen" },
      audio: true, //for mic permission
    });
    //storage for stream data packets
    videoChunks = [];
    eventsLog = [];
    //setting up the recrder
    recorder = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp9",
    });
    //storing new data packets(video chunks)
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        videoChunks.push(event.data);
      }
    };
    // starting the recorder
    recorder.start();
    isRecording = true;
    //listening to the clicks(any events)
    document.addEventListener("click", logUserClick, true);
  } catch (error) {
    console.error("permission denied or error:", error);
  }
}
//tracking user events
function logUserClick(event) {
  //ignoring log events if the recording is off
  if (!isRecording) return;
  //getting targeted element(element ehich is being clicked)
  const target = event.target;
  //storning the event info in an object
  const clickData = {
    timestamp: new Date().toISOString(), // converting current time to string for db consistency
    x: event.clientX,
    y: event.clientY,
    tagName: target.tagName,
    //taking only 50 characters from tags text
    text: target.innerText
      ? target.innerText.substring(0, 50).trim()
      : "No Text",
    url: window.location.href,
  };

  console.log("Step Logged:", clickData);
  eventsLog.push(clickData);
}
//stop capture function to stop recording
function stopCapture() {
  if (recorder && isRecording) {
    recorder.stop();
    isRecording = false;
    //closing listening to clicks(or any event) (Cleanup is important for memory)
    document.removeEventListener("click", logUserClick, true);
    //
    recorder.stream.getTracks().forEach((track) => track.stop());
    //waiting for the file generation(can take milisecons that's why settimeout is used)
    setTimeout(() => {
      const blob = new Blob(videoChunks, { type: "video/webm" });
      const videoUrl = URL.createObjectURL(blob);
      console.log("✅ Recording Finished!");
      console.log("📹 Video URL:", videoUrl);
      console.log("📜 Steps Collected:", eventsLog);
      //downloading the captured video(due to chromes CSP concerns link is not working)
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = videoUrl;
      a.download = "test-recording.webm"; // File ka naam
      document.body.appendChild(a);
      a.click(); // Auto-click trigger
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(videoUrl);
      }, 100);
      
      console.log("⬇️ Video Download Triggered!");

      // TODO: Yahan hum baad mein Backend API call karenge
    }, 500);
  }
}

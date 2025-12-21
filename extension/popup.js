document.addEventListener("DOMContentLoaded", () => {
  //selecting DOM elements
  const initBtn = document.getElementById("triggerRecordBtn");
  const termBtn = document.getElementById("finishRecordBtn");
  const idlePanel = document.getElementById("initialControlPanel");
  const activePanel = document.getElementById("activeControlPanel");
  //current state load
  chrome.storage.local.get("recordingStatus", (data) => {
    if (data.recordingStatus) {
      //change the state and show stop button
      userInterfaceState(true);
    } else {
      //change the state and show start button
      userInterfaceState(false);
    }
  });
  //when the recoeding is active
  initBtn.addEventListener("click", () => {
    //find active tabs
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        return;
      }
      chrome.tabs.sendMessage(
        tabs[0].id,
        { command: "INITIATE_RECORDING" },
        (response) => {
          //handling error(if script didn't run)
          if (chrome.runtime.lastError) {
            alert("can not record this page");
          }
        }
      );
      //if everything works well updating the ui
      userInterfaceState(true);
      chrome.storage.local.set({ recordingStatus: true });
    });
  });
  //when the recording is finished
  termBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      //handling error(if script didn't run)
      if (tabs.length === 0) {
        return;
      }
      chrome.tabs.sendMessage(
        tabs[0].id,
        { command: "TERMINATE_RECORDING" },
        (response) => {
          if (chrome.runtime.lastError) {
            alert("can not record this page");
          }
        }
      );
      //updating the ui
      userInterfaceState(false);
      chrome.storage.local.set({ recordingStatus: false });
    });
  });
  //helper function for switchinf user interface state
  function userInterfaceState(isRecording) {
    if (isRecording) {
      //hiding blue btn and shoeing red btn
      idlePanel.classList.add("display-none");
      activePanel.classList.remove("display-none");
    } else {
      //hiding red btn and showing blue btn
      idlePanel.classList.remove("display-none");
      activePanel.classList.add("display-none");
    }
  }
});

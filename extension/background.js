//background service worker for clueso clone
//listening for the installation events
chrome.runtime.onInstalled.addListener(()=>{
    console.log('clueso clone extension:  service worker installed and state reset done');
    //clearing local storage for current session(sothe garbage values are removed)
    chrome.storage.local.set({isRecording:false});
})
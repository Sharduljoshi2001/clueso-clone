const Guide = require("../models/Guide");
const cloudinary = require("../config/cloudinary");
const mediaService = require("./mediaService");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
//initializing gemini for the insights feature
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//helper function to upload file path to cloudinary
//added timeout because large video files were failing
const uploadToCloudinary = (filePath, resourceType) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath, 
      { 
        resource_type: resourceType, 
        folder: "clueso_guides",
        timeout: 120000 //2 minutes timeout for stability
      }, 
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
  });
};
//main service function handling the full pipeline
exports.createGuide = async (file, stepsData) => {
  const originalVideoPath = file.path;
  //tracking all temp files to delete them later
  let tempFiles = [originalVideoPath]; 
  //defaulting to original video if ai processing fails
  let finalUploadPath = originalVideoPath; 
  let aiScript = "No AI processing done.";
  try {
    console.log("service layer: processing video file at", originalVideoPath);
    //STEP 1: EXTRACT AUDIO
    //creating a local mp3 file from the uploaded webm
    const rawAudioPath = await mediaService.extractAudio(originalVideoPath);
    tempFiles.push(rawAudioPath);
    //STEP 2: AI TRANSCRIPTION & VOICEOVER (FREE STACK)
    try {
        //getting raw text using deepgram (free tier)
        const rawText = await mediaService.transcribeAudio(rawAudioPath);
        console.log("raw transcript:", rawText);
        if (rawText && rawText.length > 5) {
            //refining text using gemini flash (free tier)
            aiScript = await mediaService.generateRefinedScript(rawText);
            console.log("refined script:", aiScript);

            //generating ai audio file using google tts
            const aiAudioPath = await mediaService.generateAIVoice(aiScript, originalVideoPath);
            tempFiles.push(aiAudioPath);

            //merging new ai audio with the original video stream
            const finalVideoPath = await mediaService.mergeAudioToVideo(originalVideoPath, aiAudioPath);
            tempFiles.push(finalVideoPath);
            
            //updating the upload path to the new processed video
            finalUploadPath = finalVideoPath;
            console.log("media processing success: switching to ai video");
        } else {
            console.log("audio too short or silent, skipping ai generation");
        }
    } catch (aiError) {
        console.error("ai pipeline warning: failed, using original video", aiError);
    }
    //STEP 3: UPLOAD TO CLOUDINARY
    console.log("service layer: uploading final video to Cloudinary...");
    const uploadResult = await uploadToCloudinary(finalUploadPath, "video");
    //STEP 4: SAVE TO DB
    console.log("service layer: saving to MongoDB...");
    const newGuide = await Guide.create({
      videoUrl: uploadResult.secure_url,
      steps: JSON.parse(stepsData),
      title: `Guide created at ${new Date().toLocaleString()}`,
      //saving the script in summary field for reference
      summary: aiScript 
    });
    return newGuide;
  } catch (error) {
    console.error("Guide Creation Failed:", error);
    throw error;
  } finally {
    //STEP 5: CLEANUP
    //looping through all temp files and deleting them to save disk space
    console.log("service layer: cleaning up temp files...");
    tempFiles.forEach(path => {
        try {
            if (fs.existsSync(path)) fs.unlinkSync(path);
        } catch (e) {
            //ignoring cleanup errors to prevent crash
        }
    });
  }
};
//generating insights using gemini (replacing the old mock function)
exports.generateAIInsights = async (guideId) => {
  const guide = await Guide.findById(guideId);
  if (!guide) throw new Error("Guide not found");
  console.log("generating insights with gemini...");
  //preparing prompt for gemini
  const prompt = `
    Analyze these user actions on a website and generate a Title and a Summary.
    Url: ${guide.steps[0]?.url || 'Web App'}
    Steps: ${JSON.stringify(guide.steps.map(s => s.text || s.tagName).slice(0, 15))}
    
    Return ONLY a JSON object like this: {"title": "...", "summary": "..."}
    Do not use markdown code blocks.
  `;
  try {
      //using gemini 1.5 flash model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();   
      //cleaning up markdown if gemini adds it
      text = text.replace(/```json/g, '').replace(/```/g, '');
      const jsonResponse = JSON.parse(text);
      return jsonResponse;
  } catch (error) {
      console.error("gemini insights failed:", error);
      //fallback if api fails
      return {
          title: "Workflow Guide",
          summary: "Automated guide created with Clueso Clone."
      };
  }
};
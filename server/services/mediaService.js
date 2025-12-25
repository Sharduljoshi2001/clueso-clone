const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { createClient } = require("@deepgram/sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const googleTTS = require('google-tts-api');
const axios = require('axios');
//setting up deepgram client for transcription
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
//setting up gemini for text refinement
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//function to extract audio from video file
//input: path to webm video | output: path to mp3 audio
exports.extractAudio = (videoPath) => {
    return new Promise((resolve, reject) => {
        //changing extension from .webm to .mp3
        const outputAudioPath = videoPath.replace(path.extname(videoPath), '.mp3');
        console.log("media service: starting audio extraction...");
        ffmpeg(videoPath)
            .toFormat('mp3')
            .on('end', () => resolve(outputAudioPath))
            .on('error', (err) => reject(err))
            .save(outputAudioPath);
    });
};
//function to convert audio to text using deepgram (free tier)
exports.transcribeAudio = async (audioPath) => {
    console.log("media service: transcribing with deepgram...");
    try {
        //reading the audio file from disk
        const audioFile = fs.readFileSync(audioPath);        
        //sending to deepgram nova-2 model for better accuracy
        const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
            audioFile,
            {
                model: "nova-2",
                smart_format: true,
                mimetype: "audio/mp3",
            }
        );
        if (error) throw error;
        //extracting the transcript string from response
        const transcript = result.results.channels[0].alternatives[0].transcript;
        return transcript;
    } catch (error) {
        console.error("deepgram error:", error);
        throw error;
    }
};
//function to polish the raw transcript using gemini
exports.generateRefinedScript = async (rawText) => {
    console.log("media service: refining script with gemini...");
    try {
        //creating a prompt to make the script professional and short
        const prompt = `You are a professional technical writer. Rewrite the following screen recording transcript into a clear, concise, first-person tutorial script. Remove filler words (um, uh). Keep it under 3 sentences if possible. Raw Text: "${rawText}"`;     
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const refinedText = response.text();
        return refinedText;
    } catch (error) {
        console.error("gemini error:", error);
        //fallback: return original text if gemini fails
        return rawText;
    }
};
//function to generate ai voice using google tts (free)
exports.generateAIVoice = async (text, originalVideoPath) => {
    console.log("media service: generating voice with google tts...");
    try {
        //getting audio url from google translate api
        //taking first 200 chars because free api splits long text
        const url = googleTTS.getAudioUrl(text.substring(0, 200), {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com',
        });

        const aiAudioPath = originalVideoPath.replace(path.extname(originalVideoPath), '-ai.mp3');
        //downloading the mp3 stream
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        });
        //saving the file locally
        const writer = fs.createWriteStream(aiAudioPath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(aiAudioPath));
            writer.on('error', reject);
        });

    } catch (error) {
        console.error("tts failed:", error);
        throw error;
    }
};
//merging the new ai audio with the original video
exports.mergeAudioToVideo = (videoPath, audioPath) => {
    return new Promise((resolve, reject) => {
        const finalVideoPath = videoPath.replace(path.extname(videoPath), '-final.mp4');
        console.log("media service: merging audio to video...");

        ffmpeg()
            .input(videoPath)
            .input(audioPath)
            .outputOptions([
                '-map 0:v:0', //taking video from input 0
                '-map 1:a:0', //taking audio from input 1
                '-c:v copy',  //copying video stream directly (fast)
                '-shortest'   //cutting video to match audio length
            ])
            .on('end', () => resolve(finalVideoPath))
            .on('error', (err) => reject(err))
            .save(finalVideoPath);
    });
};
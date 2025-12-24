const Guide = require('../models/Guide');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier'); //to convert buffer into video stream
//helper function for uploading video in cloudinary 
const uploadToCloudinary = async(fileBuffer)=>{
    //wrapping cloudinary's callback-based stream in a promise to use async/await
    return new Promise((resolve,reject)=>{
        const uploadStream = cloudinary.uploader.upload_stream({
            resource_type:'video',
            folder:'clueso_guides',//cloudinary folder
        },
        (error,result)=>{
            if(error) reject(error);
            else resolve(result);
        }    
    );
    //converting file buffer to readable stream and feedng it to upload stream
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    })
};
//main service function to handle video upload and database entry
exports.createGuide = async (file, stepsData) => {
    //step 1:uploading the video file to cloudinary
    console.log("service layer: uploading video to Cloudinary...");
    const uploadResult = await uploadToCloudinary(file.buffer);
    //step 2:saving metadata and video url to mongodb
    console.log("service layer: saving to MongoDB...");
    const newGuide = await Guide.create({
        videoUrl: uploadResult.secure_url, // getting the hosted url from cloudinary
        steps: JSON.parse(stepsData), // converting stringified steps data back to json object
        title: `Guide created at ${new Date().toLocaleString()}`
    });
    return newGuide;
};

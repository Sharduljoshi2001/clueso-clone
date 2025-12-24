const guideService = require("../services/guideService");
//function to receive request and send response for uploading the video
exports.uploadGuide = async (req, res) => {
  try {
    //validating the data ccoming from extension
    if (!req.file) {
      return res.status(400).json({
        error: "no video file uploaded",
      });
    }
    if (!req.body.steps) {
      return res.status(400).json({
        error: "No steps data provided",
      })
    }
    //calling service laye for actual upload process
    const guide = await guideService.createGuide(req.file, req.body.steps);
    res.status(201).json({
        message:"guide creation successful",
        guideId:guide.id,
        videoUrl:guide.videoUrl
    })
  } catch (error) {
    console.log('controller error')
    res.status(500).json({
        message:'internal server error', 
        details:error.message
    });
  }
};


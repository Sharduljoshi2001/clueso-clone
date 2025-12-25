const guideService = require("../services/guideService");
const Guide = require("../models/Guide");
//function to receive request and send response for uploading the video
exports.uploadGuide = async (req, res) => {
  try {
    //validating the data coming from extension
    if (!req.file) {
      return res.status(400).json({ error: "no video file uploaded" });
    }
    if (!req.body.steps) {
      return res.status(400).json({ error: "No steps data provided" });
    }
    //calling service layer for actual upload process
    const guide = await guideService.createGuide(req.file, req.body.steps);
    res.status(201).json({
      message: "guide creation successful",
      guideId: guide.id,
      videoUrl: guide.videoUrl,
    });
  } catch (error) {
    console.log("controller error", error);
    res.status(500).json({
      message: "internal server error",
      details: error.message,
    });
  }
};
//function to get all guides for dashboard
exports.getAllGuides = async (req, res) => {
  try {
    //finding all guides and sorting by latest first
    const guides = await Guide.find().sort({ createdAt: -1 });
    res.status(200).json(guides);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "failed to fetch guides" });
  }
};
//function to get single guide for viewer
exports.getGuideById = async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id);
    if (!guide) return res.status(404).json({ error: "guide not found" });
    res.status(200).json(guide);
  } catch (error) {
    console.error("Fetch single error:", error);
    res.status(500).json({ error: "failed to fetch guide" });
  }
};
//new controller for ai generation
exports.generateAI = async (req, res) => {
    try {
        console.log("Controller: Requesting AI for Guide ID:", req.params.id);
        const insights = await guideService.generateAIInsights(req.params.id);
        //update the guide in db with new title(i implemented this as optional feature)
        await Guide.findByIdAndUpdate(req.params.id, { title: insights.title });
        res.status(200).json(insights);
    } catch (error) {
        console.error("AI Controller Error:", error);
        res.status(500).json({ error: "Failed to generate AI insights" });
    }
};
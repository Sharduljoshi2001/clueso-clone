import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const GuideView = () => {
  const { id } = useParams(); //getting guide id from url
  const [guide, setGuide] = useState(null); //storage for current guide data
  const [isAnalyzing, setIsAnalyzing] = useState(false); //loader state
  const [aiSummary, setAiSummary] = useState(null); //storage for ai result

  //reference to the video player to control playback
  const playerRef = useRef(null);

  //fetching single guide details when page loads
  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/guides/${id}`);
        setGuide(res.data);
      } catch (error) {
        console.error("error fetching guide:", error);
      }
    };
    fetchGuide();
  }, [id]);

  //function to call real backend api for ai analysis
  const generateAiInsights = async () => {
    setIsAnalyzing(true);
    try {
      //hitting our new backend route
      const res = await axios.post(
        `http://localhost:3001/api/guides/${id}/analyze`
      );
      setAiSummary(res.data); //setting the title and summary returned by gemini
    } catch (error) {
      console.error("ai generation failed:", error);
      alert("Failed to generate AI insights. Check console for details.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  //function to jump video to specific timestamp when step is clicked
  const handleStepClick = (stepTimestamp) => {
    if (!playerRef.current || !guide.steps.length) return;
    
    //calculating the time difference between the first step (start) and clicked step
    const startTime = new Date(guide.steps[0].timestamp).getTime();
    const clickTime = new Date(stepTimestamp).getTime();
    
    //converting milliseconds to seconds for html5 video player
    let seekTime = (clickTime - startTime) / 1000;
    
    //ensuring we don't seek to negative time
    if (seekTime < 0) seekTime = 0;
    
    //jumping the video to that second
    playerRef.current.currentTime = seekTime;
    playerRef.current.play();
  };

  if (!guide) return <div className="p-10">Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      {/*left side: video player area*/}
      <div className="flex-1 p-6 flex flex-col items-center bg-black overflow-y-auto">
        
        {/*video container*/}
        <div className="w-full max-w-4xl aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-2xl mb-6 border border-gray-700">
          <video
            ref={playerRef} //attaching ref to control video programmatically
            src={guide.videoUrl}
            className="w-full h-full object-contain"
            controls
            autoPlay
            muted //IMPORTANT: browser blocks autoplay if not muted
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/*ai insights section*/}
        <div className="w-full max-w-4xl bg-gray-800 rounded-xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              {/*showing ai title if generated, else showing default title*/}
              <h1 className="text-2xl font-bold mb-2">
                {aiSummary
                  ? aiSummary.title
                  : guide.title || "Untitled Recording"}
              </h1>
              <p className="text-gray-400">
                {aiSummary
                  ? aiSummary.summary
                  : "Click the button to generate AI summary for this workflow."}
              </p>
            </div>

            {/*ai trigger button*/}
            <button
              onClick={generateAiInsights}
              disabled={isAnalyzing || aiSummary}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                aiSummary
                  ? "bg-green-600 text-white cursor-default"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              {isAnalyzing
                ? "Analyzing..."
                : aiSummary
                ? "✨ Analysis Complete"
                : "✨ Generate AI Insights"}
            </button>
          </div>
        </div>
      </div>

      {/*right side: step by step list*/}
      <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto shrink-0">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Workflow Steps</h2>
          <p className="text-sm text-gray-500 mt-1">
            {guide.steps.length} steps recorded
          </p>
        </div>

        <div className="p-4 space-y-4">
          {guide.steps.map((step, index) => (
            //added onclick event to seek video
            <div
              key={index}
              onClick={() => handleStepClick(step.timestamp)}
              className="flex gap-4 p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer group border border-transparent hover:border-blue-200"
            >
              {/*step number bubble*/}
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold text-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {index + 1}
              </div>

              {/*step details*/}
              <div>
                <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">
                  Clicked on{" "}
                  <span className="text-blue-600 font-mono text-xs bg-blue-50 px-1 rounded">
                    {step.tagName}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  "{step.text}"
                </p>
                {/*visual hint for interactivity*/}
                <p className="text-[10px] text-blue-400 mt-2 opacity-0 group-hover:opacity-100 font-medium">
                  ▶ Jump to video
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuideView;
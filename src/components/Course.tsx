import type React from "react"
import { useState, useEffect } from "react"
import { Lock, BookOpen } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import VideoPlayer from "@/components/CourseVideoPlayer"
// import TestComponent from "@/components/TestComponent"

interface JourneyPoint {
  id: number
  label: string
  x: number
  y: number
  videoUrls?: string[]
  direction: "right" | "left"
  isTest?: boolean
}

const journeyPoints: JourneyPoint[] = [
  {
    id: 1,
    label: "Initiate",
    x: 10,
    y: 15,
    direction: "right",
    videoUrls: [
      "https://pixabay.com/videos/download/video-32976_tiny.mp4", // Star 1
      "https://pixabay.com/videos/download/video-31377_tiny.mp4", // Star 2
      "https://pixabay.com/videos/download/video-5608_tiny.mp4", // Star 3
    ],
  },
  {
    id: 2,
    label: "Data Upload",
    x: 90,
    y: 30,
    direction: "left",
    videoUrls: [
      "https://pixabay.com/videos/download/video-28456_tiny.mp4",
      "https://pixabay.com/videos/download/video-11111_tiny.mp4",
      "https://pixabay.com/videos/download/video-9999_tiny.mp4",
    ],
  },
  {
    id: 3,
    label: "Neural Link",
    x: 10,
    y: 45,
    direction: "right",
    videoUrls: [
      "https://pixabay.com/videos/download/video-7777_tiny.mp4",
      "https://pixabay.com/videos/download/video-8888_tiny.mp4",
      "https://pixabay.com/videos/download/video-1010_tiny.mp4",
    ],
  },
  { id: 4, label: "Mid-Test", x: 90, y: 60, direction: "left", isTest: true }, // No videos
  {
    id: 5,
    label: "AI Fusion",
    x: 10,
    y: 75,
    direction: "right",
    videoUrls: [
      "https://pixabay.com/videos/download/video-6847_tiny.mp4",
      "https://pixabay.com/videos/download/video-4040_tiny.mp4",
      "https://pixabay.com/videos/download/video-7030_tiny.mp4",
    ],
  },
  { id: 6, label: "Final Test", x: 90, y: 90, direction: "left", isTest: true }, // No videos
];

interface StarDialogProps {
  isOpen: boolean
  onClose: () => void
  levelId: number
  starId: number
  onActivate: () => void
  onDeactivate: () => void
  isActive: boolean
  onWatchVideo: (videoUrl: string) => void; // Pass video URL to index.tsx

}

const StarDialog = ({ isOpen, onClose, levelId, starId, onActivate, onDeactivate, isActive , onWatchVideo}: StarDialogProps) => {
  const stage = journeyPoints.find((point) => point.id === levelId);
  const isTestStage = stage?.isTest;
  const videoUrl = stage?.videoUrls?.[starId - 1]; // Get video based on starId (1-indexed)
  const [isVideoOpen, setIsVideoOpen] = useState(false); // Track if full-screen video is open

  // const isTestStage = journeyPoints.find((point) => point.id === levelId)?.isTest;

  const handleWatchVideo = () => {
    if (videoUrl) {
      onClose(); // Close the StarDialog first
      setTimeout(() => onWatchVideo(videoUrl), 300); // Small delay to ensure smooth transition
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-cyan-500 text-white">
        <DialogHeader>
          <DialogTitle>
            Level {levelId} - Star {starId}
          </DialogTitle>
        </DialogHeader>

        {/* Video Preview for Non-Test Stages */}
        {videoUrl && !isTestStage && (
          <div className="relative w-full h-48 sm:h-64">
            <video className="w-full h-full rounded-lg" autoPlay loop muted playsInline>
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
          {isActive ? (
            <Button onClick={onDeactivate} variant="destructive">
              Deactivate Star
            </Button>
          ) : (
            <Button onClick={onActivate}>Activate Star</Button>
          )}
          {/* Watch Video Button */}
          {videoUrl && !isTestStage && (
            //   <Button onClick={() => setIsVideoOpen(true)} variant="default">
            <Button onClick={handleWatchVideo} variant="default">
                Watch Video
              </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
    {isVideoOpen && videoUrl && <VideoPlayer videoUrl={videoUrl} onClose={() => setIsVideoOpen(false)} />}
    </>
    
  );
};

// interface TestDialogProps {
//   isOpen: boolean
//   onClose: () => void
//   testId: number
//   onStartTest: () => void
//   previousScore?: number
// }

// const TestDialog = ({ isOpen, onClose, testId, onStartTest, previousScore }: TestDialogProps) => (
//   <Dialog open={isOpen} onOpenChange={onClose}>
//     <DialogContent className="sm:max-w-[425px] bg-gray-900 border-cyan-500 text-white">
//       <DialogHeader>
//         <DialogTitle>{testId === 4 ? "Mid-Test" : "Final Test"}</DialogTitle>
//         <DialogDescription>
//           This test consists of 6 questions. You have 10 seconds to answer each question.
//           {previousScore !== undefined && (
//             <>
//               <br />
//               Your previous score: {previousScore}/6 ({Math.round((previousScore / 6) * 100)}%)
//             </>
//           )}
//         </DialogDescription>
//       </DialogHeader>
//       <DialogFooter>
//         <Button onClick={onClose} variant="secondary">
//           Close
//         </Button>
//         <Button onClick={onStartTest}>{previousScore !== undefined ? "Retake Test" : "Start Test"}</Button>
//       </DialogFooter>
//     </DialogContent>
//   </Dialog>
// )

const DottedLine = ({
  start,
  end,
  isActive,
}: {
  start: JourneyPoint
  end: JourneyPoint
  isActive: boolean
}) => {
  const numDots = 12
  const dots = []

  for (let i = 0; i <= numDots; i++) {
    const x = start.x + (end.x - start.x) * (i / numDots)
    const y = start.y + (end.y - start.y) * (i / numDots)
    dots.push(
      <circle
        key={i}
        cx={`${x}%`}
        cy={`${y}%`}
        r="2"
        className={`transition-all duration-500 ${isActive ? "fill-cyan-400" : "fill-gray-600"}`}
      />,
    )
  }

  return <>{dots}</>
}

// interface CourseProps {
//     onStartTest: (testId: number) => void;
//     currentPoint: number;
//     activeStars: { [key: number]: { [starId: number]: boolean } };
//     testScores: { [key: number]: number };
//     // setCurrentPoint: (point: number) => void;
//     setCurrentPoint: React.Dispatch<React.SetStateAction<number>>;
//     setActiveStars: (stars: { [key: number]: { [starId: number]: boolean } }) => void;
//     setTestScores: (scores: { [key: number]: number }) => void;
//   }

interface CourseProps {
    onStartTest: (testId: number) => void;
    currentPoint: number;
    activeStars: Record<number, Record<number, boolean>>; // Cleaner type for nested objects
    testScores: Record<number, number>;
    setCurrentPoint: React.Dispatch<React.SetStateAction<number>>;
    setActiveStars: React.Dispatch<React.SetStateAction<Record<number, Record<number, boolean>>>>;
    // setTestScores: React.Dispatch<React.SetStateAction<Record<number, number>>>;
    onWatchVideo: (videoUrl: string) => void; // New prop

  }

// export default function Course() {
export default function Course({ 
    onStartTest,
    currentPoint, 
    activeStars, 
    testScores, 
    setCurrentPoint, 
    setActiveStars, 
    // setTestScores,
    onWatchVideo
 }: CourseProps) {
  const [selectedStar, setSelectedStar] = useState<{
    isOpen: boolean
    levelId?: number
    starId?: number
  }>({ isOpen: false })
  // const [selectedTest, setSelectedTest] = useState<{
  //   isOpen: boolean
  //   testId?: number
  // }>({ isOpen: false })
  // const [showTest, setShowTest] = useState(false)
  

  useEffect(() => {

    if (Object.keys(activeStars[currentPoint] || {}).length === 3) {
      // Unlock the next level if it exists
      if (currentPoint < journeyPoints.length) {
        console.log("setting current point to", currentPoint + 1)
        setCurrentPoint((prevPoint) => prevPoint + 1)
        setActiveStars((prev) => ({ ...prev, [currentPoint + 1]: {} }))
      }
    }
  }, [activeStars])

  const handleStarClick = (levelId: number, starId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedStar({
      isOpen: true,
      levelId,
      starId,
    })
  }

  const handleActivateStar = () => {
    if (!selectedStar.levelId || !selectedStar.starId) return;
  
    if (!isLevelUnlocked(selectedStar.levelId)) {
      console.warn(`Stage ${selectedStar.levelId} is locked.`);
      return;
    }
  
    setActiveStars((prev) => ({
      ...prev,
      [selectedStar.levelId!]: {
        ...(prev[selectedStar.levelId!] || {}), // Keep existing stars
        [selectedStar.starId!]: true, // Activate only this star
      },
    }));
  
    setSelectedStar({ isOpen: false });
  };

  const handleDeactivateStar = () => {
    if (!selectedStar.levelId || !selectedStar.starId) return;
  
    setActiveStars((prev) => {
      const updatedStars = { ...prev[selectedStar.levelId!] };
      delete updatedStars[selectedStar.starId!]; // Remove only this star
  
      return {
        ...prev,
        [selectedStar.levelId!]: updatedStars,
      };
    });
  
    setSelectedStar({ isOpen: false });
  };  

  const isLevelUnlocked = (levelId: number) => {
    if (levelId === 1) return true; // First level always unlocked
  
    const prevLevel = levelId - 1;
    
    // First check if there's a test score for previous level
    if (prevLevel in testScores) {
      return testScores[prevLevel] === 6;
    }
    
    // If no test score, check stars
    return Object.keys(activeStars[prevLevel] || {}).length === 3;
  };  

  const handleTestClick = (testId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!testId) {
      console.error("Invalid testId:", testId);
      return;
    }

    if (testScores[testId] === 6) {
      console.log("Test already completed with full marks.");
      return;
    }
  
    if (isLevelUnlocked(testId)) {
    //   setSelectedTest((prev) => ({
    //     ...prev,
    //     isOpen: true,
    //     testId, // Ensure testId is always updated
    //   }));
        onStartTest(testId); // Pass testId to index.tsx
    } else {
      console.log("Complete previous stages to unlock this test");
    }
  };

//   const handleStartTest = () => {
//     if (selectedTest.testId !== undefined && testScores[selectedTest.testId] === 6) {
//       console.log("Test already completed with full marks.");
//       return;
//     }

//     setSelectedTest((prev) => ({
//       ...prev,
//       isOpen: false, // Close dialog
//     }));
  
//     setShowTest((prev) => !prev); // Force re-render
//   };

  // const handleTestCompletion = (testId: number, score: number) => {
  //   if (testId === undefined) {
  //     console.error("handleTestCompletion called with undefined testId");
  //     return;
  //   }
  
  //   setTestScores((prev) => {
  //     const newScores = { ...prev, [testId]: score };
  //     console.log("Updated test scores:", newScores);
  //     return newScores;
  //   });
  
  //   setShowTest(false);
  
  //   console.log("score", score)
  //   if (score === 6) {
  //     console.log("score is 6, setting current point to", testId + 1)
  //     setCurrentPoint((prevPoint: number) => Math.max(prevPoint, testId + 1));
  //   }
  
  //   setSelectedTest({
  //     isOpen: false,
  //     testId: undefined, // Reset testId to avoid stale state issues
  //   });
  // };
  

//   const getTestStars = (score: number) => {
//     return Math.min(3, (score / 6) * 3); // Ensure it doesn't exceed 3 stars
//   };

  // if (showTest) {
  // if (showTest && selectedTest.testId !== undefined) {

  //   return <TestComponent testId={selectedTest.testId!} onComplete={handleTestCompletion} />
  // }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 text-cyan-400 p-4 sm:p-8 flex flex-col justify-center">
      <div
        className="relative w-full h-[600px] sm:h-[800px] rounded-lg overflow-hidden"
        style={{
          backgroundImage: `url(${encodeURI("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20from%202025-02-02%2013-22-09-zSK5wrxrQlGlkJq7mAmE3HGb8GLLMO.png")})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* <div className="absolute inset-0 bg-[radial-gradient(white,_rgba(255,255,255,_0.2)_2px,_transparent_3px)] bg-[length:50px_50px] opacity-20"></div> */}

        {/* Test Requirement Warning */}
        {journeyPoints[currentPoint - 1]?.isTest && testScores[currentPoint - 1] !== 6 && (
          <div className="bg-red-600 text-white p-3 rounded-lg text-center mb-4">
            ⚠️ <strong>Reminder:</strong> You must get <span className="font-bold">100% (6/6)</span> on the test to unlock the next stage.
          </div>
        )}

        {/* Connection lines */}
        <svg className="absolute top-0 left-0 w-full h-full">
          {journeyPoints.slice(0, -1).map((point, index) => (
            <DottedLine
              key={point.id}
              start={point}
              end={journeyPoints[index + 1]}
              isActive={isLevelUnlocked(point.id + 1)}
            />
          ))}
        </svg>

        {/* Journey points */}
        {journeyPoints.map((point) => {
          const isLocked = !isLevelUnlocked(point.id)
          const isCompleted = point.id < currentPoint
          const isCurrent = point.id === currentPoint

          return (
            <div
              key={point.id}
              className={`absolute w-16 h-16 sm:w-20 sm:h-20 transition-all duration-300 ease-in-out
              ${isLocked ? "opacity-80" : "cursor-pointer hover:scale-105"}
            `}
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              // onClick={() => !isLocked && setCurrentPoint(point.id)}
            >
              {/* Platform */}
              <div
                className={`
              absolute bottom-0 w-full h-3 rounded-lg transform perspective-800
              ${isLocked ? "bg-gray-700" : "bg-purple-900"}
              ${isCurrent ? "shadow-lg shadow-cyan-500/50" : ""}
            `}
              />

              {/* Point circle */}
              <div
                className={`
              w-12 h-12 rounded-full flex items-center justify-center
              ${isLocked ? "bg-gray-700" : isCompleted ? "bg-cyan-500" : isCurrent ? "bg-yellow-400" : "bg-purple-600"}
              ${isCurrent ? "ring-4 ring-cyan-400 shadow-lg shadow-cyan-500/50" : ""}
              transition-all duration-300
            `}
              >
                {isLocked ? (
                  <Lock className="w-6 h-6 text-gray-400" />
                ) : point.isTest ? (
                  <BookOpen
                    className="w-6 h-6 text-white cursor-pointer"
                    onClick={(e) => handleTestClick(point.id, e)}
                    // onClick={() => onStartTest(point.id)}
                  />
                ) : (
                  <span className="text-xl font-bold text-white">{point.id}</span>
                )}
              </div>

              {/* Label */}
              <div
                className={`absolute transform text-center whitespace-nowrap
              ${point.direction === "right" ? "left-full ml-4" : "right-full mr-4"}
            `}
              >
                <span className="text-xs sm:text-sm bg-gray-900/80 px-2 py-1 rounded text-white">{point.label}</span>
              </div>

              {/* Stars for levels */}
              {/* <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex gap-1">
                {[1, 2, 3].map((starId) => (
                  <Star
                    key={starId}
                    className={`w-4 h-4 cursor-pointer hover:scale-110 transition-transform ${
                      point.isTest
                        ? (testScores[point.id] || 0) >= starId * 2 // Each star represents 2 correct answers
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-600"
                        : (activeStars[point.id] || 0) >= starId
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-600"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (point.isTest) {
                        handleTestClick(point.id, e)
                      } else {
                        handleStarClick(point.id, starId, e)
                      }
                    }}
                  />
                ))}
              </div> */}
              {/* <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex gap-1">
                {[1, 2, 3].map((starId) => (
                  <Star
                    key={starId}
                    className={`w-4 h-4 cursor-pointer hover:scale-110 transition-transform 
                      ${point.isTest
                        ? getTestStars(testScores[point.id] || 0) >= starId
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-600"
                        : (activeStars[point.id] || 0) >= starId
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-600"
                      }
                      ${!isLevelUnlocked(point.id) ? "pointer-events-none opacity-50" : ""} // Prevents clicking locked stars
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLevelUnlocked(point.id)) return;
                      if (point.isTest) {
                        handleTestClick(point.id, e);
                      } else {
                        handleStarClick(point.id, starId, e);
                      }
                    }}
                  />
                ))}
              </div> */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex gap-1">
                {[1, 2, 3].map((starId) => {
                  // const testStarFill = point.isTest ? Math.min(1, Math.max(0, (testScores[point.id] / 6) * 3 - (starId - 1))) : 0;
                  const testStarFill = point.isTest
                  ? Math.min(1, Math.max(0, ((testScores[point.id] || 0) / 6) * 3 - (starId - 1)))
                  : 0;

                  console.log("testStarFill output", testStarFill)
                  return (
                    <svg
                      key={starId}
                      className={`w-4 h-4 cursor-pointer hover:scale-110 transition-transform 
    ${activeStars[point.id]?.[starId] ? "fill-yellow-400 text-yellow-400" : "fill-gray-600"}
    ${!isLevelUnlocked(point.id) ? "pointer-events-none opacity-50" : ""}
  `}
                      // onClick={(e) => {
                      //   e.stopPropagation();
                      //   if (!isLevelUnlocked(point.id)) return;
                      //   handleStarClick(point.id, starId, e);
                      // }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isLevelUnlocked(point.id)) return;
                        if (point.isTest) {
                          handleTestClick(point.id, e);
                        } else {
                          handleStarClick(point.id, starId, e);
                        }
                      }}
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <linearGradient id={`star-fill-${point.id}-${starId}`} x1="0%" x2="100%" y1="0%" y2="0%">
                        <stop offset={`${testStarFill * 100}%`} stopColor="#FACC15" /> 
                        <stop offset={`${testStarFill * 100}%`} stopColor="#4B5563" /> 
                      </linearGradient>
                      {/* <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                        fill={point.isTest ? `url(#star-fill-${point.id}-${starId})` : ""}
                        // className={point.isTest ? "" : (activeStars[point.id] || 0) >= starId ? "fill-yellow-400" : "fill-gray-600"}
                        className={activeStars[point.id]?.[starId] ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}
                      /> */}
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                        fill={point.isTest ? `url(#star-fill-${point.id}-${starId})` : ""}
                        className={point.isTest ? "" :activeStars[point.id]?.[starId] ? "fill-yellow-400 text-yellow-400" : "fill-gray-600"}
                      />
                    </svg>
                  );
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress section */}
      <div className="mt-4 sm:mt-8 text-center bg-gray-900/50 p-4 rounded-lg">
        <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4 text-white">Current Mission</h2>
        <p className="text-base sm:text-lg">
          <span className="font-bold text-yellow-400">
            {journeyPoints.find((point) => point.id === currentPoint)?.label}
          </span>
        </p>
        <p className="text-sm sm:text-base mt-2 text-cyan-200">
          {Math.round(((currentPoint-1) / journeyPoints.length) * 100)}% Journey Complete
        </p>
      </div>

      {/* Star Dialog */}
      <StarDialog
        isOpen={selectedStar.isOpen}
        onClose={() => setSelectedStar({ isOpen: false })}
        levelId={selectedStar.levelId || 0}
        starId={selectedStar.starId || 0}
        onActivate={handleActivateStar}
        onDeactivate={handleDeactivateStar}
        // isActive={(activeStars[selectedStar.levelId || 0] || 0) >= (selectedStar.starId || 0)}
        isActive={!!activeStars[selectedStar.levelId || 0]?.[selectedStar.starId || 0]} 
        onWatchVideo={onWatchVideo} // Pass up to index.tsx

      />

      {/* Test Dialog */}
      {/* <TestDialog
        isOpen={selectedTest.isOpen}
        onClose={() => setSelectedTest({ isOpen: false })}
        testId={selectedTest.testId || 0}
        onStartTest={handleStartTest}
        previousScore={testScores[selectedTest.testId || 0]}
      /> */}
    </div>
  )
}


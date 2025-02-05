import { useState } from "react";
import Course from "@/components/Course";
import TestComponent from "@/components/TestComponent";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import VideoPlayer from "@/components/CourseVideoPlayer";

export default function CoursePage() {
  const [isTesting, setIsTesting] = useState(false);
  const [currentTestId, setCurrentTestId] = useState<number | null>(null);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testScores, setTestScores] = useState<{ [key: number]: number }>({});
  const [currentPoint, setCurrentPoint] = useState<number>(1)
  const [activeStars, setActiveStars] = useState<{ [key: number]: { [starId: number]: boolean } }>({});

  const [videoUrl, setVideoUrl] = useState<string | null>(null); // Track video being played

  const startTest = (testId: number) => {
    setCurrentTestId(testId);
    setShowTestDialog(true); // Show dialog first
  };

  const handleStartTest = () => {
    setShowTestDialog(false);
    setIsTesting(true);
  };

  const completeTest = (testId: number, score: number) => {
    console.log(`Test ${testId} completed with score: ${score}`);
    setTestScores((prev) => ({ ...prev, [testId]: score }));

    if (score === 6) {
      setCurrentPoint((prev) => Math.max(prev, testId + 1));
    }
    
    setIsTesting(false);
    setCurrentTestId(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {isTesting && currentTestId ? (
        <TestComponent testId={currentTestId} onComplete={completeTest} />
      ) : (
        <Course
          onStartTest={startTest}
          currentPoint={currentPoint}
          setCurrentPoint={setCurrentPoint}
          activeStars={activeStars}
          setActiveStars={setActiveStars}
          testScores={testScores}
          setTestScores={setTestScores}
          onWatchVideo={(url) => setVideoUrl(url)} // Handle video watch
        />
      )}

      {/* Test Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 border-cyan-500 text-white">
          <DialogHeader>
            <DialogTitle>{currentTestId === 4 ? "Mid-Test" : "Final Test"}</DialogTitle>
            <DialogDescription>
              This test consists of 6 questions. You have 10 seconds to answer each.
              {currentTestId !== null && testScores[currentTestId] !== undefined && (
                <>
                  <br />
                  Previous score: {testScores[currentTestId]}/6 (
                  {Math.round((testScores[currentTestId] / 6) * 100)}%)
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowTestDialog(false)} variant="secondary">
              Close
            </Button>
            <Button onClick={handleStartTest}>
              {currentTestId !== null && testScores[currentTestId] !== undefined ? "Retake Test" : "Start Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {videoUrl && <VideoPlayer videoUrl={videoUrl} onClose={() => setVideoUrl(null)} />}

    </div>
  );
}

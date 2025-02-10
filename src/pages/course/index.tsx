import { useState, useEffect, useContext, useRef } from "react";
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
import { sendMessageWithTimeout } from "@/shared/utils/aoUtils";
import { useArweaveProvider } from "@/context/ArweaveProvider";
import { processId } from "@/shared/config/config";
import { ScreenContext } from "@/context/ScreenContext";

export default function CoursePage() {
  const { courseProgress, setCourseProgress, profile, wallet } = useArweaveProvider();
  const [isTesting, setIsTesting] = useState(false);
  const [currentTestId, setCurrentTestId] = useState<number | null>(null);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testScores, setTestScores] = useState<{ [key: number]: number }>({}); 
  const [currentPoint, setCurrentPoint] = useState<number>(1);
  const [activeStars, setActiveStars] = useState<{
    [key: number]: { [starId: number]: boolean };
  }>({});
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentScreen } = useContext(ScreenContext);
  console.log("activeStars in course page: ", activeStars);

  const testScoresRef = useRef(testScores);
  const activeStarsRef = useRef(activeStars);
  const currentPointRef = useRef(currentPoint);

  useEffect(() => {
    testScoresRef.current = testScores;
    activeStarsRef.current = activeStars;
    currentPointRef.current = currentPoint;
  }, [testScores, activeStars, currentPoint]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // If courseProgress is still null after 10s, load defaults
      if (courseProgress === null) {
        setTestScores({});
        setCurrentPoint(1);
        setActiveStars({});
        setIsLoading(false);
      }
    }, 10000);

    if (courseProgress !== null) {
      setTestScores(courseProgress.testScores);
      setCurrentPoint(courseProgress.currentPoint);
      setActiveStars(courseProgress.activeStars);
      setIsLoading(false);
      clearTimeout(timeoutId);
    }

    return () => clearTimeout(timeoutId);
  }, [courseProgress]);

  useEffect(() => {
    const handleAppVisibility = () => {
      if (document.hidden) {
        console.log("App went to background, saving progress...");
        saveProgressIfNeeded();
      }
    };
  
    const handleBeforeUnload = () => {
      console.log("App is closing, saving progress...");
      saveProgressIfNeeded();
    };
  
    document.addEventListener("visibilitychange", handleAppVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);
  
    return () => {
      document.removeEventListener("visibilitychange", handleAppVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    return () => {
      console.log("Leaving Course Page, saving progress...");
      saveProgressIfNeeded();
    };
  }, [currentScreen]); // Runs when `currentScreen` changes
  

  const startTest = (testId: number) => {
    setCurrentTestId(testId);
    setShowTestDialog(true); // Show dialog first
  };

  const handleStartTest = () => {
    setShowTestDialog(false);
    setIsTesting(true);
  };

  const saveProgressIfNeeded = async () => {
    if (!courseProgress || !profile) return; // No progress loaded yet
  
    const latestTestScores = testScoresRef.current;
    const latestActiveStars = activeStarsRef.current;
    const latestCurrentPoint = currentPointRef.current;
  
    console.log("Latest testScores before save: ", latestTestScores);
    console.log("Latest activeStars before save: ", latestActiveStars);
  
    const hasChanges =
      latestCurrentPoint !== courseProgress.currentPoint ||
      JSON.stringify(latestTestScores) !== JSON.stringify(courseProgress.testScores) ||
      JSON.stringify(latestActiveStars) !== JSON.stringify(courseProgress.activeStars);
  
    if (!hasChanges) {
      console.log("No changes detected, skipping save.");
      return;
    }
  
    console.log("Saving course progress...");
  
    try {
      const res = await sendMessageWithTimeout(
        processId,
        [
          { name: "Action", value: "Save-Course-Progress" },
          { name: "UserWID", value: profile.walletAddress },
          { name: "CurrentPoint", value: latestCurrentPoint.toString() },
          { name: "TestScores", value: JSON.stringify(latestTestScores) },
          { name: "ActiveStars", value: JSON.stringify(latestActiveStars) },
        ],
        wallet,
        "",
        20000
      );
      console.log("Save Course Progress result", res);
      console.log("Course progress saved!");

      setCourseProgress({
        currentPoint: latestCurrentPoint,
        testScores: latestTestScores,
        activeStars: latestActiveStars,
      });

    } catch (error) {
      console.error("Failed to save progress:", error);
    }
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

  if (isLoading) {
    return (
      <div className="bg-gray-900 text-white h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-xl">Loading course progress...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white">
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
          // setTestScores={setTestScores}
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

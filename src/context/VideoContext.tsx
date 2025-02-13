import { createContext, useContext, useState } from "react";

interface VideoContextType {
  isMuted: boolean;
  toggleMute: () => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export function VideoProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <VideoContext.Provider value={{ isMuted, toggleMute }}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideoSettings() {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideoSettings must be used within a VideoProvider");
  }
  return context;
}

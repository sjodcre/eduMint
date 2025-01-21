import VideoFeed from "./components/VideoFeed";
import { ScreenContext } from "./context/ScreenContext";
import OnBoard from "./components/OnBoard";
import { useContext } from "react";
import ProfilePage from "./pages/profile/profile-page";
import { useArweaveProvider } from "./context/ArweaveProvider";
import { BottomNav } from "./components/Navbar";
import Upload from "./pages/post/upload.";
import { Market } from "./pages/market/market";
import { Toaster } from "./components/ui/toaster";

export default function App() {
  const { currentScreen } = useContext(ScreenContext);
  const {selectedUser} = useArweaveProvider()
  return (
    <div className="pb-16">
      {currentScreen === "onboarding" && <OnBoard />}
      {currentScreen === "videofeed" && <VideoFeed />}
      {currentScreen === "upload" && <Upload />}
      {currentScreen === "market" && <Market />}
      {currentScreen === "profile" && <ProfilePage user={selectedUser || null}/>}
      <Toaster />
      <BottomNav/>
    </div>
  );
}

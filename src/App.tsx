import VideoFeed from "./components/videoFeed";
import { ScreenContext } from "./context/ScreenContext";
import OnBoard from "./components/onBoard";
import { useContext } from "react";
import ProfilePage from "./components/profile/profilePage";
import { useArweaveProvider } from "./context/ProfileContext";
import { BottomNav } from "./components/navbar";
import Upload from "./components/ui/upload.";
import { Market } from "./components/market/market";

export default function App() {
  const { currentScreen } = useContext(ScreenContext);
  const {selectedUser} = useArweaveProvider()
  return (
    <div>
      {currentScreen === "onboarding" && <OnBoard />}
      {currentScreen === "videofeed" && <VideoFeed />}
      {currentScreen === "upload" && <Upload />}
      {currentScreen === "market" && <Market />}
      {currentScreen === "profile" && <ProfilePage user={selectedUser || null}/>}
      <BottomNav/>
    </div>
  );
}

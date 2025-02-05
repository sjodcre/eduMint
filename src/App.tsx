import VideoFeed from "./components/VideoFeed";
import { ScreenContext } from "./context/ScreenContext";
import OnBoard from "./components/OnBoard";
import { useContext } from "react";
// import ProfilePage from "./pages/profile/profile-page";
// import { useArweaveProvider } from "./context/ArweaveProvider";
import { BottomNav } from "./components/Navbar";
import Upload from "./pages/post/upload";
// import { Market } from "./pages/market/market";
import { Toaster } from "./components/ui/toaster";
import ProfilePagePlaceholder from "./pages/profile/profile-demo";
import Course from "./pages/course";

export default function App() {
  const { currentScreen } = useContext(ScreenContext);
  // const {selectedUser} = useArweaveProvider()
  return (
    <div className="pb-16">
      {currentScreen === "onboarding" && <OnBoard />}
      {currentScreen === "videofeed" && <VideoFeed />}
      {currentScreen === "upload" && <Upload />}
      {/* {currentScreen === "market" && <Market />} */}
      {currentScreen === "course" && <Course />}
      {/* {currentScreen === "profile" && <ProfilePage user={selectedUser || null}/>} */}
      {currentScreen === "profile" && <ProfilePagePlaceholder />}
      <Toaster />
      <BottomNav/>
    </div>
  );
}

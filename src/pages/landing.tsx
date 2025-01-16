import { Bookmark, DollarSign, Heart, Share2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { useVideos } from "@/hooks/useVideos";
import { useState, useEffect, useRef, useContext } from "react";
import { AvatarFallback, AvatarImage, Avatar } from "../components/ui/avatar";
import { User, Video } from "@/shared/types/user";
import { BottomNav, Navbar } from "../components/Navbar";
import { ScreenContext } from "@/context/ScreenContext";
import { useArweaveProvider } from "@/context/ArweaveProvider";

export default function Landing() {
  const { videos, loading, error } = useVideos();
  const [localVideos, setLocalVideos] = useState(videos);
  const {setCurrentScreen} = useContext(ScreenContext)
  // const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const {setSelectedUser} = useArweaveProvider()
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    setLocalVideos(videos);
  }, [videos]);

  // const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
  //   const bottom =
  //     e.currentTarget.scrollHeight - e.currentTarget.scrollTop ===
  //     e.currentTarget.clientHeight;
  //   if (bottom && !loading) {
  //     fetchVideos();
  //   }
  // };

  // const handleLike = (videoId: string, liked: boolean) => {
  //   setLocalVideos((prevVideos) =>
  //     prevVideos.map((video) =>
  //       video.id === videoId
  //         ? { ...video, likes: video.likes + (liked ? 1 : -1) }
  //         : video,
  //     ),
  //   );
  // };

  const onProfileClick = (user: User) => {
    setSelectedUser(user);
    setCurrentScreen("profile")
  };

  if (loading && !localVideos.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!localVideos.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        No videos found
      </div>
    );
  }
  //   localVideos.map((video) => console.log(video));
  return (
    <div>
      <Navbar />
      {/* Main Content */}
      <div className="flex-grow flex justify-center">
        {localVideos.map((video) => (
          <div className="relative w-full max-w-[400px] lg:max-w-[350px] h-screen">
            {/* Video Container */}
            <div className="absolute inset-0 bg-zinc-800">
              {/* This would be your video player component */}
              <div className="w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-contain"
                >
                  <source src={video.videoUrl} type="video/mp4" />
                </video>
              </div>
            </div>

            {/* Brand Name Overlay*/}
            <div className="absolute top-4 left-4 z-50 lg:hidden">
              <h1 className="text-xl font-bold text-white drop-shadow-lg">
                PRAXIS
              </h1>
            </div>

            {/* Interaction Buttons */}
            <div className="absolute right-4 bottom-20 lg:bottom-4 flex flex-col gap-6">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-zinc-800/50 hover:bg-zinc-700/50"
              >
                <Heart className="w-6 h-6" />
                <span className="sr-only">{video.likes}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-zinc-800/50 hover:bg-zinc-700/50"
              >
                <Share2 className="w-6 h-6" />
                <span className="sr-only">Share</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-zinc-800/50 hover:bg-zinc-700/50"
              >
                <DollarSign className="w-6 h-6" />
                <span className="sr-only">Buy</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-zinc-800/50 hover:bg-zinc-700/50"
              >
                <Bookmark className="w-6 h-6" />
                <span className="sr-only">Save</span>
              </Button>
            </div>

            {/* User Info */}
            <Profile video={video} onProfileClick={onProfileClick}/>
          </div>
        ))}
        <BottomNav />
      </div>
    </div>
  );
}

function Profile({
  video,
  //   onLike,
    onProfileClick
}: {
  video: Video;
  //   onLike: (id: string, liked: boolean) => void;
    onProfileClick: (user: User) => void;
}) {
  return (
    <div className="absolute left-4 bottom-20 lg:bottom-4 right-16">
      <div className="flex items-center gap-3">
        <Avatar
        onClick={() => onProfileClick(video.user)} 
        className="w-10 h-10 border border-zinc-700">
          <AvatarImage
            src={video.user.profileImage}
            alt={`${video.user.username}'s profile`}
          />
          <AvatarFallback>{video.user.displayName}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-semibold">{video.user.displayName}</h2>
          <p className="text-sm text-zinc-400">@{video.user.username}</p>
        </div>
      </div>
    </div>
  );
}

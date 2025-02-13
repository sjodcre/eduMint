import { useState, useRef, useEffect, useContext } from "react";
import { Heart, Bookmark, BadgeDollarSign, Volume2, VolumeX } from "lucide-react";
import { useVideos } from "../hooks/useVideos";
import { Video, User } from "../shared/types/user";
import { useArweaveProvider } from "@/context/ArweaveProvider";
import { ScreenContext } from "@/context/ScreenContext";
import { processId } from "@/shared/config/config";
import { transferAR } from "@/shared/lib/tip";
import { toast } from "./ui/use-toast";
import { fetchResultWithTimeout, sendMessageWithTimeout } from "@/shared/utils/aoUtils";
// import { useConnection } from "@arweave-wallet-kit/react";

export default function VideoFeed() {
  const { videos, loading, refetch: fetchVideos, error } = useVideos();
  const [localVideos, setLocalVideos] = useState(videos);
  const [page, setPage] = useState(1);
  const [hasMoreVideos, setHasMoreVideos] = useState(true); // ✅ Track if more videos exist
  // const {videos, loading, error, fetchPlayerProfile} = useStore()
  const { setSelectedUser, walletAddress, wallet, isProfileLoading } = useArweaveProvider()
  const { setCurrentScreen } = useContext(ScreenContext)
  const [isFetching, setIsFetching] = useState(false);
  const eventBound = useRef(false);
  // const { connected, connect } = useConnection();

  const checkWalletConnection = async () => {
    // if (!connected) {
    if (walletAddress === null) {
      console.log("no active address when checking wallet connection")
      toast({
        title: "Please connect your Arweave wallet!",
        description: `You must connect your Arweave wallet to continue.`,
      })
      // Show popup/modal to connect wallet
      // const shouldConnect = window.confirm("Please connect your Arweave wallet to continue. Would you like to connect now?");
      // if (shouldConnect) {
      //   try {
      //     await connect();
      //     return true;
      //   } catch (error) {
      //     console.error("Failed to connect wallet:", error);
      //     return false;
      //   }
      // }
      return false;
    }
    return true;
  };

  // useEffect(() => {
  //   console.log("setting local videos at useEffect");
  //   console.log("videos", videos);
  //   setLocalVideos(videos);
  // }, [videos]);

  // useEffect(() => {
  //   const handleScreenChange = async () => {
  //     if (window.location.hash === '#videofeed') {
  //       console.log("Home button pressed - refreshing videos");
  //       const updatedVideos = await fetchVideos();
  //       // setLocalVideos(updatedVideos);
  //       setLocalVideos(updatedVideos || []);
  //     }
  //   };

  //   const handleVisibilityChange = () => {
  //     if (!document.hidden) {
  //       handleScreenChange();
  //     }
  //   };

  //   // Add event listener for hash changes
  //   window.addEventListener('hashchange', handleScreenChange);
  //   document.addEventListener('visibilitychange', handleVisibilityChange);


  //   // Initial check
  //   handleScreenChange();

  //   // Cleanup
  //   return () => {
  //     window.removeEventListener('hashchange', handleScreenChange);
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);

  //   };
  // }, []);

  useEffect(() => {
    const handleScreenChange = async () => {
      // Check if the hash matches '#videofeed'
      if (isFetching) return;
      setIsFetching(true);

      try {
        if (window.location.hash === '#videofeed') {
          console.log("Home button pressed - refreshing videos");
          const updatedVideos = await fetchVideos();
          // setLocalVideos(updatedVideos || []);
          setLocalVideos((prevVideos) => updatedVideos || prevVideos);
        }
      } catch (error) {
        console.error("Error refreshing videos:", error);
      } finally {
        setIsFetching(false);
      }
    };

    // const handleVisibilityChange = () => {
    //   console.log("visibility change", document.hidden);

    //   // Debounce the visibility change event to prevent rapid multiple calls
    //   clearTimeout(visibilityTimeout);
    //   if (!document.hidden) {
    //     visibilityTimeout = setTimeout(() => {
    //       handleScreenChange();
    //     }, 1000); // 1 second debounce to avoid excessive calls
    //   }
    // };
    const handleAppResume = () => {
      console.log("App resumed or tab focused, re-fetching videos...");
      handleScreenChange();
    };

    if (eventBound.current) return;
    eventBound.current = true;

    // Add event listeners for hashchange and visibilitychange
    // window.addEventListener('hashchange', handleScreenChange);
    // document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener("pageshow", handleAppResume);
    window.addEventListener("focus", handleAppResume);
    window.addEventListener("hashchange", handleAppResume);

    // Initial check
    handleScreenChange();

    // Cleanup
    return () => {
      // window.removeEventListener('hashchange', handleScreenChange);
      // document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener("pageshow", handleAppResume);
      window.removeEventListener("focus", handleAppResume);
      window.removeEventListener("hashchange", handleAppResume)
      eventBound.current = false;

    };
  }, []);

  // const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
  //   const bottom =
  //     e.currentTarget.scrollHeight - e.currentTarget.scrollTop ===
  //     e.currentTarget.clientHeight;
  //   if (bottom && !loading) {
  //     console.log("at the bottom of the feed, fetching more videos");
  //     fetchVideos();
  //   }
  // };

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    if (loading || !hasMoreVideos) return; // ✅ Stop fetching if no more videos

    const bottom =
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop ===
      e.currentTarget.clientHeight;

    if (bottom) {
      console.log(`Fetching more videos for page ${page + 1}`);
      const newVideos = await fetchVideos(page + 1);

      if (newVideos.length > 0) {
        setPage(prevPage => prevPage + 1);
        setLocalVideos(prevVideos => [...prevVideos, ...newVideos]); // Append new videos
        console.log("local videos", localVideos);
      } else {
        setHasMoreVideos(false); // ✅ No more videos, stop further fetching
      }
    }
  };

  const handleBookmarkVideo = async (video: Video) => {
    if (!await checkWalletConnection()) return;

    const updatedVideo = { ...video }; // Create a copy of the post to update
    if (!video.bookmarked) {
      try {
        const res = await sendMessageWithTimeout(
          processId,
          [
            { name: "Action", value: "Save-Post" },
            { name: "PostID", value: video.autoId.toString() },
          ],
          wallet,
          "",
          30000
        );
        console.log("Save Post result", res);

        const saveResult = await fetchResultWithTimeout(
          processId,
          res,
          30000
        );
        console.log("Post saved", saveResult);
        console.log(saveResult.Messages[0].Data);

        if (saveResult.Messages[0].Data === "Post saved to bookmarks successfully.") {
          // toast({
          //   description: "Post saved to bookmarks successfully!"
          // });
          console.log("Post saved to bookmarks successfully!");
          updatedVideo.bookmarked = true; // Update the local state
        }

      } catch (error) {
        console.log(error);
        // toast({
        //     description: "Error saving post"
        // });
        console.log("Error saving post");
        throw error;
      }
    } else {
      // Handle removing bookmark case
      try {
        const res = await sendMessageWithTimeout(
          processId,
          [
            { name: "Action", value: "Unsave-Post" },
            { name: "PostID", value: video.autoId.toString() },
          ],
          wallet,
          "",
          30000
        );
        console.log("Unsave Post result", res);

        const unsaveResult = await fetchResultWithTimeout(
          processId,
          res,
          30000
        );

        console.log("Post unsaved", unsaveResult);
        console.log(unsaveResult.Messages[0].Data);

        if (unsaveResult.Messages[0].Data === "Post removed from bookmarks successfully.") {
          // toast({
          //   description: "Post removed from bookmarks successfully!"
          // });
          console.log("Post removed from bookmarks successfully!");
          updatedVideo.bookmarked = false; // Update the local state
        }

      } catch (error) {
        console.log(error);
        // toast({
        //     description: "Error saving post"
        // });
        console.log("Error saving post");
        throw error;
      }
    }

    setLocalVideos((prevVideos) =>
      prevVideos.map((p) => (p.id === updatedVideo.id ? updatedVideo : p))
    );

    // setPosts((prevPosts) =>
    //   prevPosts.map((p) => (p.ID === updatedPost.ID ? updatedPost : p))
    // );
  };

  const handleLike = async (video: Video) => {
    if (!await checkWalletConnection()) return;

    const updatedVideo = { ...video }; // Create a copy of the post to update

    if (video.liked) {
      const res = await sendMessageWithTimeout(
        processId,
        [
          { name: "Action", value: "Unlike-Post" },
          { name: "PostId", value: video.autoId.toString() },
        ],
        wallet,
        "",
        30000
      );

      console.log("Unlike Post result", res);

      const unlikeResult = await fetchResultWithTimeout(
        processId,
        res,
        30000
      );

      console.log("Unlike successfully", unlikeResult);
      console.log(unlikeResult.Messages[0].Data);
      if (unlikeResult.Messages[0].Data === "Post unliked successfully.") {
        // toast({
        //   description: "Post unliked Successfully!!",
        // });
        console.log("Unliking a video", video.id);
        updatedVideo.liked = false; // Update the local state
        updatedVideo.likes = Math.max(0, updatedVideo.likes - 1);
      }
    } else {
      const res = await sendMessageWithTimeout(
        processId,
        [
          { name: "Action", value: "Like-Post" },
          { name: "PostId", value: video.autoId.toString() },
        ],
        wallet,
        "",
        30000
      );

      console.log("Like Post result", res);

      const likeResult = await fetchResultWithTimeout(
        processId,
        res,
        30000
      );

      console.log("Like successfully", likeResult);
      console.log(likeResult.Messages[0].Data);
      if (likeResult.Messages[0].Data === "Post liked successfully.") {
        // toast({
        //   description: "Post liked Successfully!!",
        // });
        console.log("Liking a video", video.id);
        updatedVideo.liked = true; // Update the local state
        updatedVideo.likes += 1; // Increase like count
      }
    }
    setLocalVideos((prevVideos) =>
      prevVideos.map((p) => (p.id === updatedVideo.id ? updatedVideo : p))
    );

  };

  const onProfileClick = (user: User) => {
    setSelectedUser(user);
    setCurrentScreen("profile")
  };

  if ((loading && !localVideos.length) || isProfileLoading) {
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
  // localVideos.map((video) => console.log(video));
  return (
    <>
      {/* <div className="h-screen overflow-y-auto snap-y snap-mandatory" onScroll={handleScroll}> */}
      <div className="h-[calc(100vh-4rem)] overflow-y-auto snap-y snap-mandatory" onScroll={handleScroll}>

        {localVideos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onLike={() => handleLike(video)}
            onProfileClick={onProfileClick}
            onBookmark={() => handleBookmarkVideo(video)}
          />
        ))}
        {/* {loading && (
          <div className="flex justify-center p-4">Loading more...</div>
        )} */}
        {loading && (
          <div className="flex justify-center items-center p-4 bg-black text-gray-300">
            <svg className="animate-spin h-6 w-6 text-gray-500 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <span className="text-gray-400">Loading more...</span>
          </div>
        )}
      </div>
    </>
  );
}

function VideoCard({
  video,
  onLike,
  onProfileClick,
  onBookmark,
}: {
  video: Video;
  onLike: () => Promise<void>;
  onProfileClick: (user: User) => void;
  onBookmark: () => Promise<void>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // @ts-ignore
  const [isLiked, setIsLiked] = useState(video.liked);
  const arProvider = useArweaveProvider();
  // const { connected, connect } = useConnection();

  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    if (videoRef.current) {
      const muted = !isMuted;
      setIsMuted(muted);
      videoRef.current.muted = muted;
    }
  };

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          videoRef.current?.play();
        } else {
          videoRef.current?.pause();
        }
      });
    }, options);

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  // const toggleLike = () => {
  //   setIsLiked(!isLiked);
  //   onLike(video.id, !isLiked);
  // };

  const handleSendTip = async () => {
    // if (!connected) {
    //   const shouldConnect = window.confirm("Please connect your Arweave wallet to send a tip. Would you like to connect now?");
    //   if (shouldConnect) {
    //     try {
    //       await connect();
    //     } catch (error) {
    //       console.error("Failed to connect wallet:", error);
    //       return;
    //     }
    //   } else {
    //     return;
    //   }
    // }

    // if (!arProvider.walletAddress) {
    if (arProvider.walletAddress === null) {
      console.log("no active address when checking wallet connection")
      toast({
        title: "Please connect your Arweave wallet!",
        description: `You must connect your Arweave wallet to continue.`,
      })
      return;
    }

    console.log("arProvider.profile", arProvider.profile);
    if (!arProvider.profile) return;
    try {
      console.log("post author: ", video.user.id);
      await transferAR(arProvider.profile.walletAddress, video.user.id);

    } catch (error: any) {
      console.error("Error sending tip:", error);
      if (error.message === "Arweave Wallet not connected") {
        alert("Please connect your Arweave Wallet to send a tip.");
      } else {
        alert("Will be implemented soon.");
      }
    }
  };

  return (
    <div className="relative h-full w-full bg-black snap-start flex items-center justify-center">
      <video
        ref={videoRef}
        className="h-full w-full object-cover sm:object-scale-down"
        loop
        muted={isMuted}
        playsInline
      >
        <source src={video.videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute bottom-16 left-4 right-4">
        <h2 className="text-white text-lg font-bold mb-1">{video.title}</h2>
        <p className="text-white text-sm mb-2">{video.description.split(' ').slice(0, 10).join(' ') + (video.description.split(' ').length > 10 ? '...' : '')}</p>
      </div>

      <div className="absolute bottom-4 left-4 flex items-center">
        <button
          onClick={() => onProfileClick(video.user)}
          className="flex items-center"
        >
          <div className="relative">
            <img
              src={video.user.profileImage || "/ripple.png"}
              alt={`${video.user.username}'s profile`}
              className="h-12 w-12 rounded-full border-2 border-white"
            />
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white">
              {video.user.tier}
            </div>
          </div>
          <span className="ml-2 text-lg font-semibold text-white">
            @{video.user.username}
          </span>
        </button>
      </div>

      <div className="absolute bottom-4 right-4 flex flex-col items-center space-y-4">
        <button
          className="flex flex-col items-center text-white"
          title={isMuted ? "Unmute" : "Mute"}
          onClick={toggleMute}
        >
          {isMuted ? (
            <VolumeX className="h-8 w-8" />
          ) : (
            <Volume2 className="h-8 w-8" />
          )}
          <span className="text-sm">{isMuted ? "Muted" : "Unmuted"}</span>
        </button>
        <button className="flex flex-col items-center" title="Like" onClick={onLike}>
          <Heart
            className={`h-8 w-8 ${video.liked ? "fill-red-500 text-red-500" : "text-white"}`}
          />
          <span className="text-sm text-white">
            {video.likes}
          </span>
        </button>
        {/* <button className="flex flex-col items-center"> */}
        {/*   <MessageCircle className="h-8 w-8 text-white" /> */}
        {/*   <span className="text-sm text-white">{video.comments}</span> */}
        {/* </button> */}
        <button className="flex flex-col items-center text-green-500" title="Tip" onClick={handleSendTip}>
          <BadgeDollarSign className="h-8 w-8 " />
          <span className="text-sm" >Tip</span>
        </button>
        <button
          className={`flex flex-col items-center ${video.bookmarked ? 'text-blue-500' : 'text-white'}`}
          title="Bookmark"
          onClick={onBookmark}
        >
          <Bookmark className="h-8 w-8" fill={video.bookmarked ? 'blue' : ''} />
          <span className="text-sm">Bookmark</span>
        </button>
      </div>
    </div>
  );
}

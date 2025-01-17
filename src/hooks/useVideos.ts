import { useState, useEffect } from "react";
import type { Video } from "@/shared/types/user";
import { useArweaveProvider } from "@/context/ArweaveProvider";
import {
  createDataItemSigner,
  dryrun,
  message,
  result,
} from "@permaweb/aoconnect";
import { processId } from "@/shared/config/config";
// import { useConnection } from "@arweave-wallet-kit/react";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  // const { connected } = useConnection();
  const [error, setError] = useState<string | null>(null);
  const {walletAddress, wallet, profile} = useArweaveProvider()

  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const fetchWithRetry = async (
    fn: () => Promise<any>,
    retries = MAX_RETRIES,
  ) => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await wait(RETRY_DELAY);
        return fetchWithRetry(fn, retries - 1);
      }
      throw error;
    }
  };

  const mapPostsToVideos = (parsedPosts: any[]) => {
    return parsedPosts.flat().map((post: any) => ({
      id: post.ID,
      autoId: post.AutoID,
      videoUrl: `https://arweave.net/${post.VideoTxId}`,
      title: post.Title,
      user: {
        id: post.AuthorWallet,
        username: post.Author,
        profileImage: '/logo-black-icon.svg',
        tier: "bronze",
        followers: 0,
        following: 0,
        displayName: post.Author
      },
      likes: post.LikeCount,
      likeSummary: {
        PostID: post.AutoID,
        LikeCount: post.LikeCount
      },
      comments: 0,
      description: post.Body,
      price: post.Price,
      sellingStatus: post.SellingStatus,
      liked: post.Liked ?? false,
      bookmarked: post.Bookmarked ?? false
    }));
  };

  // const fetchVideos = async () => {
  const fetchVideos = async (): Promise<Video[]> => {
    try {
      setLoading(true);
      setError(null);

      if(walletAddress !== null) {
        console.log("profile from context: ", profile);
        // console.log("selecteduser from context: ", selectedUser);
        // const userDetails = await fetchPlayerProfile(walletAddress);
        // console.log("userDetails from fetchPlayerProfile: ", userDetails);
        // if (profile === null) {
        //   // throw new Error("Failed to fetch user profile");
        //   console.log("no profile yet");
        //   return; 
        // }

        if (profile!==null && profile?.version !== null) {
          console.log("fetching videos with profile");
          const msgRes = await message({
            process: processId,
            tags: [
              { name: "Action", value: "List-Posts-Likes" },
              { name: "Author-Id", value: profile.walletAddress },
            ],
            signer: createDataItemSigner(wallet),
          });

          const postResult = await result({
            process: processId,
            message: msgRes,
          });
          console.log("postResult at use-videos: ", postResult);

          const parsedPosts = postResult.Messages.map((msg: any) => {
            const parsedData = JSON.parse(msg.Data);
            return parsedData.map((post: any) => ({
              ...post,
              Liked: post.Liked === 1,
              LikeCount: post.LikeCount || 0,
              SellingStatus: post.SellingStatus === 1,
              Bookmarked: post.Bookmarked === 1,
            }));
          });

          const videos = mapPostsToVideos(parsedPosts);
          setVideos(videos);
          return videos;

        } else {
          console.log("fetching videos without profile");
          const response = await dryrun({
            process: processId,
            tags: [{ name: "Action", value: "List-Posts" }],
          });

          const parsedPosts = response.Messages.map((msg: any) => {
            const parsedData = JSON.parse(msg.Data);
            return parsedData.map((post: any) => ({
              ...post,
              LikeCount: post.LikeCount || 0,
              Liked: false,
              SellingStatus: post.SellingStatus === 1,
              Bookmarked: false
            }));
          });

          const videos = mapPostsToVideos(parsedPosts);
          setVideos(videos);
          return videos;
        }

      } else {
        console.log("fetching videos without wallet connection");
        const response = await dryrun({
          process: processId,
          tags: [{ name: "Action", value: "List-Posts" }],
        });

        const parsedPosts = response.Messages.map((msg: any) => {
          const parsedData = JSON.parse(msg.Data);
          return parsedData.map((post: any) => ({
            ...post,
            LikeCount: post.LikeCount || 0,
            Liked: false,
            SellingStatus: post.SellingStatus === 1,
            Bookmarked: false
          }));
        });

        const videos = mapPostsToVideos(parsedPosts);
        setVideos(videos);
        return videos;
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch videos";
      console.error(errorMessage);
      setError(errorMessage);
      return []; // Return an empty array on error

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.arweaveWallet) {
      fetchVideos();
      console.log("useVideos useEffect fetch videos ");
    }
// }, [connected]);
  }, [walletAddress, profile]);

  return {
    videos,
    loading,
    error,
    refetch: () => fetchVideos(),
  };
}

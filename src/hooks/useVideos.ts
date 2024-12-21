import { useState, useEffect } from "react";
import type { Video } from "@/types/user";
import { useArweaveProvider } from "@/context/ProfileContext";
import {
  createDataItemSigner,
  dryrun,
  message,
  result,
} from "@permaweb/aoconnect";
import { processId } from "@/config/config";
import { useConnection } from "@arweave-wallet-kit/react";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const { connected } = useConnection();
  const [error, setError] = useState<string | null>(null);
  const {setSelectedUser} = useArweaveProvider()

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

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("connect status before fetch: ", connected);
      if(connected) {
        console.log("fetching videos with profile");
        // First fetch user profile
        const userDetails = await fetchPlayerProfile();
        if (!userDetails) {
          throw new Error("Failed to fetch user profile");
        }

        // Then use the wallet address to fetch videos
        const msgRes = await message({
          process: processId,
          tags: [
            { name: "Action", value: "List-Posts-Likes" },
            { name: "Author-Id", value: userDetails.id },
          ],
          signer: createDataItemSigner(window.arweaveWallet),
        });

        const postResult = await result({
          process: processId,
          message: msgRes,
        });

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

        const videos = parsedPosts.flat().map((post: any) => ({
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
          liked: post.Liked,
          bookmarked: post.Bookmarked
        }));

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

        const videos = parsedPosts.flat().map((post: any) => ({
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
          liked: false,
          bookmarked: false
        }));

        setVideos(videos);
        return videos;
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch videos";
      console.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayerProfile = async () => {
    if(!connected) return;
    const userAddress = await window.arweaveWallet.getActiveAddress()

    try {
      setLoading(true);
      setError(null);

      const profileIdRes = await fetchWithRetry(async () => {
        const response = await dryrun({
          process: "SNy4m-DrqxWl01YqGM4sxI8qCni-58re8uuJLvZPypY",
          tags: [
            {
              name: "Action",
              value: "Get-Profiles-By-Delegate",
            },
          ],
          signer: createDataItemSigner(window.arweaveWallet),
          data: JSON.stringify({ Address: userAddress }),
        });
        return JSON.parse(response.Messages[0].Data);
      });

      if (!profileIdRes?.[0]?.ProfileId) {
        throw new Error("No profile ID found");
      }

      const profileRes = await fetchWithRetry(async () => {
        const response = await dryrun({
          process: profileIdRes[0].ProfileId,
          tags: [
            {
              name: "Action",
              value: "Info",
            },
          ],
          signer: createDataItemSigner(window.arweaveWallet),
          data: "",
        });
        return JSON.parse(response.Messages[0].Data);
      });

      if (!profileRes?.Profile) {
        throw new Error("Invalid profile data");
      }

      const userDetails = {
        id: userAddress,
        walletAddress: profileRes.Owner || "no owner",
        displayName: profileRes.Profile.DisplayName || "ANON",
        username: profileRes.Profile.UserName || "unknown",
        bio: profileRes.Profile.Bio || "",
        profileImage: profileRes.Profile.ProfileImage || "default-avatar.png",
        banner: profileRes.Profile.CoverImage || "default-banner.png",
        version: profileRes.Profile.Version || 1,
      };

      setSelectedUser(userDetails);
      return userDetails;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch profile";
      console.error(errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.arweaveWallet) {
      // fetchPlayerProfile();
      fetchVideos();
    }
}, [connected]);

  return {
    videos,
    loading,
    error,
    fetchPlayerProfile,
    refetch: () => fetchVideos(),
  };
}

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
import { useActiveAddress } from "@arweave-wallet-kit/react";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const arProvider = useArweaveProvider();
  const {setSelectedUser} = useArweaveProvider()
  const activeAddress = useActiveAddress();
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
      // console.log("fetching videos with profile: ", arProvider.profile);
      if (arProvider.profile) {
        const msgRes = await message({
          process: processId,
          tags: [
            { name: "Action", value: "List-Posts-Likes" },
            { name: "Author-Id", value: arProvider.profile.walletAddress },
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
        console.log("videos: ", videos);

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
    if (!activeAddress) {
      console.error("No active address");
      return null;
    }

    if (!arProvider.profile) {
      console.log("No profile found, create a profile first");
      return null;
    }

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
          data: JSON.stringify({ Address: activeAddress }),
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
        id: activeAddress,
        // name: profileRes.Profile.DisplayName || "ANON",
        // score: 0,
        // bazarId: profileIdRes[0].ProfileId,
        walletAddress: profileRes.Owner || "no owner",
        displayName: profileRes.Profile.DisplayName || "ANON",
        username: profileRes.Profile.UserName || "unknown",
        bio: profileRes.Profile.Bio || "",
        profileImage: profileRes.Profile.ProfileImage || "default-avatar.png",
        banner: profileRes.Profile.CoverImage || "default-banner.png",
        version: profileRes.Profile.Version || 1,
      };

      console.log("userDetails", userDetails);
      // if (arProvider?.profile) {
      arProvider.profile = userDetails;
      // }

      setSelectedUser(userDetails);
      
      // Fetch videos after profile is set
      await fetchVideos();

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
    if (activeAddress && window.arweaveWallet) {
      fetchPlayerProfile();
    }
  }, [activeAddress, arProvider.profile]);

  return {
    videos,
    loading,
    error,
    fetchPlayerProfile,
    refetch: () => fetchVideos(),
  };
}

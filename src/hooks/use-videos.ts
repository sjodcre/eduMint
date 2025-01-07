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
import { getProfileByWalletAddress } from "@/api/profile-api";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  // const { connected } = useConnection();
  const [error, setError] = useState<string | null>(null);
  const {setSelectedUser, walletAddress, wallet, setIsProfileLoading} = useArweaveProvider()

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

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      if(walletAddress !== null) {
        const userDetails = await fetchPlayerProfile(walletAddress);
        if (!userDetails) {
          throw new Error("Failed to fetch user profile");
        }

        if (userDetails.version !== null) {
          console.log("fetching videos with profile");
          const msgRes = await message({
            process: processId,
            tags: [
              { name: "Action", value: "List-Posts-Likes" },
              { name: "Author-Id", value: userDetails.id },
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

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch videos";
      console.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayerProfile = async (walletAddress: string) => {
    // if(!connected) return;
    console.log("walletAddress at fetch player profile function: ", walletAddress);
    if(walletAddress===null) return;
    // console.log("active address: ", window.arweaveWallet.getActiveAddress());
    // const userAddress = await window.arweaveWallet.getActiveAddress()
    // console.log("userAddress at fetch player profile function: ", userAddress);
    try {
      setLoading(true);
      setError(null);

      // const profileIdRes = await fetchWithRetry(async () => {
      //   const response = await dryrun({
      //     process: "SNy4m-DrqxWl01YqGM4sxI8qCni-58re8uuJLvZPypY",
      //     tags: [
      //       {
      //         name: "Action",
      //         value: "Get-Profiles-By-Delegate",
      //       },
      //     ],
      //     signer: createDataItemSigner(window.arweaveWallet),
      //     data: JSON.stringify({ Address: userAddress }),
      //   });
      //   return JSON.parse(response.Messages[0].Data);
      // });

      // if (!profileIdRes?.[0]?.ProfileId) {
      //   throw new Error("No profile ID found");
      // }

      // const profileRes = await fetchWithRetry(async () => {
      //   const response = await dryrun({
      //     process: profileIdRes[0].ProfileId,
      //     tags: [
      //       {
      //         name: "Action",
      //         value: "Info",
      //       },
      //     ],
      //     signer: createDataItemSigner(window.arweaveWallet),
      //     data: "",
      //   });
      //   return JSON.parse(response.Messages[0].Data);
      // });

      // if (!profileRes?.Profile) {
      //   throw new Error("Invalid profile data");
      // }

      const profileRes = await fetchWithRetry(async () => {
        // return await getProfileByWalletAddress({ address: userAddress });
        return await getProfileByWalletAddress({ address: walletAddress }, setIsProfileLoading);
      });
      console.log("profileRes at use-videos: ", profileRes);

      // if (profileRes?.version === null) {
      //   setSelectedUser({
      //     id: userAddress,
      //     walletAddress: profileRes.walletAddress || "no owner",
      //     displayName: profileRes?.displayName || "ANON",
      //     username: "no owner", 
      //     bio: profileRes?.bio || "",
      //     profileImage: "/default-avatar.png",
      //     banner: "default-banner.png",
      //     version: 1,
        
      //   });
      // } else {
        // setSelectedUser({
        //   id: userAddress,
        //   walletAddress: profileRes?.walletAddress || "no owner",
        //   displayName: profileRes?.displayName || "ANON",
        //   username: profileRes?.username || "unknown",
        //   bio: profileRes?.bio || "",
        //   profileImage: profileRes?.profileImage || "/default-avatar.png",
        //   banner: profileRes?.banner || "default-banner.png",
        //   version: profileRes?.version ? parseInt(profileRes.version) : 1,

        // });
      // }

      const userDetails = {
          // id: userAddress,
          id: walletAddress,
          walletAddress: profileRes?.walletAddress,
          displayName: profileRes?.displayName,
          username: profileRes?.username,
          bio: profileRes?.bio ,
          profileImage: profileRes?.profileImage ,
          banner: profileRes?.banner ,
          version: profileRes?.version,
      };

      // const userDetails = {
      //   id: userAddress,
      //   walletAddress: profileRes.Owner || "no owner",
      //   displayName: profileRes.Profile.DisplayName || "ANON",
      //   username: profileRes.Profile.UserName || "unknown",
      //   bio: profileRes.Profile.Bio || "",
      //   profileImage: profileRes.Profile.ProfileImage || "default-avatar.png",
      //   banner: profileRes.Profile.CoverImage || "default-banner.png",
      //   version: profileRes.Profile.Version || 1,
      // };

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
      console.log("useVideos useEffect fetch videos ");
    }
// }, [connected]);
  }, [walletAddress]);

  return {
    videos,
    loading,
    error,
    fetchPlayerProfile,
    refetch: () => fetchVideos(),
  };
}

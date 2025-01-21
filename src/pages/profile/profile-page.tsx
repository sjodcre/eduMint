import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/shared/types/user";
// import { useConnection } from "@arweave-wallet-kit/react";
import { useState, useEffect } from "react";
import { useArweaveProvider } from "@/context/ArweaveProvider";
import { processId } from "@/shared/config/config";
// import { fetchUserProfile } from "@/shared/lib/profile-queries";
import WalletConnection from "@/components/WalletConnect";
import { dryrunWithTimeout } from "@/shared/utils/aoUtils";

//@ts-ignore
export default function ProfilePage({
  user: initialUser,
}: {
  user: User | null;
}) {
  // const { connected, connect: connectWallet } = useConnection();
  // const arProvider = useArweaveProvider();
  const {selectedUser, profile, walletAddress, isProfileLoading, handleDisconnect} = useArweaveProvider()
  const [isLoading, setIsLoading] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("videos");
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  // const [user, setUser] = useState<User | null>(initialUser);
  // const activeAddress = useActiveAddress();
  // const fetchAndSetUserProfile = async () => {
  //   console.log("fetchAndSetUserProfile fn called");
  //   if (arProvider.walletAddress === null) return;

  //   try {
  //     const profile = await fetchUserProfile(arProvider.walletAddress);
  //     console.log("profile fetched for fetchAndSetUserProfile fn: ", profile);
  //     if (profile.version === null) {
  //       // setUser({
  //       //   id: "ANON", 
  //       //   username: "ANON",
  //       //   displayName: "ANON",
  //       //   profileImage: "/default-avatar.png",
  //       //   tier: "bronze",
  //       //   followers: 0,
  //       //   following: 0,
  //       // });
  //       setUser(undefined);
  //     } else {
  //       setUser({
  //         id: profile.walletAddress,
  //         username: profile.username || "unknown",
  //         displayName: profile.displayName || "ANON", 
  //         profileImage: profile.profileImage || "/default-avatar.png",
  //         tier: "bronze",
  //         followers: 0,
  //         following: 0,
  //       });
  //       fetchUserPosts();
  //     }
  //   } catch (error) {
  //     console.error("Error fetching profile:", error);
  //     setUser({
  //       id: "ANON",
  //       username: "ANON", 
  //       displayName: "ANON",
  //       profileImage: "/default-avatar.png",
  //       tier: "bronze",
  //       followers: 0,
  //       following: 0,
  //     });
  //   }
  // };
  console.log("selectedUser at profile page: ", selectedUser);
  console.log("profile at profile page: ", profile);
  // // Initial fetch on component mount
  // useEffect(() => {
  //   fetchAndSetUserProfile();
  // }, []);

  // Fetch when wallet address changes
  // useEffect(() => {
  //   console.log("wallet changed!")
  //   fetchAndSetUserProfile();
  // }, [arProvider.walletAddress]);

  const fetchBookmarkedPosts = async () => {
    console.log(
      "arProvider.walletAddress at profile page fetchBookmarkedPosts fn: ",
      walletAddress,
    );
    if (!walletAddress) return;
    // if (!connected) return;
    // if (!arProvider.profile) return;
    // const userAddress = await window.arweaveWallet.getActiveAddress()
    setIsLoading(true);
    try {
      const response = await dryrunWithTimeout(
        processId, 
        [
          { name: "Action", value: "Get-Bookmarked-Posts" },
          { name: "Author-Id", value: walletAddress }
        ], 
        null, 
        30000
      );
      const parsedPosts = response.Messages.map((msg: any) => {
        const parsedData = JSON.parse(msg.Data);
        //   return parsedData;
        console.log("parsedPosts before mapping: ", parsedData);
        return parsedData.map((post: any) => ({
          ...post,
          LikeCount: post.LikeCount || 0, // Ensure LikeCount defaults to 0
        }));
      });
      console.log("parsedPosts after mapping: ", parsedPosts[0]);
      setBookmarkedPosts(parsedPosts[0]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    // if (!connected) return;
    console.log(
      "arProvider.walletAddress at profile page fetchUserPosts fn: ",
      walletAddress,
    );
    if (!walletAddress) return;
    // const userAddress = await window.arweaveWallet.getActiveAddress()
    setIsLoading(true);
    try {
      const response = await dryrunWithTimeout(
        processId, 
        [
          { name: "Action", value: "List-User-Posts" },
          { name: "Author-Id", value: walletAddress }
        ], 
        null, 
        30000
      );

      console.log("response from list-user-posts", response);

      const parsedPosts = response.Messages.map((msg: any) => {
        const parsedData = JSON.parse(msg.Data);
        return parsedData.map((post: any) => ({
          ...post,
          Liked: post.Liked === 1,
          LikeCount: post.LikeCount || 0,
          SellingStatus: post.SellingStatus === 1,
        }));
      });
      console.log("fetched user posts: ", parsedPosts[0]);
      setUserPosts(parsedPosts[0]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "videos") {
      fetchUserPosts();
    } else if (activeTab === "saved") {
      fetchBookmarkedPosts();
    }
    // }, [activeTab, connected]);
  }, [activeTab, profile, selectedUser]);

  // console.log(
  //   "arProvider.walletAddress at profile page: ",
  //   arProvider.walletAddress,
  // );
  // if (!connected) {

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Loading Your Profile...</h1>
        <p className="text-zinc-400 mb-6">
          Please wait while we fetch your profile details.
        </p>
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (walletAddress === null) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-zinc-400 mb-6">
          Please connect your wallet to view your profile
        </p>
        <WalletConnection />
      </div>
    );
  }

  if (selectedUser === null) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Create Your Profile</h1>
        <div className="text-zinc-400 mb-6 text-center max-w-lg">
          <p className="mb-4">
            For now, profiles need to be created through{" "}
            <a 
              href="https://bazar.arweave.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Bazar
            </a>
            {" "}({" "}
            <a
              href="https://bazar.arweave.dev"
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              https://bazar.arweave.dev
            </a>
            {" "}). Connect your wallet and look for the profile creation option in the top right.
          </p>
          <p className="text-sm italic">don't worry dawg. we got you. we will be implementing this soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-zinc-700">
            <AvatarImage src={selectedUser?.profileImage} alt={selectedUser?.displayName} />
            <AvatarFallback>{selectedUser?.displayName}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold">{selectedUser?.displayName}</h1>
            <p className="text-sm text-zinc-400">@{selectedUser?.username}</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            {/* user points */}
            <span className="text-sm">{100} points</span>
            {walletAddress && (
              <div className="flex items-center gap-4 text-white">
                <p>
                  {/* Connected to {walletType} wallet: */}
                  <span className="font-bold"> {walletAddress.slice(0,3)}...{walletAddress.slice(-3)}</span>
                </p>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 bg-black text-white border border-white rounded-lg hover:bg-gray-900"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs and Content */}
      <Tabs
        defaultValue="videos"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="w-full justify-start bg-zinc-800 p-0 h-12">
          <TabsTrigger
            value="videos"
            className="flex-1 data-[state=active]:bg-zinc-700 rounded-none"
          >
            Videos
          </TabsTrigger>
          <TabsTrigger
            value="saved"
            className="flex-1 data-[state=active]:bg-zinc-700 rounded-none"
          >
            Saved
          </TabsTrigger>
          <TabsTrigger
            value="sold"
            className="flex-1 data-[state=active]:bg-zinc-700 rounded-none"
          >
            Sold
          </TabsTrigger>
        </TabsList>
        <TabsContent value="videos" className="p-4">
          <div className="grid grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-zinc-800 rounded-lg animate-pulse"
                />
              ))
            ) : userPosts.length > 0 ? (
              userPosts.map((post: any, i) => (
                <div key={i} className="flex flex-col">
                  <div className="aspect-square bg-zinc-800 rounded-lg overflow-hidden">
                    <video
                      src={`https://arweave.net/${post.VideoTxId}`}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  </div>
                  <p className="mt-2 text-sm text-center truncate">
                    {post.Title}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-zinc-500">
                No videos found
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="saved" className="p-4">
          <div className="grid grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-zinc-800 rounded-lg animate-pulse"
                />
              ))
            ) : bookmarkedPosts.length > 0 ? (
              bookmarkedPosts.map((post: any, i) => (
                <div key={i} className="flex flex-col">
                  <div className="aspect-square bg-zinc-800 rounded-lg overflow-hidden">
                    <video
                      src={`https://arweave.net/${post.VideoTxId}`}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  </div>
                  <p className="mt-2 text-sm text-center truncate">
                    {post.Title}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-zinc-500">
                No saved videos found
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="sold" className="p-4">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-square bg-zinc-800 rounded-lg" />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

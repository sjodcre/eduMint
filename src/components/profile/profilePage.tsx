import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types/user";
import { dryrun } from "@permaweb/aoconnect";
import { useConnection } from "@arweave-wallet-kit/react";
import { useState, useEffect } from "react";
import { useArweaveProvider } from "@/context/ProfileContext";
import { processId } from "@/config/config";
import { Button } from "@/components/ui/button";
import { fetchUserProfile } from "@/lib/ProfileUtils";

//@ts-ignore
export default function ProfilePage({ user: initialUser } : {user: User | null}) {
  const { connected, connect: connectWallet } = useConnection();
  const arProvider = useArweaveProvider();
  const [isLoading, setIsLoading] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("videos");
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  // const [user, setUser] = useState<User | null>(initialUser);
  const [user, setUser] = useState<User>();
  // const activeAddress = useActiveAddress();

  useEffect(() => {
    
    const fetchInitialProfile = async () => {
      const userAddress = await window.arweaveWallet.getActiveAddress()
      console.log("userAddress: ", userAddress);
      if (!connected) return;
      
      try {
        const profile = await fetchUserProfile(userAddress || "");
        console.log("profile: ", profile);
        if (profile.version === null) {
          setUser({
            id: "ANON",
            username: "ANON", 
            displayName: "ANON",
            profileImage: "/default-avatar.png",
            tier: "bronze",
            followers: 0,
            following: 0
          
          });
        } else {
          setUser({
            id: profile.walletAddress,
            username: profile.username || "unknown", 
            displayName: profile.displayName || "ANON",
            profileImage: profile.profileImage || "/default-avatar.png",
            tier: "bronze",
            followers: 0,
            following: 0
          });
        }
      } catch (error) {
        console.error("Error fetching initial profile:", error);
        setUser({
          id: "ANON",
          username: "ANON", 
          displayName: "ANON",
          profileImage: "/default-avatar.png",
          tier: "bronze",
          followers: 0,
          following: 0
        
        });      }
    };

    fetchInitialProfile();
  }, []);


  useEffect(() => {
    const getProfile = async () => {
      const userAddress = await window.arweaveWallet.getActiveAddress()
      if (!connected || !userAddress) return;
      
      try {
        const profile = await fetchUserProfile(userAddress);
        
        if (profile.version === null) {
          setUser({
            id: "ANON",
            username: "ANON", 
            displayName: "ANON",
            profileImage: "/default-avatar.png",
            tier: "bronze",
            followers: 0,
            following: 0
          
          }); 
        } else {
          // Convert profile to User type and set it
          setUser({
            id: profile.walletAddress,
            username: profile.username || "unknown",
            displayName: profile.displayName || "ANON",
            profileImage: profile.profileImage || "/default-avatar.png",
            tier: "bronze", // Default value
            followers: 0, // Default value
            following: 0 // Default value
          });
          fetchUserPosts();
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setUser({
          id: "ANON",
          username: "ANON", 
          displayName: "ANON",
          profileImage: "/default-avatar.png",
          tier: "bronze",
          followers: 0,
          following: 0
        
        });      }
    };

    getProfile();
  }, [connected, arProvider.profile?.walletAddress]);

  const fetchBookmarkedPosts = async () => {
    if (!connected) return;
    // if (!arProvider.profile) return;
    const userAddress = await window.arweaveWallet.getActiveAddress()
    setIsLoading(true);
    try {
      const response = await dryrun({
        process: processId,
        tags: [
          { name: "Action", value: "Get-Bookmarked-Posts" },
          { name: "Author-Id", value: userAddress },
        ],
      });
      const parsedPosts = response.Messages.map((msg) => {
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
    if (!connected) return;
    // if (!arProvider.profile) return;
    const userAddress = await window.arweaveWallet.getActiveAddress()
    setIsLoading(true);
    try {
      const response = await dryrun({
        process: processId,
        tags: [
          { name: "Action", value: "List-User-Posts" },
          { name: "Author-Id", value: userAddress },
        ],
      });

      const parsedPosts = response.Messages.map((msg) => {
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
  }, [activeTab, connected]);

  if (!connected) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-zinc-400 mb-6">Please connect your wallet to view your profile</p>
        <Button onClick={connectWallet} className="bg-blue-500 hover:bg-blue-600">
          Connect Wallet
        </Button>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-zinc-700">
            <AvatarImage src={user?.profileImage} alt={user?.displayName} />
            <AvatarFallback>{user?.displayName}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold">{user?.displayName}</h1>
            <p className="text-sm text-zinc-400">@{user?.username}</p>
          </div>
          <div className="ml-auto">
          {/* user points */}
            <span className="text-sm">{100} points</span>
          </div>
        </div>
      </div>

      {/* Tabs and Content */}
      <Tabs defaultValue="videos" className="w-full" onValueChange={setActiveTab}>
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
                <div key={i} className="aspect-square bg-zinc-800 rounded-lg animate-pulse" />
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
                  <p className="mt-2 text-sm text-center truncate">{post.Title}</p>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-zinc-500">No videos found</div>
            )}

          </div>
        </TabsContent>
        <TabsContent value="saved" className="p-4">
          <div className="grid grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="aspect-square bg-zinc-800 rounded-lg animate-pulse" />
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
                  <p className="mt-2 text-sm text-center truncate">{post.Title}</p>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-zinc-500">No saved videos found</div>
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

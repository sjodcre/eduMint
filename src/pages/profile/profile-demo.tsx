import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const placeholderUsers = [
  { name: "Emma Johnson", username: "emmaj", points: 750, walletAddress: "abc...123", followers: 1200, following: 350 },
  { name: "Liam Williams", username: "liamw", points: 620, walletAddress: "def...456", followers: 980, following: 420 },
  {
    name: "Sophia Chen",
    username: "sophiac",
    points: 890,
    walletAddress: "ghi...789",
    followers: 1500,
    following: 280,
  },
  { name: "Noah Garcia", username: "noahg", points: 540, walletAddress: "jkl...012", followers: 750, following: 600 },
  { name: "Ava Patel", username: "avap", points: 710, walletAddress: "mno...345", followers: 1100, following: 390 },
]

const placeholderVideos = [
  { id: 1, title: "Sunset Beach", url: "https://pixabay.com/videos/download/video-31377_tiny.mp4" },
  { id: 2, title: "City Traffic", url: "https://pixabay.com/videos/download/video-28456_tiny.mp4" },
  { id: 3, title: "Mountain Stream", url: "https://pixabay.com/videos/download/video-33194_tiny.mp4" },
  { id: 4, title: "Blooming Flower", url: "https://pixabay.com/videos/download/video-41758_tiny.mp4" },
  { id: 5, title: "Starry Night", url: "https://pixabay.com/videos/download/video-32976_tiny.mp4" },
  { id: 6, title: "Ocean Waves", url: "https://pixabay.com/videos/download/video-7030_tiny.mp4" },
  { id: 7, title: "Forest Walk", url: "https://pixabay.com/videos/download/video-47912_tiny.mp4" },
  { id: 8, title: "Rainy Window", url: "https://pixabay.com/videos/download/video-6847_tiny.mp4" },
  { id: 9, title: "Northern Lights", url: "https://pixabay.com/videos/download/video-14205_tiny.mp4" },
]

export default function ProfilePagePlaceholder() {
  const [currentUserIndex, setCurrentUserIndex] = useState(0)
  const currentUser = placeholderUsers[currentUserIndex]

  const switchUser = () => {
    setCurrentUserIndex((prevIndex) => (prevIndex + 1) % placeholderUsers.length)
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-zinc-700">
            <AvatarImage src={`https://i.pravatar.cc/150?u=${currentUser.username}`} alt={currentUser.name} />
            <AvatarFallback>
              {currentUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-grow">
            <div className="flex items-center gap-4">
              <h1 className="font-semibold">{currentUser.name}</h1>
              <div className="flex gap-4 text-sm text-zinc-400">
                <span>{currentUser.followers} followers</span>
                <span>{currentUser.following} following</span>
              </div>
            </div>
            <p className="text-sm text-zinc-400">@{currentUser.username}</p>
            <div className="flex gap-2 mt-2">
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700">
                Edit Profile
              </button>
              <button className="px-3 py-1 text-sm bg-gray-600 text-white rounded-full hover:bg-gray-700">
                Share Profile
              </button>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm">{currentUser.points} points</span>
            <div className="flex items-center gap-4 text-white">
              <p>
                <span className="font-bold">{currentUser.walletAddress}</span>
              </p>
              <button
                className="px-4 py-2 bg-black text-white border border-white rounded-lg hover:bg-gray-900"
                onClick={switchUser}
              >
                Switch User
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Content */}
      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="w-full justify-start bg-zinc-800 p-0 h-12">
          <TabsTrigger value="videos" className="flex-1 data-[state=active]:bg-zinc-700 rounded-none">
            Videos
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex-1 data-[state=active]:bg-zinc-700 rounded-none">
            Saved
          </TabsTrigger>
          <TabsTrigger value="sold" className="flex-1 data-[state=active]:bg-zinc-700 rounded-none">
            Sold
          </TabsTrigger>
        </TabsList>
        <TabsContent value="videos" className="p-4">
          <div className="grid grid-cols-3 gap-4">
            {placeholderVideos.map((video) => (
              <div key={video.id} className="flex flex-col">
                <div className="aspect-square bg-zinc-800 rounded-lg overflow-hidden">
                  <video src={video.url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                </div>
                <p className="mt-2 text-sm text-center truncate">{video.title}</p>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="saved" className="p-4">
          <div className="grid grid-cols-3 gap-4">
            {placeholderVideos.slice(3, 6).map((video) => (
              <div key={video.id} className="flex flex-col">
                <div className="aspect-square bg-zinc-800 rounded-lg overflow-hidden">
                  <video src={video.url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                </div>
                <p className="mt-2 text-sm text-center truncate">{video.title} (Saved)</p>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="sold" className="p-4">
          <div className="grid grid-cols-3 gap-4">
            {placeholderVideos.slice(6, 9).map((video) => (
              <div key={video.id} className="flex flex-col">
                <div className="aspect-square bg-zinc-800 rounded-lg overflow-hidden">
                  <video src={video.url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                </div>
                <p className="mt-2 text-sm text-center truncate">{video.title} (Sold)</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


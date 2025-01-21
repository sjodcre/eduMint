import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Coins, Heart, DollarSign, Bookmark, Clock } from "lucide-react"

interface Video {
  id: string
  title: string
  user: {
    id: string
    username: string
    profileImage: string
  }
  videoUrl: string
  price: number | null
  category: string
  likes: number
  liked: boolean
  bookmarks: number
  bookmarked: boolean
  listedForSaleAt: Date | null
}

interface MarketVideoCardProps {
  video: Video
  isUserVideo: boolean
  onListForSale: (video: Video) => void
  onCancelSale: (videoId: string) => void
  onBuyVideo: (video: Video) => void
  onLike: (videoId: string) => void
  onBookmark: (videoId: string) => void
}

export function MarketVideoCard({
  video,
  isUserVideo,
  onListForSale,
  onCancelSale,
  onBuyVideo,
  onLike,
  onBookmark,
}: MarketVideoCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const formatTimeSinceListedForSale = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInDays > 0) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
    if (diffInHours > 0) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
    if (diffInMinutes > 0) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
    return "Just now"
  }

  return (
    <motion.div
      className="bg-zinc-800 rounded-lg overflow-hidden"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="aspect-square bg-zinc-700 rounded-lg overflow-hidden">
        <video
          src={video.videoUrl}
          className="w-full h-full object-cover"
          autoPlay={isHovered}
          muted
          loop
          playsInline
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 truncate">{video.title}</h3>
        <div className="flex items-center mb-2">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={video.user.profileImage} alt={video.user.username} />
            <AvatarFallback>{video.user.username[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-zinc-400">@{video.user.username}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">{video.category}</span>
          <div className="flex items-center space-x-2">
            <button className="text-sm text-zinc-400 flex items-center" onClick={() => onLike(video.id)}>
              <Heart className="w-4 h-4 mr-1 fill-red-500 text-red-500" />
              {video.likes}
            </button>
            <button className="text-sm text-zinc-400 flex items-center" onClick={() => onBookmark(video.id)}>
              <Bookmark className="w-4 h-4 mr-1 fill-blue-500 text-blue-500" />
              {video.bookmarks}
            </button>
          </div>
        </div>
        {video.listedForSaleAt && (
          <div className="flex items-center text-sm text-zinc-400 mb-2">
            <Clock className="w-4 h-4 mr-1" />
            {formatTimeSinceListedForSale(video.listedForSaleAt)}
          </div>
        )}
        <div className="flex items-center justify-between">
          {isUserVideo ? (
            video.price ? (
              <>
                <span className="text-lg font-bold">
                  <Coins className="inline w-5 h-5 mr-1" />
                  {video.price} AR
                </span>
                <Button
                  size="sm"
                  onClick={() => onCancelSale(video.id)}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Cancel Sale
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => onListForSale(video)}>
                <DollarSign className="w-4 h-4 mr-2" />
                List for Sale
              </Button>
            )
          ) : (
            <>
              <span className="text-lg font-bold">
                <Coins className="inline w-5 h-5 mr-1" />
                {video.price} AR
              </span>
              <Button size="sm" onClick={() => onBuyVideo(video)}>
                Buy Now
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}


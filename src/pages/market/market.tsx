import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { MarketVideoCard } from "@/components/MarketVideoCard"
import { ArrowUpDown, Filter, Search, ChevronLeft, ChevronRight } from "lucide-react"

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

const fetchUserVideos = (): Video[] => {
  return [
    {
      id: "1",
      title: "Introduction to React",
      user: { id: "user1", username: "reactmaster", profileImage: "/placeholder-avatar.jpg" },
      videoUrl: "https://example.com/video1.mp4",
      price: null,
      category: "Programming",
      likes: 100,
      liked: false,
      bookmarks: 50,
      bookmarked: false,
      listedForSaleAt: null,
    },
    {
      id: "2",
      title: "Advanced TypeScript Techniques",
      user: { id: "user1", username: "reactmaster", profileImage: "/placeholder-avatar.jpg" },
      videoUrl: "https://example.com/video2.mp4",
      price: 5,
      category: "Programming",
      likes: 75,
      liked: false,
      bookmarks: 30,
      bookmarked: false,
      listedForSaleAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      id: "3",
      title: "Building RESTful APIs",
      user: { id: "user1", username: "reactmaster", profileImage: "/placeholder-avatar.jpg" },
      videoUrl: "https://example.com/video3.mp4",
      price: null,
      category: "Backend",
      likes: 120,
      liked: false,
      bookmarks: 40,
      bookmarked: false,
      listedForSaleAt: null,
    },
    {
      id: "4",
      title: "CSS Grid Mastery",
      user: { id: "user1", username: "reactmaster", profileImage: "/placeholder-avatar.jpg" },
      videoUrl: "https://example.com/video4.mp4",
      price: 3,
      category: "Frontend",
      likes: 90,
      liked: false,
      bookmarks: 25,
      bookmarked: false,
      listedForSaleAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      id: "5",
      title: "JavaScript Design Patterns",
      user: { id: "user1", username: "reactmaster", profileImage: "/placeholder-avatar.jpg" },
      videoUrl: "https://example.com/video5.mp4",
      price: null,
      category: "Programming",
      likes: 150,
      liked: false,
      bookmarks: 60,
      bookmarked: false,
      listedForSaleAt: null,
    },
    {
      id: "6",
      title: "Vue.js for Beginners",
      user: { id: "user1", username: "reactmaster", profileImage: "/placeholder-avatar.jpg" },
      videoUrl: "https://example.com/video6.mp4",
      price: 4,
      category: "Frontend",
      likes: 80,
      liked: false,
      bookmarks: 20,
      bookmarked: false,
      listedForSaleAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  ]
}

const fetchVideosForSale = (): Video[] => {
  return [
    {
      id: "7",
      title: "Machine Learning Basics",
      user: { id: "user2", username: "aiexpert", profileImage: "/placeholder-avatar2.jpg" },
      videoUrl: "https://example.com/video7.mp4",
      price: 10,
      category: "Data Science",
      likes: 200,
      liked: false,
      bookmarks: 80,
      bookmarked: false,
      listedForSaleAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
    {
      id: "8",
      title: "Web Design Principles",
      user: { id: "user3", username: "designguru", profileImage: "/placeholder-avatar3.jpg" },
      videoUrl: "https://example.com/video8.mp4",
      price: 7.5,
      category: "Design",
      likes: 150,
      liked: false,
      bookmarks: 60,
      bookmarked: false,
      listedForSaleAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
    {
      id: "9",
      title: "iOS App Development",
      user: { id: "user4", username: "swiftcoder", profileImage: "/placeholder-avatar4.jpg" },
      videoUrl: "https://example.com/video9.mp4",
      price: 12,
      category: "Mobile Development",
      likes: 180,
      liked: false,
      bookmarks: 70,
      bookmarked: false,
      listedForSaleAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: "10",
      title: "Python for Data Analysis",
      user: { id: "user5", username: "datawizard", profileImage: "/placeholder-avatar5.jpg" },
      videoUrl: "https://example.com/video10.mp4",
      price: 8,
      category: "Data Science",
      likes: 220,
      liked: false,
      bookmarks: 90,
      bookmarked: false,
      listedForSaleAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      id: "11",
      title: "Blockchain Fundamentals",
      user: { id: "user6", username: "cryptodev", profileImage: "/placeholder-avatar6.jpg" },
      videoUrl: "https://example.com/video11.mp4",
      price: 15,
      category: "Blockchain",
      likes: 130,
      liked: false,
      bookmarks: 50,
      bookmarked: false,
      listedForSaleAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      id: "12",
      title: "UX Research Methods",
      user: { id: "user7", username: "uxpro", profileImage: "/placeholder-avatar7.jpg" },
      videoUrl: "https://example.com/video12.mp4",
      price: 9,
      category: "Design",
      likes: 170,
      liked: false,
      bookmarks: 75,
      bookmarked: false,
      listedForSaleAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
  ]
}

type SortOption = "recent" | "alphabetical" | "likes" | "bookmarks"

interface FilterOptions {
  withinDays: boolean
  priceMoreThan: boolean
  priceLessThan: boolean
  likesMoreThan: boolean
  likesLessThan: boolean
}

export function Market() {
  const [userVideos, setUserVideos] = useState<Video[]>([])
  const [videosForSale, setVideosForSale] = useState<Video[]>([])
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [isListingDialogOpen, setIsListingDialogOpen] = useState(false)
  const [listingPrice, setListingPrice] = useState("")
  const [activeTab, setActiveTab] = useState("user-videos")
  const [sortOption, setSortOption] = useState<SortOption>("recent")
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    withinDays: false,
    priceMoreThan: false,
    priceLessThan: false,
    likesMoreThan: false,
    likesLessThan: false,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(3)
  const { toast } = useToast()

  useEffect(() => {
    setUserVideos(fetchUserVideos())
    setVideosForSale(fetchVideosForSale())
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchQuery, sortOption, filterOptions])

  const handleListForSale = (video: Video) => {
    setSelectedVideo(video)
    setIsListingDialogOpen(true)
  }

  const handleCancelSale = (videoId: string) => {
    setUserVideos((prevVideos) =>
      prevVideos.map((video) => (video.id === videoId ? { ...video, price: null, listedForSaleAt: null } : video)),
    )
    toast({
      title: "Sale Cancelled",
      description: "Your video has been removed from the marketplace.",
    })
  }

  const handleConfirmListing = () => {
    if (selectedVideo && listingPrice) {
      const price = Number.parseFloat(listingPrice)
      if (isNaN(price) || price <= 0) {
        toast({
          title: "Invalid Price",
          description: "Please enter a valid price (up to 4 decimal places).",
          variant: "destructive",
        })
        return
      }
      setUserVideos((prevVideos) =>
        prevVideos.map((video) =>
          video.id === selectedVideo.id ? { ...video, price, listedForSaleAt: new Date() } : video,
        ),
      )
      setIsListingDialogOpen(false)
      setListingPrice("")
      toast({
        title: "Video Listed",
        description: `Your video is now listed for sale at ${price} AR.`,
      })
    }
  }

  const handleBuyVideo = (video: Video) => {
    setVideosForSale((prevVideos) => prevVideos.filter((v) => v.id !== video.id))
    setUserVideos((prevVideos) => [...prevVideos, { ...video, price: null, listedForSaleAt: null }])
    toast({
      title: "Purchase Successful",
      description: `You have bought "${video.title}" for ${video.price} AR.`,
    })
  }

  const handleLikeVideo = (videoId: string, isUserVideo: boolean) => {
    const updateVideos = (videos: Video[]) =>
      videos.map((video) =>
        video.id === videoId
          ? { ...video, liked: !video.liked, likes: video.liked ? video.likes - 1 : video.likes + 1 }
          : video,
      )

    if (isUserVideo) {
      setUserVideos(updateVideos)
    } else {
      setVideosForSale(updateVideos)
    }
  }

  const handleBookmarkVideo = (videoId: string, isUserVideo: boolean) => {
    const updateVideos = (videos: Video[]) =>
      videos.map((video) =>
        video.id === videoId
          ? {
              ...video,
              bookmarked: !video.bookmarked,
              bookmarks: video.bookmarked ? video.bookmarks - 1 : video.bookmarks + 1,
            }
          : video,
      )

    if (isUserVideo) {
      setUserVideos(updateVideos)
    } else {
      setVideosForSale(updateVideos)
    }
  }

  const sortVideos = (videos: Video[]): Video[] => {
    switch (sortOption) {
      case "recent":
        return [...videos].sort((a, b) => {
          if (!a.listedForSaleAt && !b.listedForSaleAt) return 0
          if (!a.listedForSaleAt) return 1
          if (!b.listedForSaleAt) return -1
          return b.listedForSaleAt.getTime() - a.listedForSaleAt.getTime()
        })
      case "alphabetical":
        return [...videos].sort((a, b) => a.title.localeCompare(b.title))
      case "likes":
        return [...videos].sort((a, b) => b.likes - a.likes)
      case "bookmarks":
        return [...videos].sort((a, b) => b.bookmarks - a.bookmarks)
      default:
        return videos
    }
  }

  const filterVideos = (videos: Video[]): Video[] => {
    return videos.filter((video) => {
      if (filterOptions.withinDays) {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        if (!video.listedForSaleAt || video.listedForSaleAt < sevenDaysAgo) {
          return false
        }
      }
      if (filterOptions.priceMoreThan && video.price !== null && video.price <= 10) {
        return false
      }
      if (filterOptions.priceLessThan && video.price !== null && video.price >= 50) {
        return false
      }
      if (filterOptions.likesMoreThan && video.likes <= 100) {
        return false
      }
      if (filterOptions.likesLessThan && video.likes >= 150) {
        return false
      }
      return true
    })
  }

  const searchVideos = (videos: Video[]): Video[] => {
    if (!searchQuery) return videos
    const lowercaseQuery = searchQuery.toLowerCase()
    return videos.filter((video) => video.title.toLowerCase().includes(lowercaseQuery))
  }

  const paginateVideos = (videos: Video[]): Video[] => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return videos.slice(startIndex, startIndex + itemsPerPage)
  }

  const renderVideoGrid = (videos: Video[], isUserVideos: boolean) => {
    const processedVideos = sortVideos(searchVideos(filterVideos(videos)))
    const totalPages = Math.ceil(processedVideos.length / itemsPerPage)
    const paginatedVideos = paginateVideos(processedVideos)

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedVideos.map((video) => (
            <MarketVideoCard
              key={video.id}
              video={video}
              isUserVideo={isUserVideos}
              onListForSale={handleListForSale}
              onCancelSale={handleCancelSale}
              onBuyVideo={handleBuyVideo}
              onLike={(videoId) => handleLikeVideo(videoId, isUserVideos)}
              onBookmark={(videoId) => handleBookmarkVideo(videoId, isUserVideos)}
            />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="bg-zinc-700 text-white hover:bg-zinc-600"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={
                    currentPage === page ? "bg-zinc-500 text-white" : "bg-zinc-700 text-white hover:bg-zinc-600"
                  }
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-zinc-700 text-white hover:bg-zinc-600"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Video Marketplace</h1>

      <div className="mb-4 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 text-white border-zinc-700 focus:border-zinc-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
        </div>
        <div className="flex space-x-4">
          <Select defaultValue="recent" onValueChange={(value) => setSortOption(value as SortOption)}>
            <SelectTrigger className="w-[180px] bg-zinc-800 text-white">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 text-white">
              <SelectItem value="recent" className="hover:bg-zinc-600 focus:bg-zinc-600 focus:text-white">
                Most Recent
              </SelectItem>
              <SelectItem value="alphabetical" className="hover:bg-zinc-600 focus:bg-zinc-600 focus:text-white">
                Alphabetical
              </SelectItem>
              <SelectItem value="likes" className="hover:bg-zinc-600 focus:bg-zinc-600 focus:text-white">
                Most Likes
              </SelectItem>
              <SelectItem value="bookmarks" className="hover:bg-zinc-600 focus:bg-zinc-600 focus:text-white">
                Most Bookmarks
              </SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="bg-zinc-800 text-white hover:bg-zinc-600 hover:text-white">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-zinc-800 text-white border-zinc-700">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Filter Options</h4>
                  <p className="text-sm text-zinc-400">Select the filters you want to apply.</p>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="within-7-days"
                      checked={filterOptions.withinDays}
                      onCheckedChange={(checked) =>
                        setFilterOptions({ ...filterOptions, withinDays: checked as boolean })
                      }
                    />
                    <label htmlFor="within-7-days">Within 7 days</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="price-more-than"
                      checked={filterOptions.priceMoreThan}
                      onCheckedChange={(checked) =>
                        setFilterOptions({ ...filterOptions, priceMoreThan: checked as boolean })
                      }
                    />
                    <label htmlFor="price-more-than">Price more than 10 AR</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="price-less-than"
                      checked={filterOptions.priceLessThan}
                      onCheckedChange={(checked) =>
                        setFilterOptions({ ...filterOptions, priceLessThan: checked as boolean })
                      }
                    />
                    <label htmlFor="price-less-than">Price less than 50 AR</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="likes-more-than"
                      checked={filterOptions.likesMoreThan}
                      onCheckedChange={(checked) =>
                        setFilterOptions({ ...filterOptions, likesMoreThan: checked as boolean })
                      }
                    />
                    <label htmlFor="likes-more-than">Likes more than 100</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="likes-less-than"
                      checked={filterOptions.likesLessThan}
                      onCheckedChange={(checked) =>
                        setFilterOptions({ ...filterOptions, likesLessThan: checked as boolean })
                      }
                    />
                    <label htmlFor="likes-less-than">Likes less than 150</label>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Tabs
        defaultValue="user-videos"
        className="w-full"
        onValueChange={(value) => {
          setActiveTab(value)
          setCurrentPage(1)
        }}
      >
        <TabsList className="w-full justify-start bg-zinc-800 p-0 h-12">
          <TabsTrigger value="user-videos" className="flex-1 data-[state=active]:bg-zinc-700 rounded-none">
            Your Videos
          </TabsTrigger>
          <TabsTrigger value="videos-for-sale" className="flex-1 data-[state=active]:bg-zinc-700 rounded-none">
            Videos for Sale
          </TabsTrigger>
        </TabsList>
        <TabsContent value="user-videos" className="mt-6">
          {userVideos.length > 0 ? (
            renderVideoGrid(userVideos, true)
          ) : (
            <div className="text-center text-zinc-500">You haven't uploaded any videos yet.</div>
          )}
        </TabsContent>
        <TabsContent value="videos-for-sale" className="mt-6">
          {videosForSale.length > 0 ? (
            renderVideoGrid(videosForSale, false)
          ) : (
            <div className="text-center text-zinc-500">No videos are currently for sale.</div>
          )}
        </TabsContent>
      </Tabs>

      {/* Listing Dialog */}
      <Dialog open={isListingDialogOpen} onOpenChange={setIsListingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>List Video for Sale</DialogTitle>
            <DialogDescription>Set a price for your video. You can use up to 4 decimal places.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price (AR)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.0001"
                min="0"
                value={listingPrice}
                onChange={(e) => setListingPrice(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleConfirmListing}>
              Confirm Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


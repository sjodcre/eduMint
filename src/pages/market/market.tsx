import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { BookOpen, GraduationCap, Coins, Heart, School, Star } from 'lucide-react'

interface Course {
  id: string
  title: string
  instructor: {
    name: string
    avatar: string
  }
  thumbnail: string
  price: number
  category: string
  level: string
  rating: number
}

const courses: Course[] = [
  {
    id: '1',
    title: 'Quantum Physics',
    instructor: { name: 'Dr. Quantum', avatar: 'https://images.unsplash.com/photo-1732928352958-6a5457878319?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGZwfGVufDB8fDB8fHww' },
    thumbnail: 'https://plus.unsplash.com/premium_photo-1700942979302-72ef87e43525?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8UXVhbnR1bXxlbnwwfHwwfHx8MA%3D%3D',
    price: 5,
    category: 'Physics',
    level: '',
    rating: 4.8
  },
  {
    id: '2',
    title: 'World History',
    instructor: { name: 'Prof. Historian', avatar: 'https://source.unsplash.com/random/100x100?professor' },
    thumbnail: 'https://plus.unsplash.com/premium_photo-1693256457845-0585380de3c9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YW5jaWVudCUyMHJ1aW5zfGVufDB8fDB8fHww',
    price: 4,
    category: 'History',
    level: 'Intermediate',
    rating: 4.6
  },
  {
    id: '3',
    title: 'Creative Writing',
    instructor: { name: 'Author Extraordinaire', avatar: 'https://source.unsplash.com/random/100x100?writer' },
    thumbnail: 'https://plus.unsplash.com/premium_photo-1664811569218-0402a31e1e07?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGNyZWF0aXZlJTIwd3JpdGluZ3xlbnwwfHwwfHx8MA%3D%3D',
    price: 3,
    category: 'Literature',
    level: 'Beginner',
    rating: 4.9
  },
  {
    id: '4',
    title: 'Advanced Calculus and Real Analysis',
    instructor: { name: 'Dr. Mathgenius', avatar: 'https://source.unsplash.com/random/100x100?mathematician' },
    thumbnail: 'https://plus.unsplash.com/premium_photo-1724266846347-bd10efdd330e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    price: 6,
    category: 'Mathematics',
    level: 'Advanced',
    rating: 4.7
  },
  {
    id: '5',
    title: 'Environmental Science: Climate Change',
    instructor: { name: 'Dr. Eco', avatar: '' },
    thumbnail: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    price: 4.5,
    category: 'Environmental Science',
    level: 'Intermediate',
    rating: 4.8
  },
]

const featuredCourse = courses[0]
const trendingSubjects = ['Physics', 'History', 'Literature', 'Mathematics', 'Environmental Science']
const educatorSpotlight = {
  name: 'Dr. Innovator',
  avatar: 'https://images.unsplash.com/photo-1732928352958-6a5457878319?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGZwfGVufDB8fDB8fHww',
  description: 'Pioneering interactive online education with cutting-edge teaching methods!',
  students: 50000
}

export function Market() {
  const [wishlist, setWishlist] = useState<string[]>([])
  const { toast } = useToast()

  const toggleWishlist = (courseId: string) => {
    setWishlist(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  const handleEnrollment = (course: Course) => {
    toast({
      title: "Enrollment Successful!",
      description: `You've enrolled in "${course.title}" (${course.level}) for ${course.price} AR. Happy learning!`,
    })
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Marketplace</h1>

      {/* Featured Course */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Featured Videos</h2>
        <div className="relative rounded-lg overflow-hidden">
          <img src={featuredCourse.thumbnail} alt={featuredCourse.title} className="w-full h-64 object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <h3 className="text-xl font-bold">{featuredCourse.title}</h3>
            <p className="text-sm text-zinc-300">By {featuredCourse.instructor.name} • {featuredCourse.level}</p>
            <Button 
              className="mt-2" 
              onClick={() => handleEnrollment(featuredCourse)}
            >
              Buy now for {featuredCourse.price} AR
            </Button>
          </div>
        </div>
      </section>

      {/* Trending Subjects */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Trending</h2>
        <div className="flex flex-wrap gap-2">
          {trendingSubjects.map(subject => (
            <Badge key={subject} variant="secondary" className="text-sm">
              <BookOpen className="w-4 h-4 mr-1" />
              {subject}
            </Badge>
          ))}
        </div>
      </section>

      {/* Educator Spotlight */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Educator Spotlight</h2>
        <div className="bg-zinc-800 rounded-lg p-4 flex items-center">
          <Avatar className="w-16 h-16 mr-4">
            <AvatarImage src={educatorSpotlight.avatar} alt={educatorSpotlight.name} />
            <AvatarFallback>{educatorSpotlight.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-bold">{educatorSpotlight.name}</h3>
            <p className="text-sm text-zinc-300 mb-2">{educatorSpotlight.description}</p>
            <p className="text-sm">
              <GraduationCap className="inline w-4 h-4 mr-1" />
              {educatorSpotlight.students.toLocaleString()} students
            </p>
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Explore Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <motion.div 
              key={course.id} 
              className="bg-zinc-800 rounded-lg overflow-hidden"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                <div className="flex items-center mb-2">
                  <Avatar className="w-6 h-6 mr-2">
                    <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                    <AvatarFallback>{course.instructor.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-zinc-300">{course.instructor.name}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-400">{course.level}</span>
                  <span className="text-sm text-zinc-400 flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-400" />
                    {course.rating}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">
                    <Coins className="inline w-5 h-5 mr-1" />
                    {course.price} AR
                  </span>
                  <div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="mr-2"
                      onClick={() => toggleWishlist(course.id)}
                    >
                      <Heart className={`w-5 h-5 ${wishlist.includes(course.id) ? 'text-red-500 fill-red-500' : ''}`} />
                      <span className="sr-only">Add to wishlist</span>
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleEnrollment(course)}
                    >
                      <School className="w-4 h-4 mr-2" />
                      Enroll
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}


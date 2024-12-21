import { ConnectButton } from "@arweave-wallet-kit/react";
import AppCreateButton from "./addApp";
import EdumintLogo from "/logo-black-icon.png"

import {Link} from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 bg-black text-white flex items-center">
        <Link className="flex items-center justify-center" to="/">
          <span className="sr-only">Video Platform</span>
         <img
          src={EdumintLogo}
          width={40}
          height={50}

           />
          <span className="ml-2 text-xl font-bold">EduMint</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 bg-black">
          {/* <Link className="text-sm font-medium hover:underline underline-offset-4" to="#">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" to="#">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" to="#">
            About
          </Link> */}
          
          <ConnectButton/>
        </nav>
      </header>
   <main className="flex-1 flex flex-col justify-center">
        <section className="w-full py-12 bg-black text-white md:py-24 lg:py-32 xl:py-48 flex items-center justify-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Welcome to EduMint
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Discover, create, and share short videos with the world. Join our community of creators today!
                </p>
              </div>
              <div className="space-x-4 ">
                <AppCreateButton/>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
                <div className="p-3 bg-black bg-opacity-70 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white h-6 w-6"
                  >
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                </div>
                <h2 className="text-xl text-black font-bold">Create Short Videos</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Easily create and edit short, engaging videos right from your device.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
                <div className="p-3 bg-black bg-opacity-70 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white h-6 w-6"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h2 className="text-xl text-black font-bold">Connect with Creators</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Follow your favorite creators and discover new talent from around the world.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
                <div className="p-3 bg-black bg-opacity-70 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white h-6 w-6"
                  >
                    <polyline points="4 17 10 11 4 5" />
                    <line x1="12" y1="19" x2="20" y2="19" />
                  </svg>
                </div>
                <h2 className="text-xl text-black font-bold">Trending Content</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Stay up-to-date with the latest trends and viral content on our platform.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center justify-between px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 EduMint. All rights reserved.</p>
        <nav className="flex gap-4 sm:gap-6">
          {/* <Link className="text-xs hover:underline underline-offset-4" to="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" to="#">

            Privacy
          </Link> */}
        </nav>
      </footer>
    </div>
  )
}

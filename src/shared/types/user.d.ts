import { StringToBoolean } from "class-variance-authority/types";

export type UDLLicense =
  | "CC0"
  | "CC-BY"
  | "CC-BY-SA"
  | "CC-BY-NC"
  | "CC-BY-ND"
  | "CC-BY-NC-SA"
  | "CC-BY-NC-ND";

export type UserTier = "bronze" | "silver" | "gold" | "platinum" | "diamond";

interface User {
  id: string;
  displayName: string;
  username: string;
  profileImage: string;
  tier: string;
  followers: number;
  following: number;
  tier?: string;
  version?: number;
  followers?: number;
  following?: number;
}

interface Like {
  AutoID: number;
  PostID: number;
  UserPID: string;
  Timestamp: number;
}


interface Post {
  Id: number;
  Likes: Like;
  Comments: string;
  VideoTxId: string; 
  AuthorWallet: string;
  Author: string;
  Price: number;
  Title: string;
  SellingStatus: boolean;
  profileImage: string;
  Description: string;
  Timestamp: number;
}
interface PostLikesSummary {
  PostID: number;
  LikeCount: number;
}

interface Video {
  id: string;
  videoUrl: string;
  title: string;
  user: User;
  liked: boolean;
  autoId: number;
  likes: number;
  likeSummary: PostLikesSummary;
  comments: number;
  description: string;
  price: number;
  sellingStatus: boolean;
  bookmarked: boolean;
}

interface UserDetails {
  id: string | undefined;
  name: string;
  score: number;
  bazarId: string;
  walletAddress: string;
  displayName: string;
  username: string;
  bio: string;
  avatar: string;
  banner: string;
  tier?: string;
  version: number;
  followers?: number;
  following?: number;
}

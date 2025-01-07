// import { create } from "zustand";
// import { User } from "@/shared/types/user";
// import { ProfileHeaderType } from "@/shared/types/common";
// import { getProfileByWalletAddress } from "@/api/profile-api";

// interface StoreState {
//   profile: ProfileHeaderType | null;
//   selectedUser: User | null;
//   isProfileLoading: boolean;
//   fetchProfile: (walletAddress: string) => Promise<void>;
// }

// export const useStore = create<StoreState>((set) => ({
//   profile: null,
//   selectedUser: null,
//   isProfileLoading: false,
//   fetchProfile: async (walletAddress) => {
//     set({ isProfileLoading: true });
//     try {
//       const fetchedProfile = await getProfileByWalletAddress({ address: walletAddress });
//       set({
//         profile: fetchedProfile,
//         selectedUser: fetchedProfile
//           ? {
//               id: fetchedProfile.walletAddress,
//               displayName: fetchedProfile.displayName || "ANON",
//               username: fetchedProfile.username || "unknown",
//               profileImage: fetchedProfile.profileImage || "/default-avatar.png",
//               tier: "bronze", // Default value
//               followers: 0, // Default value
//               following: 0, // Default value
//             }
//           : null,
//       });
//     } catch (error) {
//       console.error("Error fetching profile:", error);
//     } finally {
//       set({ isProfileLoading: false });
//     }
//   },
// }));

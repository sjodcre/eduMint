
import { getProfileByWalletAddress } from "@/api/profile-api";
import { ProfileHeaderType } from "@/shared/types/common";

export async function fetchUserProfile(walletAddress: string): Promise<ProfileHeaderType> {
    const emptyProfile: ProfileHeaderType = {
        id: '', // Changed from null to empty string to match ProfileHeaderType
        walletAddress: walletAddress,
        displayName: null,
        username: null,
        bio: null,
        profileImage: null,
        banner: null,
        version: null,
    };

    if (!walletAddress) {
        return emptyProfile; // Return empty profile if no wallet address
    }

    try {
        const fetchedProfile = await getProfileByWalletAddress({ address: walletAddress });
        return fetchedProfile || emptyProfile; // Return fetched profile or empty profile
    } catch (error) {
        console.error('Error fetching profile:', error);
        return emptyProfile; // Return empty profile on error
    }
}

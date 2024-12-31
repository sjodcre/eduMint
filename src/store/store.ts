// store.ts
import { create } from "zustand";
import {
  createDataItemSigner,
  dryrun,
  message,
  result,
} from "@permaweb/aoconnect";
import { processId } from "@/shared/config/config";
import type { Video, UserDetails } from "@/shared/types/user";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const fetchWithRetry = async (
  fn: () => Promise<any>,
  retries = MAX_RETRIES,
) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await wait(RETRY_DELAY);
      return fetchWithRetry(fn, retries - 1);
    }
    throw error;
  }
};

interface StoreState {
  videos: Video[];
  userDetails: UserDetails | null;
  loading: boolean;
  error: string | null;
  fetchPlayerProfile: (activeAddress: string) => Promise<void>;
}

export const useStore = create<StoreState>((set) => ({
  videos: [],
  userDetails: null,
  loading: false,
  error: null,
  fetchPlayerProfile: async (activeAddress: string) => {
    set({ loading: true, error: null });
    try {
      // Fetch profile ID
      const profileIdRes = await fetchWithRetry(async () => {
        const response = await dryrun({
          process: "SNy4m-DrqxWl01YqGM4sxI8qCni-58re8uuJLvZPypY",
          tags: [{ name: "Action", value: "Get-Profiles-By-Delegate" }],
          signer: createDataItemSigner(window.arweaveWallet),
          data: JSON.stringify({ Address: activeAddress }),
        });
        return JSON.parse(response.Messages[0].Data);
      });

      // Fetch profile details
      const profileRes = await fetchWithRetry(async () => {
        const response = await dryrun({
          process: "YourProcessId",
          tags: [{ name: "Action", value: "Info" }],
          signer: createDataItemSigner(window.arweaveWallet),
          data: "",
        });
        return JSON.parse(response.Messages[0].Data);
      });

      // Set user details
      const userDetails: UserDetails = {
        id: activeAddress,
        name: profileRes.Profile.DisplayName || "ANON",
        score: 0,
        bazarId: profileIdRes[0].ProfileId,
        walletAddress: profileRes.Owner || "no owner",
        displayName: profileRes.Profile.DisplayName || "ANON",
        username: profileRes.Profile.UserName || "unknown",
        bio: profileRes.Profile.Bio || "",
        avatar: profileRes.Profile.ProfileImage || "default-avatar.png",
        banner: profileRes.Profile.CoverImage || "default-banner.png",
        version: profileRes.Profile.Version || 1,
      };

      set({ userDetails });

      // Fetch videos
      const videosRes = await fetchWithRetry(async () => {
        const msgRes = await message({
          process: processId,
          tags: [{ name: "Action", value: "List-Posts" }],
          signer: createDataItemSigner(window.arweaveWallet),
        });

        const postResult = await result({
          process: processId,
          message: msgRes,
        });

        return JSON.parse(postResult.Messages[0].Data);
      });

      set({ videos: videosRes, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));

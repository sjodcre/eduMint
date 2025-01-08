"use client";

import React from "react";
import arconnect from "../assets/arconnect.png";
import othentImage from "../assets/othent.svg";
import { User } from "@/shared/types/user";
import { ProfileHeaderType } from "@/shared/types/common";
import { getProfileByWalletAddress } from "@/api/profile-api";
import othent from "@/shared/lib/othent";

export enum WalletEnum {
  arConnect = "arconnect",
  othent = "othent",
}

export const WALLET_PERMISSIONS = [
  "ACCESS_ADDRESS",
  "ACCESS_PUBLIC_KEY",
  "SIGN_TRANSACTION",
  "DISPATCH",
  "SIGNATURE",
];

export const AR_WALLETS = [
  { type: WalletEnum.arConnect, logo: arconnect },
  { type: WalletEnum.othent, logo: othentImage },
];

interface ArweaveContextState {
  wallets: { type: WalletEnum; logo: string }[];
  wallet: any;
  walletAddress: string | null;
  walletType: WalletEnum | null;
  handleConnect: any;
  handleDisconnect: () => void;
  walletModalVisible: boolean;
  setWalletModalVisible: (open: boolean) => void;
  profile: ProfileHeaderType | null;
  isProfileLoading: boolean;
  setIsProfileLoading: (isLoading: boolean) => void;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
}

interface ArweaveProviderProps {
  children: React.ReactNode;
}

const DEFAULT_CONTEXT: ArweaveContextState = {
  wallets: [],
  wallet: null,
  walletAddress: null,
  walletType: null,
  handleConnect() {},
  handleDisconnect() {},
  walletModalVisible: false,
  setWalletModalVisible(_open: boolean) {},
  profile: null,
  isProfileLoading: false,
  setIsProfileLoading: (_isLoading: boolean) => {},
  selectedUser: null,
  setSelectedUser(_user: User | null) {},
};

const ARContext = React.createContext<ArweaveContextState>(DEFAULT_CONTEXT);

export function useArweaveProvider(): ArweaveContextState {
  return React.useContext(ARContext);
}

// function WalletList(props: { handleConnect: any }) {
// 	return (
// 		<div className="h-full w-full flex items-center justify-center gap-5 flex-wrap py-5 pt-5">
// 			{AR_WALLETS.map((wallet: any, index: number) => (
// 				<button
// 					key={index}
// 					onClick={() => props.handleConnect(wallet.type)}
// 					className="w-[200px] flex flex-col items-center justify-center text-center p-[15px] border border-solid border-gray-300 hover:bg-gray-100"
// 				>
// 					<img src={`${wallet.logo}`} alt={''} className="w-[30px] rounded-full mb-[10px]" />
// 					<span className="text-gray-900 text-base font-bold font-sans">
// 						{wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)}
// 					</span>
// 				</button>
// 			))}
// 			<div className="my-[5px] mb-5 px-5 text-center">
// 				<span className="text-sm font-medium text-gray-600">
// 					Don't have an Arweave Wallet? You can create one{' '}
// 					<a href="https://arconnect.io" target="_blank" className="text-sm font-medium">
// 						here.
// 					</a>
// 				</span>
// 			</div>
// 		</div>
// 	);
// }

export function ArweaveProvider(props: ArweaveProviderProps) {
  // const { connected } = useConnection();

  const wallets = AR_WALLETS;
  const [isProfileLoading, setIsProfileLoading] = React.useState<boolean>(false);
  const [wallet, setWallet] = React.useState<any>(null);
  const [walletType, setWalletType] = React.useState<WalletEnum | null>(null);
  const [walletModalVisible, setWalletModalVisible] =
    React.useState<boolean>(false);
  const [walletAddress, setWalletAddress] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<ProfileHeaderType | null>(null);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    handleWallet();
    window.addEventListener("arweaveWalletLoaded", handleWallet);
    window.addEventListener("walletSwitch", handleWallet);

    return () => {
      window.removeEventListener("arweaveWalletLoaded", handleWallet);
      window.removeEventListener("walletSwitch", handleWallet);
    };
    // }, [connected]);
  }, []);

  React.useEffect(() => {
    (async function () {
      if (wallet && walletAddress) {
        try {
          const fetchedProfile = await getProfileByWalletAddress({ address: walletAddress }, setIsProfileLoading);
          setProfile(fetchedProfile);
          console.log("profile at useEffect with wallet, walletAddress, walletType: ", fetchedProfile);
          
          if (fetchedProfile === null || fetchedProfile?.version === null) {
            setSelectedUser(null);
          } else {
            setSelectedUser({
              id: fetchedProfile.walletAddress,
              displayName: fetchedProfile.displayName || "ANON", 
              username: fetchedProfile.username || "unknown",
              profileImage: fetchedProfile.profileImage || "/default-avatar.png",
              tier: "bronze", // Default value
              followers: 0, // Default value
              following: 0 // Default value
            });
          }
        } catch (e: any) {
          console.error(e);
        }
      }
    })();
  // }, [wallet, walletAddress, walletType]);
}, [wallet, walletAddress]);


  // async function handleWallet() {
  //   // console.log("handleWallet localStorage.getItem('walletType'): ", localStorage.getItem('walletType'));
  //   // if (localStorage.getItem('walletType'))
  //   // console.log("handleWallet connected: ", connected);
  //   if (connected) {

  //     try {
  //       // await handleConnect(localStorage.getItem('walletType') as any);
  //       await handleConnect();

  //     } catch (e: any) {
  //       console.error(e);
  //     }
  //   }
  // }

  async function handleWallet() {
    if (localStorage.getItem("walletType")) {
      try {
        setProfile(null);
        // setSelectedUser(null);
        await handleConnect(localStorage.getItem("walletType") as any);
      } catch (e: any) {
        console.error(e);
      }
    }
  }

  // async function handleConnect(walletType: WalletEnum.arConnect | WalletEnum.othent) {
  // async function handleConnect() {

  //   let walletObj: any = null;
  //   handleArConnect();

  //   setWalletModalVisible(false);
  //   return walletObj;
  // }

  async function handleConnect(
    walletType: WalletEnum,
  ) {
    // async function handleConnect() {
    let walletObj: any = null;
    switch (walletType) {
      case WalletEnum.arConnect:
        handleArConnect();
        break;
      case WalletEnum.othent:
        handleOthent();
        break;
      default:
        if (window.arweaveWallet || walletType === WalletEnum.arConnect) {
          handleArConnect();
          break;
        }
    }
    setWalletModalVisible(false);
    return walletObj;
    // let walletObj: any = null;
    // handleArConnect();

    // setWalletModalVisible(false);
    // return walletObj;
  }

  async function handleArConnect() {
    console.log("handleArConnect walletAddress: ", walletAddress);
    // console.log("handleArConnect window.arweaveWallet: ", window.arweaveWallet);
    if (!walletAddress) {
      // if (window.arweaveWallet && connected) {
      if (window.arweaveWallet) {
        try {
          await global.window?.arweaveWallet?.connect(
            WALLET_PERMISSIONS as any,
          );
          setWalletAddress(await window.arweaveWallet.getActiveAddress());
          setWallet(window.arweaveWallet);
          setWalletType(WalletEnum.arConnect);
          setWalletModalVisible(false);
          localStorage.setItem("walletType", WalletEnum.arConnect);
        } catch (e: any) {
          console.error(e);
        }
      }
    }
  }

  async function handleOthent() {
    try {
      // Check if the user is already authenticated
      // await global.window?.arweaveWallet?.connect(WALLET_PERMISSIONS as any);
      // console.log("othent.isAuthenticated", othent.isAuthenticated)
      if (!othent.isAuthenticated) {
        // Prompt user to authenticate
        await othent.connect();
      }
      // console.log("othent.isAuthenticated after", othent.isAuthenticated)
      console.log("othent", othent);
      // await othent.requireAuth();
      // await othent.requireAuth();

      // Obtain the user's wallet address:
      const address = await othent.getActiveAddress();

      console.log(`Your wallet address is ${address}.`);
      // Retrieve the user's wallet address
      // const address = await othent.getActiveAddress();
      // Set wallet and address in your application's state
      setWallet(othent);
      setWalletAddress(address);
      setWalletType(WalletEnum.othent);
      localStorage.setItem("walletType", WalletEnum.othent);

      console.log("User connected:", address);
    } catch (error) {
      console.error("Error connecting to Othent:", error);
    }
  }

  // async function handleDisconnect() {
  //   if (localStorage.getItem('walletType')) localStorage.removeItem('walletType');
  //   await window?.arweaveWallet?.disconnect();
  //   setWallet(null);
  //   setWalletAddress(null);
  //   setProfile(null);
  // }

  async function handleDisconnect() {
    if (localStorage.getItem("walletType"))
      localStorage.removeItem("walletType");
    if (walletType === WalletEnum.othent) {
      await othent.disconnect();
    } else {
      await global.window?.arweaveWallet?.disconnect();
    }
    setWallet(null);
    setWalletAddress(null);
    setProfile(null);
    setSelectedUser(null);
  }

  return (
    <>
      <ARContext.Provider
        value={{
          wallet,
          walletAddress,
          walletType,
          handleConnect,
          handleDisconnect,
          wallets,
          walletModalVisible,
          setWalletModalVisible,
          profile,
          isProfileLoading,
          setIsProfileLoading,
          selectedUser,
          setSelectedUser,
        }}
      >
        {props.children}
      </ARContext.Provider>
    </>
  );
}

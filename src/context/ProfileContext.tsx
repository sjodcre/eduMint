"use client";

import React from 'react';
import arconnect from '/pre.png';
import { getProfileByWalletAddress } from '@/lib/ProfileUtils';
import { useConnection } from '@arweave-wallet-kit/react';
import { User } from '@/types/user';

// import { connect } from '@othent/kms';
// import * as Othent from '@othent/kms';

// import { getProfileByWalletAddress, getVouch, readHandler } from 'api';

// import { Modal } from 'components/molecules/Modal';
// import { AO, AR_WALLETS, REDIRECTS, WALLET_PERMISSIONS } from 'helpers/config';
// import { getARBalanceEndpoint } from 'helpers/endpoints';
// import { VouchType, WalletEnum } from 'helpers/types';
// import { useLanguageProvider } from 'providers/LanguageProvider';

// import * as S from './styles';
export enum WalletEnum {
  arConnect = 'arconnect',
  // othent = 'othent'
}

// export const WALLET_PERMISSIONS = ['ACCESS_ADDRESS', 'ACCESS_PUBLIC_KEY', 'SIGN_TRANSACTION', 'DISPATCH', 'SIGNATURE'];


export const AR_WALLETS = [
  { type: WalletEnum.arConnect, logo: arconnect },
  // { type: WalletEnum.othent, logo: ASSETS.othent },
];

export type VouchType = { score: number; isVouched: boolean };

interface ArweaveContextState {
  wallets: { type: WalletEnum; logo: string }[];
  wallet: any;
  walletAddress: string | null;
  walletType: WalletEnum | null;
  arBalance: number | null;
  // tokenBalances: { [address: string]: { profileBalance: number; walletBalance: number } } | null;
  toggleTokenBalanceUpdate: boolean;
  setToggleTokenBalanceUpdate: (toggleUpdate: boolean) => void;
  handleConnect: any;
  handleDisconnect: () => void;
  walletModalVisible: boolean;
  setWalletModalVisible: (open: boolean) => void;
  profile: ProfileHeaderType | null;
  toggleProfileUpdate: boolean;
  setToggleProfileUpdate: (toggleUpdate: boolean) => void;
  vouch: VouchType | null;
  selectedUser: User | null;
  setSelectedUser: (user: User| null) => void;
}

interface ArweaveProviderProps {
  children: React.ReactNode;
}

export type AOProfileType = {
  id: string;
  walletAddress: string;
  displayName: string | null;
  username: string | null;
  bio: string | null;
  profileImage: string | null;
  banner: string | null;
  version: string | null;
};

export type ProfileHeaderType = AOProfileType;

const DEFAULT_CONTEXT: ArweaveContextState = {
  wallets: [],
  wallet: null,
  walletAddress: null,
  walletType: null,
  arBalance: null,
  // tokenBalances: null,
  toggleTokenBalanceUpdate: false,
  setToggleTokenBalanceUpdate(_toggleUpdate: boolean) { },
  handleConnect() { },
  handleDisconnect() { },
  walletModalVisible: false,
  setWalletModalVisible(_open: boolean) { },
  profile: null,
  toggleProfileUpdate: false,
  setToggleProfileUpdate(_toggleUpdate: boolean) { },
  vouch: null,
  selectedUser: null,
  setSelectedUser(_user: User | null) { }
};

const ARContext = React.createContext<ArweaveContextState>(DEFAULT_CONTEXT);

export function useArweaveProvider(): ArweaveContextState {
  return React.useContext(ARContext);
}

export function ArweaveProvider(props: ArweaveProviderProps) {

  const { connected } = useConnection();

  const wallets = AR_WALLETS;

  const [wallet, setWallet] = React.useState<any>(null);
  const [walletType, setWalletType] = React.useState<WalletEnum | null>(null);
  const [walletModalVisible, setWalletModalVisible] = React.useState<boolean>(false);
  const [walletAddress, setWalletAddress] = React.useState<string | null>(null);
  // @ts-ignore: TS6133
  const [vouch, setVouch] = React.useState<VouchType | null>(null);
  // @ts-ignore: TS6133
  const [arBalance, setArBalance] = React.useState<number | null>(null);
  const [toggleTokenBalanceUpdate, setToggleTokenBalanceUpdate] = React.useState<boolean>(false);

  const [profile, setProfile] = React.useState<ProfileHeaderType | null>(null);
  const [toggleProfileUpdate, setToggleProfileUpdate] = React.useState<boolean>(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    handleWallet();
    window.addEventListener('arweaveWalletLoaded', handleWallet);
    window.addEventListener('walletSwitch', handleWallet);

    return () => {
      window.removeEventListener('arweaveWalletLoaded', handleWallet);
      window.removeEventListener('walletSwitch', handleWallet);
    };
  }, [connected]);


  React.useEffect(() => {
    (async function () {
      if (wallet && walletAddress) {
        try {
          setProfile(await getProfileByWalletAddress({ address: walletAddress }));
        } catch (e: any) {
          console.error(e);
        }
      }
    })();
  }, [connected, wallet, walletAddress, walletType]);

  React.useEffect(() => {
    (async function () {
      if (wallet && walletAddress) {
        const fetchProfileUntilChange = async () => {
          let changeDetected = false;
          let tries = 0;
          const maxTries = 10;

          while (!changeDetected && tries < maxTries) {
            try {
              const existingProfile = profile;
              const newProfile = await getProfileByWalletAddress({ address: walletAddress });

              if (JSON.stringify(existingProfile) !== JSON.stringify(newProfile)) {
                setProfile(newProfile);
                changeDetected = true;
              } else {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                tries++;
              }
            } catch (error) {
              console.error(error);
              break;
            }
          }

          if (!changeDetected) {
            console.warn(`No changes detected after ${maxTries} attempts`);
          }
        };

        await fetchProfileUntilChange();
      }
    })();
  }, [toggleProfileUpdate]);


  async function handleWallet() {
    // console.log("handleWallet localStorage.getItem('walletType'): ", localStorage.getItem('walletType'));
    // if (localStorage.getItem('walletType')) 
    // console.log("handleWallet connected: ", connected);
    if (connected) {

      try {
        // await handleConnect(localStorage.getItem('walletType') as any);
        await handleConnect();

      } catch (e: any) {
        console.error(e);
      }
    }
  }

  // async function handleConnect(walletType: WalletEnum.arConnect | WalletEnum.othent) {
  async function handleConnect() {

    let walletObj: any = null;
    handleArConnect();

    setWalletModalVisible(false);
    return walletObj;
  }

  async function handleArConnect() {
    // console.log("handleArConnect walletAddress: ", walletAddress);
    // console.log("handleArConnect window.arweaveWallet: ", window.arweaveWallet);
    if (!walletAddress) {
      if (window.arweaveWallet && connected) {
        try {
          // await global.window?.arweaveWallet?.connect(WALLET_PERMISSIONS as any);
          setWalletAddress(await window.arweaveWallet.getActiveAddress());
          setWallet(window.arweaveWallet);
          setWalletType(WalletEnum.arConnect);
          setWalletModalVisible(false);
          localStorage.setItem('walletType', WalletEnum.arConnect);
        } catch (e: any) {
          console.error(e);
        }
      }
    }
  }

  async function handleDisconnect() {
    if (localStorage.getItem('walletType')) localStorage.removeItem('walletType');
    await window?.arweaveWallet?.disconnect();
    setWallet(null);
    setWalletAddress(null);
    setProfile(null);
  }


  return (
    <>
      <ARContext.Provider
        value={{
          wallet,
          walletAddress,
          walletType,
          arBalance,
          toggleTokenBalanceUpdate,
          setToggleTokenBalanceUpdate,
          handleConnect,
          handleDisconnect,
          wallets,
          walletModalVisible,
          setWalletModalVisible,
          profile,
          toggleProfileUpdate,
          setToggleProfileUpdate,
          vouch,
          selectedUser,
          setSelectedUser
        }}
      >
        {props.children}
      </ARContext.Provider>
    </>
  );
}

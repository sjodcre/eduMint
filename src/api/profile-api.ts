import { processIdRegistry } from "@/shared/config/config";
import { ProfileHeaderType, TagType } from "@/shared/types";
import { dryrun } from "@permaweb/aoconnect";

// export async function getProfileByWalletAddress(args: { address: string }): Promise<ProfileHeaderType | null> {
// 	const emptyProfile = {
// 		id: "",
// 		walletAddress: args.address,
// 		displayName: null,
// 		username: null,
// 		bio: null,
// 		profileImage: null,
// 		banner: null,
// 		version: null,
// 	};

// 	try {
// 		console.log("fetching profile for: ", args.address);
// 		const profileLookup = await readHandler({
// 			processId: processIdRegistry, 
// 			action: 'Get-Profiles-By-Delegate',
// 			data: { Address: args.address },
// 		});
// 		console.log("profileLookup: ", profileLookup);
// 		let activeProfileId: string = "";
// 		if (profileLookup && profileLookup.length > 0 && profileLookup[0].ProfileId) {
// 			activeProfileId = profileLookup[0].ProfileId;
// 		}
// 		console.log("activeProfileId: ", activeProfileId);
// 		if (activeProfileId) {
// 			const fetchedProfile = await readHandler({
// 				processId: activeProfileId,
// 				action: 'Info',
// 				data: null,
// 			});
// 			console.log("fetchedProfile: ", fetchedProfile);
// 			if (fetchedProfile) {
// 				return {
// 					id: activeProfileId,
// 					walletAddress: fetchedProfile.Owner || null,
// 					displayName: fetchedProfile.Profile.DisplayName || null,
// 					username: fetchedProfile.Profile.UserName || null,
// 					bio: fetchedProfile.Profile.Description || null,
// 					profileImage: fetchedProfile.Profile.ProfileImage || null,
// 					banner: fetchedProfile.Profile.CoverImage || null,
// 					version: fetchedProfile.Profile.Version || null,
// 				};
// 			} else return emptyProfile;
// 		} else return emptyProfile;
// 	} catch (e: any) {
// 		throw new Error(e);
// 	}
// }

export async function getProfileByWalletAddress(
	args: { address: string },
	setIsProfileLoading: (isLoading: boolean) => void
  ): Promise<ProfileHeaderType | null> {
	const emptyProfile = {
	  id: "",
	  walletAddress: args.address,
	  displayName: null,
	  username: null,
	  bio: null,
	  profileImage: null,
	  banner: null,
	  version: null,
	};

	if (!args.address) {
        return emptyProfile; // Return empty profile if no wallet address
    }
  
	setIsProfileLoading(true);
  
	try {
	  console.log("fetching profile for: ", args.address);
	  const profileLookup = await readHandler({
		processId: processIdRegistry,
		action: "Get-Profiles-By-Delegate",
		data: { Address: args.address },
	  });
	  console.log("profileLookup: ", profileLookup);
	  let activeProfileId: string = "";
	  if (profileLookup && profileLookup.length > 0 && profileLookup[0].ProfileId) {
		activeProfileId = profileLookup[0].ProfileId;
	  }
	  console.log("activeProfileId: ", activeProfileId);
	  if (activeProfileId) {
		const fetchedProfile = await readHandler({
		  processId: activeProfileId,
		  action: "Info",
		  data: null,
		});
		console.log("fetchedProfile: ", fetchedProfile);
		if (fetchedProfile) {
		  return {
			id: activeProfileId,
			walletAddress: fetchedProfile.Owner || null,
			displayName: fetchedProfile.Profile.DisplayName || null,
			username: fetchedProfile.Profile.UserName || null,
			bio: fetchedProfile.Profile.Description || null,
			profileImage: fetchedProfile.Profile.ProfileImage || null,
			banner: fetchedProfile.Profile.CoverImage || null,
			version: fetchedProfile.Profile.Version || null,
		  };
		} else return emptyProfile;
	  } else return emptyProfile;
	} catch (e: any) {
	  throw new Error(e);
	} finally {
	  setIsProfileLoading(false);
	}
  }


export async function readHandler(args: {
	processId: string;
	action: string;
	tags?: TagType[];
	data?: any;
}): Promise<any> {
	const tags = [{ name: 'Action', value: args.action }];
	if (args.tags) tags.push(...args.tags);
	let data = JSON.stringify(args.data || {});

	const response = await dryrun({
		process: args.processId,
		tags: tags,
		data: data,
	});

	if (response.Messages && response.Messages.length) {
		if (response.Messages[0].Data) {
			return JSON.parse(response.Messages[0].Data);
		} else {
			if (response.Messages[0].Tags) {
				return response.Messages[0].Tags.reduce((acc: any, item: any) => {
					acc[item.name] = item.value;
					return acc;
				}, {});
			}
		}
	}
}

// export async function fetchAndSetProfile() {
//     const arProvider = useArweaveProvider();
    
//     // Check if the user is connected
//     if (arProvider.walletAddress) {
//         try {
//             // Attempt to get the profile by wallet address
//             const fetchedProfile: ProfileHeaderType | null = await getProfileByWalletAddress({ address: arProvider.walletAddress });
            
//             // Set the profile in the provider
//             arProvider.setProfile(fetchedProfile || {
//                 id: null,
//                 walletAddress: arProvider.walletAddress,
//                 displayName: null,
//                 username: null,
//                 bio: null,
//                 avatar: null,
//                 banner: null,
//                 version: null,
//             });

//             // Construct the subheader
//             const subheader = arProvider.profile && arProvider.profile.id 
//                 ? arProvider.profile.username 
//                 : 'Create Profile'; // or any default message

//             return { profile: fetchedProfile, subheader };
//         } catch (error) {
//             console.error('Error fetching profile:', error);
//             return { profile: null, subheader: 'Error fetching profile' };
//         }
//     } else {
//         // Return empty profile and a message indicating the user is not connected
//         return {
//             profile: {
//                 id: null,
//                 walletAddress: null,
//                 displayName: null,
//                 username: null,
//                 bio: null,
//                 avatar: null,
//                 banner: null,
//                 version: null,
//             },
//             subheader: 'Connect your wallet to create a profile',
//         };
//     }
// }
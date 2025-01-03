// source: https://github.com/ArweaveTeam/arweave-js + https://docs.arweavekit.com/wallets/wallet-kit
import Arweave from "arweave";
import {useApi } from "arweave-wallet-kit";


const arweave = Arweave.init({});

export async function transferAR( sender:string, recipient: string) {
  const api = useApi();
  if (!api) {
    throw new Error("Arweave Wallet not connected");
  }

  if (sender === recipient) {
    // toast({
    //   description: "Cannot tip yourself!"
    // });
    console.log("Cannot tip yourself!");
    return;
  }

  const quantity = "0.001";

  let transaction = await arweave.createTransaction({
    target: recipient,
    quantity: arweave.ar.arToWinston(quantity),
  });

  await api.sign(transaction);
  const response = await arweave.transactions.post(transaction);
  if (response.status === 200) {
    // toast({
    //   description: "Tip successful!",
    // });
    console.log("Tip successful!");
  }
  console.log(response);
  return transaction;
}

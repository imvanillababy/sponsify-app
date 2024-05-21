import React, { useMemo, useEffect, useState } from "react";
import { ethers } from "ethers";
import Abi from "../artifact/Sponsify.json";

const Transaction = ({ ispending, setispending, onClose, loading, setLoading }) => {
  const contractAddress = "0x7fBBdb1Db302C06750a30cA825Dca9c3B6e76135";
  const RELAYER_PRIVATE_KEY ="baced1297f569a8e02962b7618c4ce6fc9bff2fd394849e0249175608a2597ae";
  const _RELAYER_PRIVATE_KEY = process.env.REACT_APP_RELAYER_PRIVATE_KEY;
  const providerUrl = "https://pre-rpc.bittorrentchain.io/";

  const ethereum = useMemo(() => window.ethereum, []);

  useEffect(() => {
    if (!ethereum) {
      alert("Please initialize Ethereum");
    }
  }, [ethereum]);

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");

  const usdtTokenAddresses = [
    { label: "USDT", value: "0xb1ea59521a88405d313d412f3f3efcf4a329f2dc" },
    // Add more token addresses as needed
  ];

  const hashMessage = (message) => {
    return ethers.utils.id(message);
  };

  const relayTransaction = async (signedTransaction, transaction, signerAddress) => {
    setLoading(true);
    try {
      const provider = new ethers.providers.JsonRpcProvider(providerUrl);
      const wallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);
      
      const messageSigner = await signedTransaction.then((value) =>
        ethers.utils.recoverAddress(hashMessage(JSON.stringify(transaction)), value)
      );

      if (messageSigner !== signerAddress) {
        throw new Error("Signer address mismatch");
      }

      const txResponse = await wallet.sendTransaction(transaction);
      const receipt = txResponse.hash;
      handleSaveData(receipt);

      setTimeout(() => {
        setispending(true);
        setLoading(false);
      }, 3000);

      return txResponse.hash;
    } catch (error) {
      console.error("Error relaying transaction:", error);
      setLoading(false);
      throw error;
    }
  };

  const signAndRelayTransferUSDT = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, Abi.abi, signer);

      const data = contract.interface.encodeFunctionData("transferUSDT", [recipient, amount]);
      const transaction = { to: contractAddress, data };

      const signedTransaction = await signer.signMessage(JSON.stringify(transaction));
      const signerAddress = await signer.getAddress();

      await relayTransaction(signedTransaction, transaction, signerAddress);
      onClose();
    } catch (error) {
      console.error("Error signing and relaying transaction:", error);
    }
  };

  const handleSaveData = (receipt) => {
    const trx = { recipient, amount, receipt };
    const existingData = sessionStorage.getItem("alltrxs");
    const existingArray = existingData ? JSON.parse(existingData) : [];
    const updatedArray = [...existingArray, trx];
    sessionStorage.setItem("alltrxs", JSON.stringify(updatedArray));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="max-w-xl text-[#131f38] font-myfont mx-auto bg-[#f8fbff] rounded-lg p-12 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Sign Transaction</h2>
        <div className="mb-6">
          <label htmlFor="recipient" className="font-semibold mb-2">Recipient Address</label>
          <input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-400"
            placeholder="Enter recipient address"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="amount" className="font-semibold mb-4">Token Amount</label>
          <input
            type="text"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-400"
            placeholder="Enter token amount"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="tokenAddress" className="font-semibold mb-4">USDT Token Address</label>
          <select
            id="tokenAddress"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-400"
            required
          >
            <option value="" disabled>Select USDT token address</option>
            {usdtTokenAddresses.map((token) => (
              <option key={token.value} value={token.value}>{token.label}</option>
            ))}
          </select>
        </div>
        <div className="space-x-4">
          <button
            onClick={signAndRelayTransferUSDT}
            className="mt-2 text-white bg-[#7f98e9] font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Sign transaction
          </button>
          <button
            onClick={onClose}
            className="mt-4 text-gray-600 hover:text-gray-800 font-semibold focus:outline-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Transaction;

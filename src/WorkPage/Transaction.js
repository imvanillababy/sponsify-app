import React from "react";
import Abi from "../artifact/Sponsify.json";
import { useMemo, useEffect, useState } from "react";
import { ethers } from "ethers";

const Transaction = ({
  ispending,
  setispending,
  onClose,
  loading,
  setLoading,
}) => {
  const contractAddress = "0x7fBBdb1Db302C06750a30cA825Dca9c3B6e76135";
  // const usdtAddress = "0xb1ea59521a88405d313d412f3f3efcf4a329f2dc";

  const RELAYER_PRIVATE_KEY =
    "baced1297f569a8e02962b7618c4ce6fc9bff2fd394849e0249175608a2597ae";

  const ethereum = useMemo(() => {
    return window.ethereum;
  });

  useEffect(() => {
    if (!ethereum) {
      alert("plz initialize ethereum");
    }
  }, []);

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  // const [receipt, setReceipt] = useState("");

  // Dummy list of USDT token addresses for the dropdown
  const usdtTokenAddresses = [
    { label: "USDT ", value: "0xb1ea59521a88405d313d412f3f3efcf4a329f2dc" },
    // Add more token addresses as needed
  ];

  function hashMessage(message) {
    const hashedMessage = ethers.utils.id(message); // Using ethers.js utility function `id` for hashing
    return hashedMessage;
  }

  // Function to relay a signed transaction to the blockchain using a relayer
  const relayTransaction = async (
    signedTransaction,
    transaction,
    signerAddress
  ) => {
    setLoading(true);
    console.log("Relaying transaction...",signerAddress);
    try {
      const providerUrl = "https://pre-rpc.bittorrentchain.io/";
      const provider = new ethers.providers.JsonRpcProvider(providerUrl);

      const messageSigner = signedTransaction.then((value) => {
        const verifySigner = ethers.utils.recoverAddress(
          hashMessage(JSON.stringify(transaction)),
          value
        );
        return verifySigner;
      });

      const address = await messageSigner;
      console.log(address,signerAddress)

      if (address !== signerAddress) {
        return;
      } else {
        // Create a wallet instance from the relayer's private key
        const wallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);
        console.log("Wallet address:", wallet.address);

        setTimeout(() => {
          // Your function or code here
          setispending(true);
          setLoading(false);
        }, 3000); // 3000 milliseconds = 3 seconds

        // Send the signed transaction
        const txResponse = await wallet.sendTransaction(transaction);
        const receipt = `${txResponse.hash}`;
        console.log("Transaction relayed:", txResponse.hash);

        handleSaveData(receipt);

        return txResponse.hash;
      }
    } catch (error) {
      console.error("Error relaying transaction:", error);
      throw error;
    }
  };

  // Function to sign and relay the transferUSDT transaction
  const signAndRelayTransferUSDT = async () => {
    // handleSaveData();

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(contractAddress, Abi.abi, signer);

      const data = contract.interface.encodeFunctionData("transferUSDT", [
        recipient,
        amount,
      ]);

      const transaction = {
        to: contractAddress,
        data: data,
      };

      // Sign the transaction
      const signedTransaction = await signer.signMessage(
        JSON.stringify(transaction)
      );

      console.log(
        "Transaction signed:",
        signedTransaction,
        signer.getAddress()
      );

      // Relay (broadcast) the signed transaction using a relayer

      console.log("Relaying transaction..." + ispending);

      const filter = {
        address: contractAddress,
        topics: [
          ethers.utils.id("transferUSDT(address,uint256)"), // Event signature (Transfer event)
          null,
          ethers.utils.hexZeroPad(
            "0x438C383A9eaF108B5C0ac3fACE55553349087F05",
            32
          ), // Filter by specific address (sender or receiver)
        ],
      };

      // Fetch and process transaction logs

      const logs = await provider.getLogs(filter);
      console.log(logs);

      onClose();

      const txHash = await relayTransaction(
        signedTransaction,
        transaction,
        signer.getAddress()
      );
    } catch (error) {
      console.error("Error signing and relaying transaction:", error);
    }
  };

  const handleSaveData = (receipt) => {
    // Create an object containing the data
    const trx = {
      recipient,
      amount,
      receipt,
    };

    // Retrieve existing data from sessionStorage (if any)
    const existingData = sessionStorage.getItem("alltrxs");
    const existingArray = existingData ? JSON.parse(existingData) : [];

    // Append new transaction data to the existing array
    const updatedArray = [...existingArray, trx];
    console.log(updatedArray);

    // Store the updated array in sessionStorage
    sessionStorage.setItem("alltrxs", JSON.stringify(updatedArray));
  };

  // Call the signAndRelayTransferUSDT function to sign and relay the transaction

  return (
    <div className="fixed inset-0 z-50  flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="max-w-xl text-[#131f38] font-myfont mx-auto  bg-[#f8fbff] rounded-lg p-12 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Sign Transaction</h2>

        <div className="mb-6">
          <label htmlFor="recipient" className=" font-semibold mb-2">
            Recipient Address
          </label>
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
          <label htmlFor="amount" className=" font-semibold mb-4">
            Token Amount
          </label>
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
          <label htmlFor="tokenAddress" className=" font-semibold mb-4">
            USDT Token Address
          </label>
          <select
            id="tokenAddress"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-400"
            required
          >
            <option value="" disabled>
              Select USDT token address
            </option>
            {usdtTokenAddresses.map((token) => (
              <option key={token.value} value={token.value}>
                {token.label}
              </option>
            ))}
          </select>
        </div>

        <div className=" space-x-4">
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

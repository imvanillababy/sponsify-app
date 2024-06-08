import React, { useMemo, useEffect, useState } from "react";
import { ethers } from "ethers";
import Abi from "../artifact/Sponsify.json";

const Transaction = ({ setispending, onClose, setLoading }) => {
  const contractAddress = "0xc7A72d861A0F02Dde2dC6a872d3fAA28c3dbbb94";
  const RELAYER_PRIVATE_KEY =
    process.env.REACT_APP_RELAYER_PRIVATE_KEY ||
    "cf47abdb48329f76a36de63ec047e78a298c26d490b247dcbdaf21f42ec73df9";
  const providerUrl = "https://pre-rpc.bittorrentchain.io/";

  const ethereum = useMemo(() => window.ethereum, []);

  const [buttonState, setButtonState] = useState("Sign Transaction");

  useEffect(() => {
    if (!ethereum) {
      alert("Please initialize Ethereum");
    }
  }, []);

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");

  // const hashMessage = (message) => {
  //   return ethers.utils.id(message);
  // };

  const TokenAbi = [
    "function approve(address _spender, uint256 _value) external returns (bool success)",
    "function allowance(address owner, address spender) external view returns (uint256)",
  ];

  const relayTransaction = async (transaction) => {
    setLoading(true);
    try {
      const provider = new ethers.providers.JsonRpcProvider(providerUrl);
      const wallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);

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

  const getAllowance = async () => {
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    const wallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);
    const tokenContract = new ethers.Contract(tokenAddress, TokenAbi, wallet);

    const allowance = await tokenContract.allowance(
      wallet.address,
      contractAddress
    );
    return allowance;
  };

  const approveTokenByRelayer = async () => {
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    const wallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);
    const tokenContract = new ethers.Contract(tokenAddress, TokenAbi, wallet);

    const amountInWei = ethers.utils.parseUnits(amount, 18); // Adjust decimals if needed
    const allowance = await getAllowance();

    if (allowance.lt(amountInWei)) {
      const tx = await tokenContract.approve(contractAddress, amountInWei);
      await tx.wait();
      console.log("Token approved by relayer:", tx);
    } else {
      console.log("Token already approved with sufficient allowance");
    }
  };

  const signAndRelayTransferUSDT = async () => {
    try {
      setButtonState("Checking for approval..");
      await approveTokenByRelayer();

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, Abi.abi, signer);

      const data = contract.interface.encodeFunctionData("transferUSDT", [
        tokenAddress,
        recipient,
        amount,
      ]);

      console.log("data", data);
      const transaction = { to: contractAddress, data };

      onClose();

      setButtonState("Sign Transaction");

      await relayTransaction(transaction);
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
          <label htmlFor="recipient" className="font-semibold mb-2">
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
          <label htmlFor="amount" className="font-semibold mb-4">
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
          <label htmlFor="tokenAddress" className="font-semibold mb-4">
            Token Address
          </label>
          <input
            type="text"
            id="tokenAddress"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-400"
            placeholder="Enter token address"
          />
        </div>

        <div className="space-x-4">
          <button
            onClick={signAndRelayTransferUSDT}
            className="mt-2 text-white bg-[#7f98e9] font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {buttonState}
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

import React, { useMemo, useEffect, useState } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";

const Transaction = ({ setispending, onClose, setLoading ,getProviderUrl }) => {


  const relayerPrivateKey = process.env.REACT_APP_API_URL;


    //0x681aF9B69b8912CDA69adC59F167910536688BC8
  const [providerUrl, setProviderUrl] = useState("https://rpc.frax.com");



  // Fetch provider URL when the component mounts
  useEffect(() => {

    
    const fetchProviderUrl = async () => {
      const url = await getProviderUrl();
      if (url) {
        setProviderUrl(url);
      }
    };

    fetchProviderUrl();
  }, []);

  console.log("Provider URL:", providerUrl);

  const ethereum = useMemo(() => window.ethereum, []);
  const [buttonState, setButtonState] = useState("Sign Transaction");
  const [address, setAddress] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [relayerWallet, setRelayerWallet] = useState(null);

  const provider = useMemo(() => {
    if (providerUrl !== "") {
      return new ethers.providers.JsonRpcProvider(providerUrl);
    } else {
      return null;
    }
  }, [providerUrl]);

  const signer = useMemo(() => {
    if (address && provider) {
      return provider.getSigner(address);
    } else {
      return null;
    }
  }, [address, provider]);

  useEffect(() => {
    const initialize = async () => {
      if (!ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setAddress(accounts[0]);

      const relayerWalletInstance = new ethers.Wallet(
        relayerPrivateKey,
        provider
      );
      setRelayerWallet(relayerWalletInstance);
    };

    initialize();

    // Cleanup function
    return () => {
      setRelayerWallet(null);
    };
  }, [ethereum, provider, relayerPrivateKey]);

  const TokenAbi = [
    "function approve(address _spender, uint256 _value) external returns (bool success)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address owner) external view returns (uint256)",
    "function transfer(address _to, uint256 _value) external returns (bool success)",
  ];

  const relayTransaction = async (transaction) => {
    setLoading(true);
    try {
      console.log("Relaying transaction:", transaction);
      const txResponse = await relayerWallet.sendTransaction(transaction);
      console.log("Transaction response:", txResponse);

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
      alert("Transaction failed. Please try again.");
      throw error;
    }
  };

  const getAllowance = async () => {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, TokenAbi, signer);
      const allowance = await tokenContract.allowance(
        address,
        relayerWallet.address
      );
      console.log("Allowance:", allowance.toString());
      return allowance;
    } catch (error) {
      console.error("Error getting allowance:", error);
      throw error;
    }
  };

  const getBalance = async () => {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, TokenAbi, signer);
      const balance = await tokenContract.balanceOf(address);
      console.log("Balance:", balance.toString());
      return Number(balance);
    } catch (error) {
      console.error("Error getting balance:", error);
      throw error;
    }
  };

  const approveTokenByRelayer = async () => {
    setButtonState("Checking for approval...");

    if (!tokenAddress) {
      alert("Token address is required.");
      setButtonState("Sign Transaction");
      return;
    }

    try {
      const tokenContract = new ethers.Contract(tokenAddress, TokenAbi, signer);
      const amountInWei = ethers.utils.parseUnits(amount, 18);
      const balance = await getBalance();
      console.log("Balance:", balance);
      console.log("Amount:", Number(amountInWei));

      if (balance < Number(amountInWei)) {
        toast.info("Insufficient balance");
        setButtonState("Sign Transaction");
        onClose();
        return;
      }

      const allowance = await getAllowance();

      if (allowance.lt(amountInWei)) {
        setButtonState("Approving token...");
        const approveData = tokenContract.interface.encodeFunctionData(
          "approve",
          [relayerWallet.address, amountInWei]
        );

        const approveTransaction = { to: tokenAddress, data: approveData };
        const signedTransaction = await relayerWallet.sendTransaction(
          approveTransaction
        );
        console.log("Approve transaction sent:", signedTransaction);
      } else {
        console.log("Token already approved with sufficient allowance");
      }

      signAndRelayTransferUSDT();
    } catch (error) {
      console.error("Error during approval process:", error.message);
      toast.error("Approval failed. Please try again.");
      setButtonState("Sign Transaction");
    }
  };

  const signAndRelayTransferUSDT = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await window.ethereum.enable(); // Request user's permission to connect to MetaMask

      const signer = provider.getSigner();
      const contract = new ethers.Contract(tokenAddress, TokenAbi, signer);

      const data = contract.interface.encodeFunctionData("transfer", [
        recipient,
        ethers.utils.parseUnits(amount, 18),
      ]);

      console.log("Data to relay:", data);

      // Sign the message using MetaMask
      const signedMessage = await signer.signMessage(data);
      console.log("Signed message:", signedMessage);

      const transaction = { to: tokenAddress, data };

      setButtonState("Signing & Relaying Transaction...");

      onClose();

      await relayTransaction(transaction); // Assuming this function handles transaction relay
    } catch (error) {
      console.error("Error signing and relaying transaction:", error);
      alert("Transaction failed. Please try again.");
    }
  };

  const handleSaveData = (receipt) => {
    const trx = { recipient, amount, receipt };
    const existingData = sessionStorage.getItem("alltrxs");
    const existingArray = existingData ? JSON.parse(existingData) : [];
    const updatedArray = [...existingArray, trx];
    sessionStorage.setItem("alltrxs", JSON.stringify(updatedArray));
  };

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`max-w-xl text-[#131f38] font-myfont mx-auto bg-[#f8fbff] rounded-lg p-12 shadow-lg transform transition-transform duration-300 ${
          isOpen ? "scale-100" : "scale-95"
        }`}
      >
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
            onClick={approveTokenByRelayer}
            className="mt-2 text-white bg-[#7f98e9] font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {buttonState}
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              setTimeout(onClose, 300); // Give time for transition to complete before closing
            }}
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

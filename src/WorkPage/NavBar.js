import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify"; // Import toast

const NavBar = () => {
  const [walletAddress, setWalletAddress] = useState(sessionStorage.getItem("walletAddress") || null);

  const connectToMetaMask = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        sessionStorage.setItem("walletAddress", address);
        setWalletAddress(address);
        console.log("Connected to MetaMask with address:", address);
      } else {
        console.log("MetaMask extension not detected");
        toast.error("MetaMask extension not detected");
      }
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      alert("Error connecting to MetaMask");
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && walletAddress) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          console.log("Wallet is already connected with address:", walletAddress);
        } else {
          sessionStorage.removeItem("walletAddress");
          setWalletAddress(null);
        }
      }
    };

    checkConnection();

    // Add event listeners for account and network changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          sessionStorage.removeItem("walletAddress");
          setWalletAddress(null);
        } else {
          sessionStorage.setItem("walletAddress", accounts[0]);
          setWalletAddress(accounts[0]);
        }
        window.location.reload();
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [walletAddress]);

  return (
    <div className="px-1">
      <header className="w-full font-myfont mt-5 text-gray-700 bg-[#f8fbff] rounded-md shadow-md body-font">
        <div className="container flex flex-col items-start justify-between p-6 mx-auto md:flex-row">
          <a className="flex items-center mb-4 text-xl font-bold text-gray-900 title-font md:mb-0">
            Sponsify
          </a>
          <div className="flex space-x-4 items-center justify-center h-full">
            <p onClick={() => toast.info("Not available yet. Stay tuned")} className="text-[#7f98e9] text-lg cursor-pointer">Be a sponsor</p>
            <button
              onClick={connectToMetaMask}
              className="px-4 py-2 bg-[#7f98e9] text-xs font-bold text-white uppercase transition-all duration-150 rounded shadow outline-none hover:shadow-md focus:outline-none ease"
            >
              {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect Wallet"}
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default NavBar;

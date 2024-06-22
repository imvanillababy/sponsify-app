import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { toast, ToastContainer } from "react-toastify"; // Import toast
import 'react-toastify/dist/ReactToastify.css';

const NavBar = () => {
  const [walletAddress, setWalletAddress] = useState(sessionStorage.getItem("walletAddress") || null);
  const targetChainId = 199; // BTTC mainnet chain ID

  const connectToMetaMask = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        sessionStorage.setItem("walletAddress", address);
        setWalletAddress(address);
        toast.info("Connected: " + address);
        console.log("Connected:", address);
        checkChainId(); // Check and switch chain if necessary
      } else {
        console.log("MetaMask extension not detected");
        toast.error("MetaMask extension not detected");
      }
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      toast.error("Error connecting to MetaMask");
    }
  };

  const checkChainId = async () => {
    try {
      if (window.ethereum) {
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (parseInt(currentChainId, 16) !== targetChainId) {
          await switchChain();
        }
      }
    } catch (error) {
      console.error("Error checking chain ID:", error);
      toast.error("Error checking chain ID");
    }
  };

  const switchChain = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.utils.hexValue(targetChainId) }],
      });
      toast.info("Switched to BTTC mainnet");
    } catch (switchError) {
      if (switchError.code === 4902) {
        // Chain not added to MetaMask
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: ethers.utils.hexValue(targetChainId),
                chainName: 'BitTorrent Chain Mainnet',
                rpcUrls: ['https://rpc.bt.io'],
                nativeCurrency: {
                  name: 'BitTorrent',
                  symbol: 'BTT',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://bttcscan.com'],
              },
            ],
          });
          toast.info("BTTC mainnet added to MetaMask");
        } catch (addError) {
          console.error("Error adding BTTC mainnet:", addError);
          toast.error("Error adding BTTC mainnet");
        }
      } else {
        console.error("Error switching to BTTC mainnet:", switchError);
        toast.error("Error switching to BTTC mainnet");
      }
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      const address = accounts[0];
      sessionStorage.setItem("walletAddress", address);
      setWalletAddress(address);
      toast.info("Account changed to: " + address);
    } else {
      sessionStorage.removeItem("walletAddress");
      setWalletAddress(null);
      toast.warning("Disconnected from MetaMask");
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && walletAddress) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          console.log("Wallet is already connected with address:", walletAddress);
          checkChainId(); // Check and switch chain if necessary
        } else {
          sessionStorage.removeItem("walletAddress");
          setWalletAddress(null);
        }
      }
    };

    checkConnection();

    // Add event listeners for account and network changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);

      window.ethereum.on("chainChanged", () => {
        sessionStorage.removeItem("walletAddress");
        setWalletAddress(null);
        window.location.reload();
      });

      window.ethereum.on("disconnect", () => {
        sessionStorage.removeItem("walletAddress");
        setWalletAddress(null);
        toast.warning("Disconnected from MetaMask");
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);

        window.ethereum.removeListener("chainChanged", () => {
          sessionStorage.removeItem("walletAddress");
          setWalletAddress(null);
          window.location.reload();
        });

        window.ethereum.removeListener("disconnect", () => {
          sessionStorage.removeItem("walletAddress");
          setWalletAddress(null);
          toast.warning("Disconnected from MetaMask");
        });
      }
    };
  }, [walletAddress]);

  return (
    <div className="px-1">
      <header className="w-full font-myfont mt-5 text-gray-700 bg-[#f8fbff] rounded-md shadow-md body-font">
        <div className="container flex flex-col items-start justify-between p-6 mx-auto md:flex-row">
          <div className="flex items-center justify-evenly mb-4 text-xl font-bold text-gray-900 title-font md:mb-0">
            Sponsify
          </div>
          <div className="flex space-x-4 items-center justify-center h-full">
            <p onClick={() => toast.info("Not available yet. Stay tuned ")} className="text-[#7f98e9] text-lg cursor-pointer">Be a sponsor</p>
            <button
              onClick={connectToMetaMask}
              className="px-4 py-2 bg-[#7f98e9] text-xs font-bold text-white uppercase transition-all duration-150 rounded shadow outline-none hover:shadow-md focus:outline-none ease"
            >
              {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect Wallet"}
            </button>
          </div>
        </div>
      </header>
      <ToastContainer />
    </div>
  );
};

export default NavBar;

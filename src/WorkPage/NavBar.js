import React, { useEffect } from "react";
import { ethers } from "ethers";

const NavBar = () => {


  const connectToMetaMask = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        sessionStorage.setItem("walletAddress",address);
        console.log("Connected to MetaMask with address:", address);
      
      } else {
        console.log("MetaMask extension not detected");
      }
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  };

  useEffect(() => {
    connectToMetaMask();
  },[])

  return (
    <div class=" px-1  ">
      <header class="w-full font-myfont mt-5 text-gray-700 bg-[#f8fbff] rounded-md  shadow-md body-font">
        <div class="container flex flex-col items-start justify-between p-6 mx-auto md:flex-row">
          <a class="flex items-center mb-4  text-xl font-bold   text-gray-900 title-font md:mb-0">
            Sponsify
          </a>
          <div class="items-center h-full">
            <button
              onClick={connectToMetaMask}
              className="px-4 py-2  bg-[#7f98e9]
                    text-xs font-bold text-white uppercase transition-all duration-150  rounded shadow outline-none hover:shadow-md focus:outline-none ease"
            >
              {sessionStorage.getItem("walletAddress")!==null?"Connected":"Connect Wallet"}
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default NavBar;

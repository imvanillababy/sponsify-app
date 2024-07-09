import React, { useEffect } from "react";
import Transaction from "./Transaction";
import { useState } from "react";
import NavBar from "./NavBar";
import { toast } from "react-toastify";
import { ethers } from "ethers";

const Header = ({ ispending, setispending }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const getProviderUrl = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        if (network.chainId === 252) {
          return "https://rpc.frax.com";
        } else {
          toast.info("Invalid chain");
          return null;
        }
      } catch (error) {
        console.error("Error getting network:", error);
        return null;
      }
    } else {
      console.error("Ethereum object not found, install MetaMask.");
      return null;
    }
  };

  useEffect(() => {
    getProviderUrl();
  }, []);

  return (
    <div>
      <div className="bg-[#e5ebff] max-w-6xl mx-auto text-[#131f38] font-myfont rounded-lg py-8">
        <NavBar />
        <div className="container flex flex-col mx-auto bg-[#f8fbff] rounded-lg pt-12 my-5">
          <div className="container flex flex-col items-center gap-16 mx-auto my-32">
            <div className="flex flex-col gap-7">
              <div className="flex flex-col gap-2 px-6 text-center w-10/12 mx-auto">
                <h2 className=" font-extrabold leading-tight lg:text-4xl text-dark-grey-900">
                  <span className="text-4xl">Sponsify</span>{" "}
                  <span className="text-4xl">
                    {" "}
                    By Vanilla ! Ads pay , Transaction plays
                  </span>
                </h2>
                <p className="text-base font-medium leading-7 text-dark-grey-600">
                  Innovatively tackling transaction fees while revolutionizing
                  advertising...
                </p>
              </div>
              <div className="flex items-center justify-center">
                <button
                  onClick={handleOpenPopup}
                  className="flex bg-[#7f98e9] items-center justify-center py-4 text-white px-7 rounded-2xl  focus:ring-4 focus:ring-purple-blue-100 transition duration-300"
                >
                  {loading === false ? "Transfer Tokens" : "Loading ad..."}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPopup && (
        <Transaction
          loading={loading}
          getProviderUrl={getProviderUrl}
          showPopup={showPopup}
          setLoading={setLoading}
          ispending={ispending}
          setispending={setispending}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
};

export default Header;

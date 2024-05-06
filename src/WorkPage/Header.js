import React from "react";
import Transaction from "./Transaction";
import { useState } from "react";
import NavBar from "./NavBar";

const Header = ({ ispending, setispending }) => {

  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div>
      <div className="bg-[#e5ebff] max-w-6xl mx-auto text-[#131f38] font-myfont rounded-lg py-8">
<NavBar/>
        <div className="container flex flex-col mx-auto bg-[#f8fbff] rounded-lg pt-12 my-5">
          <div className="container flex flex-col items-center gap-16 mx-auto my-32">
            <div className="flex flex-col gap-7">
              <div className="flex flex-col gap-2 px-6 text-center w-10/12 mx-auto">
                <h2 className=" font-extrabold leading-tight lg:text-4xl text-dark-grey-900">
                  <span className="text-4xl">Sponsify</span>{" "}
                  <span className="text-3xl">
                    By Vanilla ! Ads pay , Transaction plays
                  </span>
                </h2>
                <p className="text-base font-medium leading-7 text-dark-grey-600">
                  We hit a snag... maybe it's time to head back to our main
                  page.
                </p>
              </div>
              <div className="flex items-center justify-center">
                <button onClick={handleOpenPopup} className="flex bg-[#7f98e9] items-center justify-center py-4 text-white px-7 rounded-2xl  focus:ring-4 focus:ring-purple-blue-100 transition duration-300">
                 {loading===false?"Transfer Usdd":"Loading ad..."}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPopup && <Transaction loading={loading} setLoading={setLoading}  ispending={ispending} setispending={setispending} onClose={handleClosePopup} />}
    </div>
  );
};

export default Header;

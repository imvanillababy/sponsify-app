import React from "react";
import Header from "./Header";
import Package from "./Package";
import { useState } from "react";


const Main = () => {
  const [ispending, setispending] = useState(false);

  return (
    <div className="bg-[#e5ebff]">
      <Header ispending={ispending} setispending={setispending} />
      <Package ispending={ispending} setispending={setispending} />
    
    </div>
  );
};

export default Main;

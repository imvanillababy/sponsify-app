import React, { useState } from 'react';
import Transaction from './Transaction';
import Ad from './Ad';
import TrxList from './TrxList';

const Package = ({ ispending, setispending }) => {
  

  return (
    <div className=''>
     
       {/* <Transaction ispending={ispending} setispending={setispending} /> */}
      <Ad ispending={ispending} setispending={setispending} />
      <TrxList /> 
    </div>
  );
};

export default Package;



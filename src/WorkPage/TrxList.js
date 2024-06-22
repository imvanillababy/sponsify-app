import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
const TrxList = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const storedData = sessionStorage.getItem("alltrxs");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      const reversedTransactions = parsedData.slice().reverse(); // Reverse the order of transactions
      setTransactions(reversedTransactions);
    }
  }, []);

  return (
    <div className="flex font-myfont  justify-center i h-screen ">
      <div className="relative bg-[#f8fbff]  max-w-[900px] h-[600px] w-full flex flex-col rounded-[10px] border-[1px] shadow-md">
        <div className="flex items-center justify-between rounded-t-2xl bg-white px-4 pb-4 pt-4 shadow-2xl">
          <button className="linear bg-[#f8fbff] rounded-[20px] px-4 py-2 text-base font-medium text-brand-500 transition duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:active:bg-white/20">
            Transactions
          </button>
        </div>
        <div className="w-full bg-[#f8fbff] overflow-x-scroll  px-4 md:overflow-x-hidden">
          <table className="w-full mt-6 min-w-[500px]" role="table">
            <thead>
              <tr>
                <th
                  className="text-start uppercase tracking-wide text-gray-600 sm:text-xs lg:text-xs"
                  style={{ cursor: "pointer" }}
                >
                  Address
                </th>
                <th
                  className="text-start uppercase tracking-wide text-gray-600 sm:text-xs lg:text-xs"
                  style={{ cursor: "pointer" }}
                >
                  Amount
                </th>
                <th
                  className="text-start uppercase tracking-wide text-gray-600 sm:text-xs lg:text-xs"
                  style={{ cursor: "pointer" }}
                >
                  Status
                </th>
              </tr>
            </thead>

            {transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <tbody>
                  <tr key={index} className="mt-2">
                    <td className="py-3 text-sm">
                      <p className="text-sm font-medium text-navy-700 dark:text-white">
                        {transaction.recipient}
                      </p>
                    </td>
                    <td className="py-3 text-sm">
                      <p className="text-md font-medium text-gray-600 dark:text-white">
                        {transaction.amount}
                      </p>
                    </td>
                    <td className="py-3 text-sm">
                      <Link
                        to={`https://bttcscan.com/tx/${transaction.receipt}`}
                        className="text-md font-medium text-[#7f98e9] "
                      >
                        Success
                      </Link>
                    </td>
                  </tr>
                </tbody>
              ))
            ) : (
              <div className="mt-8 font-semibold text-gray-700 ">No transactions recorded</div>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrxList;

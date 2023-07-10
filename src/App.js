import React from 'react'
import { Alchemy, Network } from 'alchemy-sdk';
import { useEffect, useState } from 'react';
import { utils } from 'ethers';

const apiSettings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemyAPI = new Alchemy(apiSettings);

function App() {
  const [blockNumber, setBlockNumber] = useState();
  const [blockTransactionList, setBlockTransactionList] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState("");

  useEffect(() => {
    async function fetchBlockNumber() {
      setBlockNumber(await alchemyAPI.core.getBlockNumber());
    }
    fetchBlockNumber();
  }, []);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const { transactions } = await alchemyAPI.core.getBlockWithTransactions(blockNumber);
        setBlockTransactionList(transactions);
      } catch (error) {
        setBlockTransactionList([]);
      }
    }
    fetchTransactions();
  }, [blockNumber]);

  const onSelectTransaction = (hash) => {
    if (blockTransactionList.length === 0) setSelectedTransaction('');

    setSelectedTransaction(hash);
  }

  const calculateFee = (transaction, decimalPlaces) => {
    const gasFee = transaction.gasLimit * transaction.gasPrice;

    if (gasFee.toString() === "NaN") return "0";

    return parseFloat(utils.formatEther(gasFee.toString())).toFixed(decimalPlaces);
  }

  const goPreviousBlock = () => {
    const previousBlocknumber = blockNumber - 1 < 0 ? 0 : blockNumber - 1;
    setBlockNumber(previousBlocknumber);
  }

  const goNextBlock = () => {
    const nextBlocknumber = blockNumber + 1;
    setBlockNumber(nextBlocknumber);
  }

  const extractSubstring = (data, length) => {
    try {
      return `${data.substring(0, length)}...`;
    } catch (error) {
      return '';
    }
  }

  const findTransaction = (hash) => {
    const transactions = [...blockTransactionList];
    const transactionIndex = transactions.findIndex(tx => tx.hash === hash);
    if (transactionIndex >= 0) return transactions[transactionIndex];

    return {};
  }

  const Block = () => {
    return (
      <div className="text-center my-8">
        <h2 className="text-xl font-bold">Block Details</h2>
        <div className="flex justify-center items-center mt-6">
          <button className="mx-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => goPreviousBlock()}>
            Previous Block
          </button>
          <p className='font-bold'>Block Number: {blockNumber}</p>
          <button className="mx-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => goNextBlock()}>
            Next Block
          </button>
        </div>
      </div>
    );
  }

  const Transactions = () => {
    return (
      <div className="overflow-y-auto h-[300px] mt-6">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="bg-blue-500 text-white">
              {/* other table headers here */}
              <th className="py-2 px-4">Transaction Hash</th>
              <th className="py-2 px-4">Block</th>
              <th className="py-2 px-4">From</th>
              <th className="py-2 px-4">To</th>
              <th className="py-2 px-4">Confirmations</th>
              <th className="py-2 px-4">Value</th>
              <th className="py-2 px-4">Transaction Fee</th>
              <th className="py-2 px-4">Data</th>
            </tr>
          </thead>
          <tbody>
            {blockTransactionList.map(transaction => {
              return (
                <tr key={transaction.hash} className="cursor-pointer hover:bg-blue-200"
                  onClick={() => onSelectTransaction(transaction.hash)}>
                  <td className="border-t py-2 px-4">{extractSubstring(transaction.hash, 10)}</td>
                  <td className="border-t py-2 px-4">{transaction.blockNumber}</td>
                  <td className="border-t py-2 px-4">{extractSubstring(transaction.from, 15)}</td>
                  <td className="border-t py-2 px-4">{extractSubstring(transaction.to, 15)}</td>
                  <td className="border-t py-2 px-4">{transaction.confirmations}</td>
                  <td className="border-t py-2 px-4">{parseFloat(utils.formatEther(transaction.value.toString())).toFixed(12)}</td>
                  <td className="border-t py-2 px-4">{calculateFee(transaction, 5)}</td>
                  <td className="border-t py-2 px-4">{extractSubstring(transaction.data, 15)}</td>
                  {/* other table data here */}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    );
  }


  const Detail = (props) => {
    return (
      <div className="flex justify-between mb-2">
        <p className="font-bold">{props.name}: </p>
        <p className="flex-wrap text-left flex-grow">{props.value}</p>
      </div>
    );
  }

  const TransactionDetail = (props) => {
    return (
      <div className="my-6 border rounded p-6 shadow-md">
        <h3 className="text-center text-xl font-bold mb-4">Transaction Details</h3>
        <Detail name={"Transaction Hash"} value={props.transaction.hash} />
        <Detail name={"Block"} value={props.transaction.blockNumber} />
        <Detail name={"From"} value={props.transaction.from} />
        <Detail name={"To"} value={props.transaction.to} />
        <Detail name={"Confirmations"} value={props.transaction.confirmations} />
        <Detail name={"Value"} value={props.transaction?.value ? parseFloat(utils.formatEther(props.transaction?.value.toString())) : "0"} />
        <Detail name={"Transaction Fee"} value={calculateFee(props.transaction, 18)} />
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-2 items-start">
        <div className="text-left md:col-span-1 overflow-auto whitespace-normal break-all">
        <p className="md:col-span-1"><span className='font-bold'>Data:</span> {props.transaction.data} </p> 
        </div>
</div>


      </div>
    );
  }


  return (
    <>
      <Block />
      <Transactions />
      <TransactionDetail transaction={findTransaction(selectedTransaction)} />
    </>
  );
}

export default App;


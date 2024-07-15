import React from 'react';

const shortenString = (str) => str ? `${str.slice(0, 3)}...${str.slice(-3)}` : 'null';

export default function TransactionTable({ transfers, address }) {
  transfers = transfers ? transfers.slice().reverse() : [];
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead className="sticky top-0 bg-gray-200">
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">TxIns</th>
            <th className="py-2 px-4 border-b">TxOuts</th>
          </tr>
        </thead>
        <tbody>
          {transfers?.map((transfer, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b">{shortenString(transfer.id)}</td>
              <td className="py-2 px-4 border-b">
                {transfer.txIns.map((txIn, txInIndex) => (
                  <div key={txInIndex}>
                    {txIn.txOutId ? shortenString(txIn.txOutId) : 'Coinbase'} (Index: {txIn.txOutIndex})
                  </div>
                ))}
              </td>
              <td className="py-2 px-4 border-b">
                {transfer.txOuts.map((txOut, txOutIndex) => (
                  <div key={txOutIndex}>
                    Address: {txOut.address === address ? 'You' : shortenString(txOut.address)}, Amount: {txOut.amount}
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

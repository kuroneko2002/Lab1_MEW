import React from 'react';

const shortenString = (str) => str ? `${str.slice(0, 3)}...${str.slice(-3)}` : 'null';

const BlockchainTable = ({ data }) => {
  const latestBlocks = data.slice().reverse(); // Get the latest 5 blocks and reverse them to show the latest at the top

  return (
    <div className="overflow-y-auto max-h-96">
      <table className="border-separate border-spacing-2 border border-slate-500  min-w-full bg-white rounded-lg">
        <thead className="sticky top-0 bg-slate-400">
          <tr>
            <th className="border border-slate-600 py-2 px-10 border-b">Index</th>
            <th className="border border-slate-600 py-2 px-10 border-b">Previous Hash</th>
            <th className="border border-slate-600 py-2 px-10 border-b">Timestamp</th>
            <th className="border border-slate-600 py-2 px-10 border-b">Hash</th>
            <th className="border border-slate-600 py-2 px-10 border-b">Difficulty</th>
            <th className="border border-slate-600 py-2 px-10 border-b">Nonce</th>
            <th className="border border-slate-600 py-2 px-10 border-b">Transactions</th>
          </tr>
        </thead>
        <tbody>
          {latestBlocks.map((block, blockIndex) => (
            <tr key={blockIndex}>
              <td className="border border-slate-700 py-2 px-10 border-b">{block.index}</td>
              <td className="border border-slate-700 py-2 px-10 border-b">{block.previousHash ? shortenString(block.previousHash) : 'null'}</td>
              <td className="border border-slate-700 py-2 px-10 border-b">{new Date(block.timestamp * 1000).toLocaleString()}</td>
              <td className="border border-slate-700 py-2 px-10 border-b">{shortenString(block.hash)}</td>
              <td className="border border-slate-700 py-2 px-10 border-b">{block.difficulty}</td>
              <td className="border border-slate-700 py-2 px-10 border-b">{block.nonce}</td>
              <td className="border border-slate-700 py-2 px-10 border-b">
                {block.transactions.map((tx, txIndex) => (
                  <div key={txIndex} className="mb-2">
                    <div><strong>ID:</strong> {shortenString(tx.id)}</div>
                    <div>
                      <strong>Inputs:</strong>
                      <ul>
                        {tx.txIns.map((input, inputIndex) => (
                          <li key={inputIndex}>{shortenString(input.txOutId)}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Outputs:</strong>
                      <ul>
                        {tx.txOuts.map((output, outputIndex) => (
                          <li key={outputIndex}>
                            <span>{shortenString(output.address)}</span>: <span>{output.amount}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
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

export default BlockchainTable;

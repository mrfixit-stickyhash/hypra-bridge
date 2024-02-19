import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';

// Placeholder ABIs and addresses - replace these with your actual contract details
const hypraLockboxABI = [{"type":"constructor","stateMutability":"nonpayable","inputs":[{"type":"address","name":"_xerc20","internalType":"address"},{"type":"address","name":"_erc20","internalType":"address"},{"type":"bool","name":"_isNative","internalType":"bool"}]},{"type":"error","name":"IXERC20Lockbox_Native","inputs":[]},{"type":"error","name":"IXERC20Lockbox_NotNative","inputs":[]},{"type":"error","name":"IXERC20Lockbox_WithdrawFailed","inputs":[]},{"type":"event","name":"Deposit","inputs":[{"type":"address","name":"_sender","internalType":"address","indexed":false},{"type":"uint256","name":"_amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"Withdraw","inputs":[{"type":"address","name":"_sender","internalType":"address","indexed":false},{"type":"uint256","name":"_amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"contract IERC20"}],"name":"ERC20","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"IS_NATIVE","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"contract IPermit2"}],"name":"PERMIT2","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"contract IXERC20"}],"name":"XERC20","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"deposit","inputs":[{"type":"uint256","name":"_amount","internalType":"uint256"}]},{"type":"function","stateMutability":"payable","outputs":[],"name":"deposit","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"depositWithPermitAllowance","inputs":[{"type":"uint256","name":"_amount","internalType":"uint256"},{"type":"address","name":"_owner","internalType":"address"},{"type":"tuple","name":"_permit","internalType":"struct IAllowanceTransfer.PermitSingle","components":[{"type":"tuple","name":"details","internalType":"struct IAllowanceTransfer.PermitDetails","components":[{"type":"address","name":"token","internalType":"address"},{"type":"uint160","name":"amount","internalType":"uint160"},{"type":"uint48","name":"expiration","internalType":"uint48"},{"type":"uint48","name":"nonce","internalType":"uint48"}]},{"type":"address","name":"spender","internalType":"address"},{"type":"uint256","name":"sigDeadline","internalType":"uint256"}]},{"type":"bytes","name":"_signature","internalType":"bytes"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"withdraw","inputs":[{"type":"uint256","name":"_amount","internalType":"uint256"}]},{"type":"receive","stateMutability":"payable"}]; // ABI for Hypra lockbox contract
const polygonLockboxABI = [{"type":"constructor","stateMutability":"nonpayable","inputs":[{"type":"address","name":"_xerc20","internalType":"address"},{"type":"address","name":"_erc20","internalType":"address"},{"type":"bool","name":"_isNative","internalType":"bool"}]},{"type":"error","name":"IXERC20Lockbox_Native","inputs":[]},{"type":"error","name":"IXERC20Lockbox_NotNative","inputs":[]},{"type":"error","name":"IXERC20Lockbox_WithdrawFailed","inputs":[]},{"type":"event","name":"Deposit","inputs":[{"type":"address","name":"_sender","internalType":"address","indexed":false},{"type":"uint256","name":"_amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"Withdraw","inputs":[{"type":"address","name":"_sender","internalType":"address","indexed":false},{"type":"uint256","name":"_amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"contract IERC20"}],"name":"ERC20","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"IS_NATIVE","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"contract IPermit2"}],"name":"PERMIT2","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"contract IXERC20"}],"name":"XERC20","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"deposit","inputs":[{"type":"uint256","name":"_amount","internalType":"uint256"}]},{"type":"function","stateMutability":"payable","outputs":[],"name":"deposit","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"depositWithPermitAllowance","inputs":[{"type":"uint256","name":"_amount","internalType":"uint256"},{"type":"address","name":"_owner","internalType":"address"},{"type":"tuple","name":"_permit","internalType":"struct IAllowanceTransfer.PermitSingle","components":[{"type":"tuple","name":"details","internalType":"struct IAllowanceTransfer.PermitDetails","components":[{"type":"address","name":"token","internalType":"address"},{"type":"uint160","name":"amount","internalType":"uint160"},{"type":"uint48","name":"expiration","internalType":"uint48"},{"type":"uint48","name":"nonce","internalType":"uint48"}]},{"type":"address","name":"spender","internalType":"address"},{"type":"uint256","name":"sigDeadline","internalType":"uint256"}]},{"type":"bytes","name":"_signature","internalType":"bytes"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"withdraw","inputs":[{"type":"uint256","name":"_amount","internalType":"uint256"}]},{"type":"receive","stateMutability":"payable"}]; // ABI for Polygon lockbox contract
const hypraBridgeABI = [{"type":"event","name":"ActionConsumed","inputs":[{"type":"bytes32","name":"id","internalType":"bytes32","indexed":true},{"type":"uint256","name":"nonce","internalType":"uint256","indexed":true},{"type":"address","name":"receiver","internalType":"address","indexed":false},{"type":"uint256","name":"amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"ActionCreated","inputs":[{"type":"bytes32","name":"id","internalType":"bytes32","indexed":true},{"type":"uint256","name":"nonce","internalType":"uint256","indexed":true},{"type":"address","name":"receiver","internalType":"address","indexed":false},{"type":"uint256","name":"amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"ActionRequested","inputs":[{"type":"bytes32","name":"id","internalType":"bytes32","indexed":true}],"anonymous":false},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"actionCounter","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"actions","inputs":[{"type":"bytes32","name":"","internalType":"bytes32"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"success","internalType":"bool"}],"name":"authorizeAction","inputs":[{"type":"bytes32","name":"action","internalType":"bytes32"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"authorizedActions","inputs":[{"type":"bytes32","name":"","internalType":"bytes32"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bytes32","name":"actionId","internalType":"bytes32"}],"name":"burn","inputs":[{"type":"address","name":"_recipient","internalType":"address"},{"type":"uint256","name":"_amount","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"consumedActions","inputs":[{"type":"bytes32","name":"","internalType":"bytes32"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"gasCost","inputs":[]},{"type":"function","stateMutability":"pure","outputs":[{"type":"bytes32","name":"actionId","internalType":"bytes32"}],"name":"getActionId","inputs":[{"type":"uint256","name":"chainId","internalType":"uint256"},{"type":"uint256","name":"_nonce","internalType":"uint256"},{"type":"address","name":"_recipient","internalType":"address"},{"type":"uint256","name":"_amount","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"chainId","internalType":"uint256"}],"name":"getChainId","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"init","inputs":[{"type":"uint256","name":"_peer","internalType":"uint256"},{"type":"address","name":"xerc20","internalType":"address"},{"type":"address","name":"_admin","internalType":"address"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"success","internalType":"bool"}],"name":"mint","inputs":[{"type":"address","name":"_recipient","internalType":"address"},{"type":"uint256","name":"nonce","internalType":"uint256"},{"type":"uint256","name":"amount","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address"}],"name":"oracleAdmin","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"peerChain","inputs":[]},{"type":"function","stateMutability":"payable","outputs":[{"type":"bool","name":"success","internalType":"bool"}],"name":"requestAuthorization","inputs":[{"type":"bytes32","name":"action","internalType":"bytes32"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"setGas","inputs":[{"type":"uint256","name":"_gasCost","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address"}],"name":"xToken","inputs":[]}]; // ABI for Hypra bridge contract
const polygonBridgeABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"id","type":"bytes32"},{"indexed":true,"internalType":"uint256","name":"nonce","type":"uint256"},{"indexed":false,"internalType":"address","name":"receiver","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ActionConsumed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"id","type":"bytes32"},{"indexed":true,"internalType":"uint256","name":"nonce","type":"uint256"},{"indexed":false,"internalType":"address","name":"receiver","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ActionCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"id","type":"bytes32"}],"name":"ActionRequested","type":"event"},{"inputs":[],"name":"actionCounter","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"actions","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"action","type":"bytes32"}],"name":"authorizeAction","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"authorizedActions","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_recipient","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"burn","outputs":[{"internalType":"bytes32","name":"actionId","type":"bytes32"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"consumedActions","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"gasCost","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"chainId","type":"uint256"},{"internalType":"uint256","name":"_nonce","type":"uint256"},{"internalType":"address","name":"_recipient","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"getActionId","outputs":[{"internalType":"bytes32","name":"actionId","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getChainId","outputs":[{"internalType":"uint256","name":"chainId","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_peer","type":"uint256"},{"internalType":"address","name":"xerc20","type":"address"},{"internalType":"address","name":"_admin","type":"address"}],"name":"init","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_recipient","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"oracleAdmin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"peerChain","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"action","type":"bytes32"}],"name":"requestAuthorization","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_gasCost","type":"uint256"}],"name":"setGas","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"xToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]
; // ABI for Polygon bridge contract

const hypraLockboxAddress = '0x674f374A804E99FDb1c1e00988A3Ccbe34389578';
const polygonLockboxAddress = '0x0000000000000000000000000000000000000000';
const hypraBridgeAddress = '0x8D9b7634433298aB8BbF47b1a96789787Aa932F9';
const polygonBridgeAddress = '0x8D9b7634433298aB8BbF47b1a96789787Aa932F9';

function App() {
  const [userAccount, setUserAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [bridgeDirection, setBridgeDirection] = useState('hypraToPolygon');
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    async function initializeWeb3() {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setUserAccount(accounts[0]);
        } catch (error) {
          console.error("Error connecting to MetaMask:", error);
        }
      } else {
        alert("Please install MetaMask to use this application.");
      }
    }
    initializeWeb3();
  }, []);

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setUserAccount(accounts[0]);
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      alert("Please install MetaMask to use this feature.");
    }
  }

  async function depositTokens() {
    if (!web3) {
      console.log("Web3 is not initialized");
      return;
    }
    const lockboxAddress = bridgeDirection === 'hypraToPolygon' ? hypraLockboxAddress : polygonLockboxAddress;
    const lockboxABI = bridgeDirection === 'hypraToPolygon' ? hypraLockboxABI : polygonLockboxABI;
    const contract = new web3.eth.Contract(lockboxABI, lockboxAddress);
  
    try {
      const gasPrice = await web3.eth.getGasPrice(); // Fetch the current gas price
      await contract.methods.deposit(web3.utils.toWei(amount, 'ether'))
        .send({ from: userAccount, gasPrice }); // Specify gasPrice for legacy transaction format
      console.log("Deposit successful");
    } catch (error) {
      console.error("Error during deposit:", error);
    }
  }
  

  async function burnTokens() {
    if (!web3) {
      console.log("Web3 is not initialized");
      return;
    }
    const bridgeAddress = bridgeDirection === 'hypraToPolygon' ? hypraBridgeAddress : polygonBridgeAddress;
    const bridgeABI = bridgeDirection === 'hypraToPolygon' ? hypraBridgeABI : polygonBridgeABI;
    const contract = new web3.eth.Contract(bridgeABI, bridgeAddress);
  
    try {
      const gasPrice = await web3.eth.getGasPrice(); // Fetch the current gas price
      await contract.methods.burn(recipient, web3.utils.toWei(amount, 'ether'))
        .send({ from: userAccount, gasPrice }); // Specify gasPrice for legacy transaction format
      console.log("Burn successful");
    } catch (error) {
      console.error("Error during burn:", error);
    }
  }
  

  
  
  
  async function mintTokens() {
    console.log("Minting tokens...");

    if (!web3) {
        console.error("Web3 is not initialized");
        return;
    }

    // Assuming 'amount' is a variable holding the user-specified amount
    // Convert amount to Wei
    const amountInWei = web3.utils.toWei(amount.toString(), 'ether');

    // Dynamically fetch the current nonce for the userAccount
    const nonce = await web3.eth.getTransactionCount(userAccount, 'latest');

    const bridgeContract = new web3.eth.Contract(polygonBridgeABI, polygonBridgeAddress);

    // Fetch current gas price
    const gasPrice = await web3.eth.getGasPrice();

    // Log parameters for debugging
    console.log(`Minting to: ${recipient}, Amount: ${amountInWei}, Nonce: ${nonce}, GasPrice: ${gasPrice}`);

    try {
        // Manual gas limit - adjust based on contract needs and testing
        const manualGasLimit = 200000;

        // Execute the mint function with the manual gas limit
        await bridgeContract.methods.mint(recipient, nonce, amountInWei) // Ensure the order of parameters matches your contract's method signature
            .send({ from: userAccount, gasPrice, gas: manualGasLimit }) // Using manual gas limit
            .on('transactionHash', hash => console.log(`Transaction hash: ${hash}`))
            .on('receipt', receipt => {
                console.log('Transaction receipt:', receipt);
                alert('Tokens minted successfully!');
            })
            .on('error', (error, receipt) => {
                console.error('Error minting tokens:', error);
                alert('Mint failed. See console for details.');
            });
    } catch (error) {
        console.error("Error during minting: ", error);
    }
}


  
  
  

  return (
    <div className="app-container">
      <h1>HYPRA Bridge (TEST)</h1>
      <button onClick={connectWallet} className="connect-wallet-btn">
        {userAccount ? 'Wallet Connected' : 'Connect Wallet'}
      </button>
      <div className="input-group">
        <label>Bridge Direction:</label>
        <select value={bridgeDirection} onChange={(e) => setBridgeDirection(e.target.value)}>
          <option value="hypraToPolygon">Hypra to Polygon</option>
          <option value="polygonToHypra">Polygon to Hypra</option>
        </select>
      </div>
      <div className="input-group">
        <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount to transfer" />
        <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Recipient address" />
      </div>
      <button onClick={depositTokens} className="action-btn">Deposit Tokens</button>
      <button onClick={burnTokens} className="action-btn">Burn Tokens</button>
      <button onClick={mintTokens} className="action-btn">Mint Tokens</button>
    </div>
  );
}

export default App;

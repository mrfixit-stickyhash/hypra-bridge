import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';
import BN from 'bn.js';


// Placeholder ABIs and addresses - replace these with your actual contract details
const hypraLockboxABI = [{"type":"constructor","stateMutability":"nonpayable","inputs":[{"type":"address","name":"_xerc20","internalType":"address"},{"type":"address","name":"_erc20","internalType":"address"},{"type":"bool","name":"_isNative","internalType":"bool"}]},{"type":"error","name":"IXERC20Lockbox_Native","inputs":[]},{"type":"error","name":"IXERC20Lockbox_NotNative","inputs":[]},{"type":"error","name":"IXERC20Lockbox_WithdrawFailed","inputs":[]},{"type":"event","name":"Deposit","inputs":[{"type":"address","name":"_sender","internalType":"address","indexed":false},{"type":"uint256","name":"_amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"Withdraw","inputs":[{"type":"address","name":"_sender","internalType":"address","indexed":false},{"type":"uint256","name":"_amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"contract IERC20"}],"name":"ERC20","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"IS_NATIVE","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"contract IPermit2"}],"name":"PERMIT2","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"contract IXERC20"}],"name":"XERC20","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"deposit","inputs":[{"type":"uint256","name":"_amount","internalType":"uint256"}]},{"type":"function","stateMutability":"payable","outputs":[],"name":"deposit","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"depositWithPermitAllowance","inputs":[{"type":"uint256","name":"_amount","internalType":"uint256"},{"type":"address","name":"_owner","internalType":"address"},{"type":"tuple","name":"_permit","internalType":"struct IAllowanceTransfer.PermitSingle","components":[{"type":"tuple","name":"details","internalType":"struct IAllowanceTransfer.PermitDetails","components":[{"type":"address","name":"token","internalType":"address"},{"type":"uint160","name":"amount","internalType":"uint160"},{"type":"uint48","name":"expiration","internalType":"uint48"},{"type":"uint48","name":"nonce","internalType":"uint48"}]},{"type":"address","name":"spender","internalType":"address"},{"type":"uint256","name":"sigDeadline","internalType":"uint256"}]},{"type":"bytes","name":"_signature","internalType":"bytes"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"withdraw","inputs":[{"type":"uint256","name":"_amount","internalType":"uint256"}]},{"type":"receive","stateMutability":"payable"}]; // ABI for Hypra lockbox contract
const polygonLockboxABI = [{"type":"constructor","stateMutability":"nonpayable","inputs":[{"type":"address","name":"_xerc20","internalType":"address"},{"type":"address","name":"_erc20","internalType":"address"},{"type":"bool","name":"_isNative","internalType":"bool"}]},{"type":"error","name":"IXERC20Lockbox_Native","inputs":[]},{"type":"error","name":"IXERC20Lockbox_NotNative","inputs":[]},{"type":"error","name":"IXERC20Lockbox_WithdrawFailed","inputs":[]},{"type":"event","name":"Deposit","inputs":[{"type":"address","name":"_sender","internalType":"address","indexed":false},{"type":"uint256","name":"_amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"Withdraw","inputs":[{"type":"address","name":"_sender","internalType":"address","indexed":false},{"type":"uint256","name":"_amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"contract IERC20"}],"name":"ERC20","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"IS_NATIVE","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"contract IPermit2"}],"name":"PERMIT2","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"contract IXERC20"}],"name":"XERC20","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"deposit","inputs":[{"type":"uint256","name":"_amount","internalType":"uint256"}]},{"type":"function","stateMutability":"payable","outputs":[],"name":"deposit","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"depositWithPermitAllowance","inputs":[{"type":"uint256","name":"_amount","internalType":"uint256"},{"type":"address","name":"_owner","internalType":"address"},{"type":"tuple","name":"_permit","internalType":"struct IAllowanceTransfer.PermitSingle","components":[{"type":"tuple","name":"details","internalType":"struct IAllowanceTransfer.PermitDetails","components":[{"type":"address","name":"token","internalType":"address"},{"type":"uint160","name":"amount","internalType":"uint160"},{"type":"uint48","name":"expiration","internalType":"uint48"},{"type":"uint48","name":"nonce","internalType":"uint48"}]},{"type":"address","name":"spender","internalType":"address"},{"type":"uint256","name":"sigDeadline","internalType":"uint256"}]},{"type":"bytes","name":"_signature","internalType":"bytes"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"withdraw","inputs":[{"type":"uint256","name":"_amount","internalType":"uint256"}]},{"type":"receive","stateMutability":"payable"}]; // ABI for Polygon lockbox contract
const hypraBridgeABI = [{"type":"event","name":"ActionConsumed","inputs":[{"type":"bytes32","name":"id","internalType":"bytes32","indexed":true},{"type":"uint256","name":"nonce","internalType":"uint256","indexed":true},{"type":"address","name":"receiver","internalType":"address","indexed":false},{"type":"uint256","name":"amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"ActionCreated","inputs":[{"type":"bytes32","name":"id","internalType":"bytes32","indexed":true},{"type":"uint256","name":"nonce","internalType":"uint256","indexed":true},{"type":"address","name":"receiver","internalType":"address","indexed":false},{"type":"uint256","name":"amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"ActionRequested","inputs":[{"type":"bytes32","name":"id","internalType":"bytes32","indexed":true}],"anonymous":false},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"actionCounter","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"actions","inputs":[{"type":"bytes32","name":"","internalType":"bytes32"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"success","internalType":"bool"}],"name":"authorizeAction","inputs":[{"type":"bytes32","name":"action","internalType":"bytes32"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"authorizedActions","inputs":[{"type":"bytes32","name":"","internalType":"bytes32"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bytes32","name":"actionId","internalType":"bytes32"}],"name":"burn","inputs":[{"type":"address","name":"_recipient","internalType":"address"},{"type":"uint256","name":"_amount","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"consumedActions","inputs":[{"type":"bytes32","name":"","internalType":"bytes32"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"gasCost","inputs":[]},{"type":"function","stateMutability":"pure","outputs":[{"type":"bytes32","name":"actionId","internalType":"bytes32"}],"name":"getActionId","inputs":[{"type":"uint256","name":"chainId","internalType":"uint256"},{"type":"uint256","name":"_nonce","internalType":"uint256"},{"type":"address","name":"_recipient","internalType":"address"},{"type":"uint256","name":"_amount","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"chainId","internalType":"uint256"}],"name":"getChainId","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"init","inputs":[{"type":"uint256","name":"_peer","internalType":"uint256"},{"type":"address","name":"xerc20","internalType":"address"},{"type":"address","name":"_admin","internalType":"address"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"success","internalType":"bool"}],"name":"mint","inputs":[{"type":"address","name":"_recipient","internalType":"address"},{"type":"uint256","name":"nonce","internalType":"uint256"},{"type":"uint256","name":"amount","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address"}],"name":"oracleAdmin","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"peerChain","inputs":[]},{"type":"function","stateMutability":"payable","outputs":[{"type":"bool","name":"success","internalType":"bool"}],"name":"requestAuthorization","inputs":[{"type":"bytes32","name":"action","internalType":"bytes32"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"setGas","inputs":[{"type":"uint256","name":"_gasCost","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address"}],"name":"xToken","inputs":[]}]; // ABI for Hypra bridge contract
const polygonBridgeABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"id","type":"bytes32"},{"indexed":true,"internalType":"uint256","name":"nonce","type":"uint256"},{"indexed":false,"internalType":"address","name":"receiver","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ActionConsumed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"id","type":"bytes32"},{"indexed":true,"internalType":"uint256","name":"nonce","type":"uint256"},{"indexed":false,"internalType":"address","name":"receiver","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ActionCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"id","type":"bytes32"}],"name":"ActionRequested","type":"event"},{"inputs":[],"name":"actionCounter","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"actions","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"action","type":"bytes32"}],"name":"authorizeAction","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"authorizedActions","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_recipient","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"burn","outputs":[{"internalType":"bytes32","name":"actionId","type":"bytes32"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"consumedActions","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"gasCost","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"chainId","type":"uint256"},{"internalType":"uint256","name":"_nonce","type":"uint256"},{"internalType":"address","name":"_recipient","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"getActionId","outputs":[{"internalType":"bytes32","name":"actionId","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getChainId","outputs":[{"internalType":"uint256","name":"chainId","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_peer","type":"uint256"},{"internalType":"address","name":"xerc20","type":"address"},{"internalType":"address","name":"_admin","type":"address"}],"name":"init","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_recipient","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"oracleAdmin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"peerChain","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"action","type":"bytes32"}],"name":"requestAuthorization","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_gasCost","type":"uint256"}],"name":"setGas","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"xToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]
const erc20TokenABI = [{"type":"event","name":"Approval","inputs":[{"type":"address","name":"from","internalType":"address","indexed":true},{"type":"address","name":"authorized","internalType":"address","indexed":true},{"type":"uint256","name":"amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"Deposit","inputs":[{"type":"address","name":"destination","internalType":"address","indexed":true},{"type":"uint256","name":"amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"Transfer","inputs":[{"type":"address","name":"from","internalType":"address","indexed":true},{"type":"address","name":"destination","internalType":"address","indexed":true},{"type":"uint256","name":"amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"Withdrawal","inputs":[{"type":"address","name":"from","internalType":"address","indexed":true},{"type":"uint256","name":"amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"fallback","stateMutability":"payable"},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"allowance","inputs":[{"type":"address","name":"","internalType":"address"},{"type":"address","name":"","internalType":"address"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"approve","inputs":[{"type":"address","name":"from","internalType":"address"},{"type":"uint256","name":"amount","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"balanceOf","inputs":[{"type":"address","name":"","internalType":"address"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint8","name":"","internalType":"uint8"}],"name":"decimals","inputs":[]},{"type":"function","stateMutability":"payable","outputs":[],"name":"deposit","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"string","name":"","internalType":"string"}],"name":"name","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"string","name":"","internalType":"string"}],"name":"symbol","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"totalSupply","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"transfer","inputs":[{"type":"address","name":"destination","internalType":"address"},{"type":"uint256","name":"amount","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"transferFrom","inputs":[{"type":"address","name":"from","internalType":"address"},{"type":"address","name":"destination","internalType":"address"},{"type":"uint256","name":"amount","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"withdraw","inputs":[{"type":"uint256","name":"amount","internalType":"uint256"}]},{"type":"receive","stateMutability":"payable"}] // The ABI for the ERC20 token you're working with
; // ABI for Polygon bridge contract

const hypraLockboxAddress = '0x674f374A804E99FDb1c1e00988A3Ccbe34389578';
const polygonLockboxAddress = '0x0000000000000000000000000000000000000000';
const hypraBridgeAddress = '0x8D9b7634433298aB8BbF47b1a96789787Aa932F9';
const polygonBridgeAddress = '0x8D9b7634433298aB8BbF47b1a96789787Aa932F9';
const erc20TokenAddress = '0x0000000000079c645A9bDE0Bd8Af1775FAF5598A' // The address of the ERC20 token contract

function App() {
  const [userAccount, setUserAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [bridgeDirection, setBridgeDirection] = useState('hypraToPolygon');
  const [web3, setWeb3] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');


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

  async function switchNetwork(targetChainId) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: Web3.utils.toHex(targetChainId) }],
      });
    } catch (switchError) {
      console.error('Error switching networks:', switchError);
    }
  }

  async function ensureCorrectNetwork() {
    const hypraChainId = 622277; // Correct chain ID for Hypra
    const polygonChainId = 80001; // Chain ID for Polygon Mumbai Testnet
    const currentChainId = await web3.eth.getChainId();

    if (bridgeDirection === 'hypraToPolygon' && currentChainId !== hypraChainId) {
      await switchNetwork(hypraChainId);
    } else if (bridgeDirection === 'polygonToHypra' && currentChainId !== polygonChainId) {
      await switchNetwork(polygonChainId);
    }
  }

  async function depositTokens() {
    setErrorMessage(''); // Clear any existing error messages
  
    if (!web3) {
      setErrorMessage("Web3 is not initialized");
      console.log("Web3 is not initialized"); // Keeping console.log for debugging purposes
      return;
    }
  
    // Ensure you are on the correct network for the deposit action.
    try {
      await ensureCorrectNetwork();
    } catch (error) {
      setErrorMessage(`Network switch failed: ${error.message}`);
      return;
    }
  
    const tokenContract = new web3.eth.Contract(erc20TokenABI, erc20TokenAddress);
    
    try {
      // Check user's token balance
      const balance = await tokenContract.methods.balanceOf(userAccount).call();
      const depositAmountWei = web3.utils.toWei(amount, 'ether');
    
      // Convert balance and depositAmountWei to BN and compare
      const balanceBN = new BN(balance);
      const depositAmountWeiBN = new BN(depositAmountWei);
    
      if (balanceBN.lt(depositAmountWeiBN)) {
        setErrorMessage("Insufficient token balance for deposit.");
        return;
      }
    
      const lockboxAddress = bridgeDirection === 'hypraToPolygon' ? hypraLockboxAddress : polygonLockboxAddress;
      const lockboxABI = bridgeDirection === 'hypraToPolygon' ? hypraLockboxABI : polygonLockboxABI;
      const contract = new web3.eth.Contract(lockboxABI, lockboxAddress);
  
      const gasPrice = await web3.eth.getGasPrice();
      await contract.methods.deposit(depositAmountWei)
        .send({ from: userAccount, gasPrice })
        .on('transactionHash', hash => console.log(`Transaction hash: ${hash}`))
        .on('receipt', receipt => {
          console.log("Deposit successful", receipt);
        })
        .on('error', error => {
          setErrorMessage(`Error during deposit: ${error.message}`);
          console.error("Error during deposit:", error.message);
        });
    } catch (error) {
      setErrorMessage(`Error during deposit: ${error.message}`);
      console.error("Error during deposit:", error.message);
    }
  }
  
  
  

  async function burnTokens() {
    setErrorMessage(''); // Reset any previous error messages

    try {
        await ensureCorrectNetwork();
        const bridgeAddress = bridgeDirection === 'hypraToPolygon' ? hypraBridgeAddress : polygonBridgeAddress;
        const bridgeABI = bridgeDirection === 'hypraToPolygon' ? hypraBridgeABI : polygonBridgeABI;
        const contract = new web3.eth.Contract(bridgeABI, bridgeAddress);

        const gasPrice = await web3.eth.getGasPrice();
        await contract.methods.burn(recipient, web3.utils.toWei(amount, 'ether'))
            .send({ from: userAccount, gasPrice })
            .on('transactionHash', hash => console.log(`Transaction hash: ${hash}`))
            .on('receipt', () => {
                console.log("Burn successful");
                // Optionally, clear the error message if the transaction was successful
                setErrorMessage('');
            })
            .on('error', error => {
                console.error("Error during burn:", error);
                setErrorMessage(`Error during burn: ${error.message}`);
            });
    } catch (error) {
        console.error("Error during burn:", error);
        setErrorMessage(`Error during burn: ${error.message}`);
    }
}

  
  
  
async function mintTokens() {
  setErrorMessage(''); // Clear any existing error messages first

  console.log("Minting tokens...");

  if (!web3) {
      setErrorMessage("Web3 is not initialized");
      console.error("Web3 is not initialized");
      return;
  }

  try {
      // Define targetChainId based on the bridge direction
      const targetChainId = bridgeDirection === 'polygonToHypra' ? 622277 : 80001;

      // Ensure network switch to the target chain before minting
      await switchNetwork(targetChainId);

      const amountInWei = web3.utils.toWei(amount.toString(), 'ether');
      const nonce = await web3.eth.getTransactionCount(userAccount, 'latest');
      const bridgeContract = new web3.eth.Contract(
          bridgeDirection === 'polygonToHypra' ? hypraBridgeABI : polygonBridgeABI,
          bridgeDirection === 'polygonToHypra' ? hypraBridgeAddress : polygonBridgeAddress
      );

      const gasPrice = await web3.eth.getGasPrice();
      const actionId = await bridgeContract.methods.getActionId(targetChainId, nonce, recipient, amountInWei).call();
      const isAuthorized = await bridgeContract.methods.authorizedActions(actionId).call();
      const isConsumed = await bridgeContract.methods.consumedActions(actionId).call();

      if (isAuthorized && !isConsumed) {
          const manualGasLimit = 200000;
          await bridgeContract.methods.mint(recipient, nonce, amountInWei)
              .send({ from: userAccount, gasPrice, gas: manualGasLimit })
              .on('transactionHash', hash => console.log(`Transaction hash: ${hash}`))
              .on('receipt', receipt => {
                  console.log('Transaction receipt:', receipt);
                  setErrorMessage(''); // Clear the error message on successful transaction
              })
              .on('error', error => {
                  console.error('Error minting tokens:', error);
                  setErrorMessage(`Error minting tokens: ${error.message}`);
              });
      } else {
          setErrorMessage("Minting unauthorized or action already consumed.");
          console.error("Action not authorized or already consumed.");
      }
  } catch (error) {
      setErrorMessage(`Error during minting: ${error.message}`);
      console.error("Error during minting: ", error);
  }
}



return (
  <div className="app-container">
    <h1 className="artistic-text">HYPRA Bridge (TEST)</h1>
    <p className="subtitle-text">This bridge allows you to send wrapped HYP (WHYP) Between Hypra and Polygon</p>
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
    {errorMessage && <div className="error-message">{errorMessage}</div>}
    <button onClick={depositTokens} className="action-btn">(step 1) Deposit Tokens</button>
    <button onClick={burnTokens} className="action-btn">(step 2) Initiate Bridge</button>
    <button onClick={mintTokens} className="action-btn">(step 3) Complete Bridge</button>
  </div>
);
}

export default App;
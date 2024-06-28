import React, { useState, useEffect, useCallback } from 'react'; // Include useCallback here
import Web3 from 'web3';
import './App.css';
import BN from 'bn.js';

// Placeholder ABIs and addresses - replace these with your actual contract details
const hypraLockboxABI = [{"type":"constructor","stateMutability":"nonpayable","inputs":[{"type":"address","name":"_xerc20","internalType":"address"},{"type":"address","name":"_erc20","internalType":"address"},{"type":"bool","name":"_isNative","internalType":"bool"}]},{"type":"error","name":"IXERC20Lockbox_Native","inputs":[]},{"type":"error","name":"IXERC20Lockbox_NotNative","inputs":[]},{"type":"error","name":"IXERC20Lockbox_WithdrawFailed","inputs":[]},{"type":"event","name":"Deposit","inputs":[{"type":"address","name":"_sender","internalType":"address","indexed":false},{"type":"uint256","name":"_amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"Withdraw","inputs":[{"type":"address","name":"_sender","internalType":"address","indexed":false},{"type":"uint256","name":"_amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"contract IERC20"}],"name":"ERC20","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"IS_NATIVE","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"contract IPermit2"}],"name":"PERMIT2","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"contract IXERC20"}],"name":"XERC20","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"deposit","inputs":[{"type":"uint256","name":"_amount","internalType":"uint256"}]},{"type":"function","stateMutability":"payable","outputs":[],"name":"deposit","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"depositWithPermitAllowance","inputs":[{"type":"uint256","name":"_amount","internalType":"uint256"},{"type":"address","name":"_owner","internalType":"address"},{"type":"tuple","name":"_permit","internalType":"struct IAllowanceTransfer.PermitSingle","components":[{"type":"tuple","name":"details","internalType":"struct IAllowanceTransfer.PermitDetails","components":[{"type":"address","name":"token","internalType":"address"},{"type":"uint160","name":"amount","internalType":"uint160"},{"type":"uint48","name":"expiration","internalType":"uint48"},{"type":"uint48","name":"nonce","internalType":"uint48"}]},{"type":"address","name":"spender","internalType":"address"},{"type":"uint256","name":"sigDeadline","internalType":"uint256"}]},{"type":"bytes","name":"_signature","internalType":"bytes"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"withdraw","inputs":[{"type":"uint256","name":"_amount","internalType":"uint256"}]},{"type":"receive","stateMutability":"payable"}]; // ABI for Hypra lockbox contract
const polygonLockboxABI = [{"type":"constructor","stateMutability":"nonpayable","inputs":[{"type":"address","name":"_xerc20","internalType":"address"},{"type":"address","name":"_erc20","internalType":"address"},{"type":"bool","name":"_isNative","internalType":"bool"}]},{"type":"error","name":"IXERC20Lockbox_Native","inputs":[]},{"type":"error","name":"IXERC20Lockbox_NotNative","inputs":[]},{"type":"error","name":"IXERC20Lockbox_WithdrawFailed","inputs":[]},{"type":"event","name":"Deposit","inputs":[{"type":"address","name":"_sender","internalType":"address","indexed":false},{"type":"uint256","name":"_amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"Withdraw","inputs":[{"type":"address","name":"_sender","internalType":"address","indexed":false},{"type":"uint256","name":"_amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"contract IERC20"}],"name":"ERC20","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"IS_NATIVE","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"contract IPermit2"}],"name":"PERMIT2","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"contract IXERC20"}],"name":"XERC20","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"deposit","inputs":[{"type":"uint256","name":"_amount","internalType":"uint256"}]},{"type":"function","stateMutability":"payable","outputs":[],"name":"deposit","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"depositWithPermitAllowance","inputs":[{"type":"uint256","name":"_amount","internalType":"uint256"},{"type":"address","name":"_owner","internalType":"address"},{"type":"tuple","name":"_permit","internalType":"struct IAllowanceTransfer.PermitSingle","components":[{"type":"tuple","name":"details","internalType":"struct IAllowanceTransfer.PermitDetails","components":[{"type":"address","name":"token","internalType":"address"},{"type":"uint160","name":"amount","internalType":"uint160"},{"type":"uint48","name":"expiration","internalType":"uint48"},{"type":"uint48","name":"nonce","internalType":"uint48"}]},{"type":"address","name":"spender","internalType":"address"},{"type":"uint256","name":"sigDeadline","internalType":"uint256"}]},{"type":"bytes","name":"_signature","internalType":"bytes"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"withdraw","inputs":[{"type":"uint256","name":"_amount","internalType":"uint256"}]},{"type":"receive","stateMutability":"payable"}]; // ABI for Polygon lockbox contract
const hypraBridgeABI = [{"type":"event","name":"ActionConsumed","inputs":[{"type":"bytes32","name":"id","internalType":"bytes32","indexed":true},{"type":"uint256","name":"nonce","internalType":"uint256","indexed":true},{"type":"address","name":"receiver","internalType":"address","indexed":false},{"type":"uint256","name":"amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"ActionCreated","inputs":[{"type":"bytes32","name":"id","internalType":"bytes32","indexed":true},{"type":"uint256","name":"nonce","internalType":"uint256","indexed":true},{"type":"address","name":"receiver","internalType":"address","indexed":false},{"type":"uint256","name":"amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"ActionRequested","inputs":[{"type":"bytes32","name":"id","internalType":"bytes32","indexed":true}],"anonymous":false},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"actionCounter","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"actions","inputs":[{"type":"bytes32","name":"","internalType":"bytes32"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"success","internalType":"bool"}],"name":"authorizeAction","inputs":[{"type":"bytes32","name":"action","internalType":"bytes32"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"authorizedActions","inputs":[{"type":"bytes32","name":"","internalType":"bytes32"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bytes32","name":"actionId","internalType":"bytes32"}],"name":"burn","inputs":[{"type":"address","name":"_recipient","internalType":"address"},{"type":"uint256","name":"_amount","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"consumedActions","inputs":[{"type":"bytes32","name":"","internalType":"bytes32"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"gasCost","inputs":[]},{"type":"function","stateMutability":"pure","outputs":[{"type":"bytes32","name":"actionId","internalType":"bytes32"}],"name":"getActionId","inputs":[{"type":"uint256","name":"chainId","internalType":"uint256"},{"type":"uint256","name":"_nonce","internalType":"uint256"},{"type":"address","name":"_recipient","internalType":"address"},{"type":"uint256","name":"_amount","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"chainId","internalType":"uint256"}],"name":"getChainId","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"init","inputs":[{"type":"uint256","name":"_peer","internalType":"uint256"},{"type":"address","name":"xerc20","internalType":"address"},{"type":"address","name":"_admin","internalType":"address"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"success","internalType":"bool"}],"name":"mint","inputs":[{"type":"address","name":"_recipient","internalType":"address"},{"type":"uint256","name":"nonce","internalType":"uint256"},{"type":"uint256","name":"amount","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address"}],"name":"oracleAdmin","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"peerChain","inputs":[]},{"type":"function","stateMutability":"payable","outputs":[{"type":"bool","name":"success","internalType":"bool"}],"name":"requestAuthorization","inputs":[{"type":"bytes32","name":"action","internalType":"bytes32"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"setGas","inputs":[{"type":"uint256","name":"_gasCost","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address"}],"name":"xToken","inputs":[]}]; // ABI for Hypra bridge contract
const polygonBridgeABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"id","type":"bytes32"},{"indexed":true,"internalType":"uint256","name":"nonce","type":"uint256"},{"indexed":false,"internalType":"address","name":"receiver","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ActionConsumed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"id","type":"bytes32"},{"indexed":true,"internalType":"uint256","name":"nonce","type":"uint256"},{"indexed":false,"internalType":"address","name":"receiver","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ActionCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"id","type":"bytes32"}],"name":"ActionRequested","type":"event"},{"inputs":[],"name":"actionCounter","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"actions","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"action","type":"bytes32"}],"name":"authorizeAction","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"authorizedActions","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_recipient","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"burn","outputs":[{"internalType":"bytes32","name":"actionId","type":"bytes32"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"consumedActions","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"gasCost","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"chainId","type":"uint256"},{"internalType":"uint256","name":"_nonce","type":"uint256"},{"internalType":"address","name":"_recipient","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"getActionId","outputs":[{"internalType":"bytes32","name":"actionId","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getChainId","outputs":[{"internalType":"uint256","name":"chainId","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_peer","type":"uint256"},{"internalType":"address","name":"xerc20","type":"address"},{"internalType":"address","name":"_admin","type":"address"}],"name":"init","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_recipient","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"oracleAdmin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"peerChain","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"action","type":"bytes32"}],"name":"requestAuthorization","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_gasCost","type":"uint256"}],"name":"setGas","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"xToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]
const erc20TokenABI = [{"type":"event","name":"Approval","inputs":[{"type":"address","name":"from","internalType":"address","indexed":true},{"type":"address","name":"authorized","internalType":"address","indexed":true},{"type":"uint256","name":"amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"Deposit","inputs":[{"type":"address","name":"destination","internalType":"address","indexed":true},{"type":"uint256","name":"amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"Transfer","inputs":[{"type":"address","name":"from","internalType":"address","indexed":true},{"type":"address","name":"destination","internalType":"address","indexed":true},{"type":"uint256","name":"amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"Withdrawal","inputs":[{"type":"address","name":"from","internalType":"address","indexed":true},{"type":"uint256","name":"amount","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"fallback","stateMutability":"payable"},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"allowance","inputs":[{"type":"address","name":"","internalType":"address"},{"type":"address","name":"","internalType":"address"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"approve","inputs":[{"type":"address","name":"from","internalType":"address"},{"type":"uint256","name":"amount","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"balanceOf","inputs":[{"type":"address","name":"","internalType":"address"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint8","name":"","internalType":"uint8"}],"name":"decimals","inputs":[]},{"type":"function","stateMutability":"payable","outputs":[],"name":"deposit","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"string","name":"","internalType":"string"}],"name":"name","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"string","name":"","internalType":"string"}],"name":"symbol","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"totalSupply","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"transfer","inputs":[{"type":"address","name":"destination","internalType":"address"},{"type":"uint256","name":"amount","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"transferFrom","inputs":[{"type":"address","name":"from","internalType":"address"},{"type":"address","name":"destination","internalType":"address"},{"type":"uint256","name":"amount","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"withdraw","inputs":[{"type":"uint256","name":"amount","internalType":"uint256"}]},{"type":"receive","stateMutability":"payable"}] // The ABI for the ERC20 token you're working with 
const xERC20ABI = [{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_symbol","type":"string"},{"internalType":"uint8","name":"_decimals","type":"uint8"},{"internalType":"address","name":"_factory","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"IXERC20_NotFactory","type":"error"},{"inputs":[],"name":"IXERC20_NotHighEnoughLimits","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_mintingLimit","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_burningLimit","type":"uint256"},{"indexed":true,"internalType":"address","name":"_bridge","type":"address"}],"name":"BridgeLimitsSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_lockbox","type":"address"}],"name":"LockboxSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"FACTORY","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"bridges","outputs":[{"components":[{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"ratePerSecond","type":"uint256"},{"internalType":"uint256","name":"maxLimit","type":"uint256"},{"internalType":"uint256","name":"currentLimit","type":"uint256"}],"internalType":"struct IXERC20.BridgeParameters","name":"minterParams","type":"tuple"},{"components":[{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"ratePerSecond","type":"uint256"},{"internalType":"uint256","name":"maxLimit","type":"uint256"},{"internalType":"uint256","name":"currentLimit","type":"uint256"}],"internalType":"struct IXERC20.BridgeParameters","name":"burnerParams","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_bridge","type":"address"}],"name":"burningCurrentLimitOf","outputs":[{"internalType":"uint256","name":"_limit","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_bridge","type":"address"}],"name":"burningMaxLimitOf","outputs":[{"internalType":"uint256","name":"_limit","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"lockbox","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_bridge","type":"address"}],"name":"mintingCurrentLimitOf","outputs":[{"internalType":"uint256","name":"_limit","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_bridge","type":"address"}],"name":"mintingMaxLimitOf","outputs":[{"internalType":"uint256","name":"_limit","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_bridge","type":"address"},{"internalType":"uint256","name":"_mintingLimit","type":"uint256"},{"internalType":"uint256","name":"_burningLimit","type":"uint256"}],"name":"setLimits","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_lockbox","type":"address"}],"name":"setLockbox","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}];
; // ABI for Polygon bridge contract

const hypraLockboxAddress = '0x3Eb37f783E565af5Ca2221cbc80fAeeBb89880DB';
const polygonLockboxAddress = '0x0000000000000000000000000000000000000000';
const hypraBridgeAddress = '0x76870E3a0dF720eA6B4054956b716ed0D87F6C4f';
const polygonBridgeAddress = '0x76870E3a0dF720eA6B4054956b716ed0D87F6C4f';
const erc20TokenAddress = '0x0000000000079c645A9bDE0Bd8Af1775FAF5598A' // The address of the ERC20 token contract
const WHYP_TOKEN_ADDRESS = '0x0000000000079c645A9bDE0Bd8Af1775FAF5598A'; // WHYP Token Address
const HYP_TOKEN_ADDRESS = '0x1fb21d3D6F1FE38FE49637E277Daf71344732bA4'; // HYP Token Address


function App() {
  const [userAccount, setUserAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [bridgeDirection, setBridgeDirection] = useState('hypraToPolygon');
  const [web3, setWeb3] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [bridgeNonce, setBridgeNonce] = useState('');
  const [actionId, setActionId] = useState('');
  const [frontendMessage, setFrontendMessage] = useState(''); // State to hold frontend messages
  const [depositProgress, setDepositProgress] = useState(0); // Progress for deposit and initiate bridge
  const [authorizeProgress, setAuthorizeProgress] = useState(0); // Progress for authorize and complete bridge
  const [whypBalance, setWhypBalance] = useState('0');
  const [hypBalance, setHypBalance] = useState('0');
  const [networkChanged, setNetworkChanged] = useState(false);
  const [bridgeLimits, setBridgeLimits] = useState({ burnLimit: '0', mintLimit: '0' });
  const [limitError, setLimitError] = useState('');


  
  const fetchBridgeLimits = useCallback(async (action) => {
    if (!web3) {
      console.error("Web3 is not initialized");
      return '0';
    }

    const hypraXERC20Address = '0x8ADf314372e80a1010F738260412b0E6bf64c5CA';
    const polygonXERC20Address = '0x1fb21d3D6F1FE38FE49637E277Daf71344732bA4';
    const xERC20Address = bridgeDirection === 'hypraToPolygon' ? hypraXERC20Address : polygonXERC20Address;
    console.log("Fetching limits for XERC20 at address:", xERC20Address);

    const xERC20Contract = new web3.eth.Contract(xERC20ABI, xERC20Address);
    try {
      if (action === 'burn') {
        console.log("Calling burningCurrentLimitOf for action:", action);
        const limit = await xERC20Contract.methods.burningCurrentLimitOf(bridgeDirection === 'hypraToPolygon' ? hypraBridgeAddress : polygonBridgeAddress).call();
        console.log(`Burning limit: ${limit}`);
        return web3.utils.fromWei(limit, 'ether'); // Convert BN to string
      } else if (action === 'mint') {
        console.log("Calling mintingCurrentLimitOf for action:", action);
        const limit = await xERC20Contract.methods.mintingCurrentLimitOf(bridgeDirection === 'hypraToPolygon' ? hypraBridgeAddress : polygonBridgeAddress).call();
        console.log(`Minting limit: ${limit}`);
        return web3.utils.fromWei(limit, 'ether'); // Convert BN to string
      }
    } catch (error) {
      console.error("Failed to fetch limits:", error);
      setErrorMessage(`Failed to fetch limits: ${error.message}`);

      if (error.data) {
        console.error("Error data:", error.data);
      }

      return '0';
    }
  }, [web3, bridgeDirection]);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
        } catch (error) {
          console.error("Web3 initialization error:", error);
          setErrorMessage("Web3 initialization error: " + error.message);
        }
      } else {
        setErrorMessage("Please install MetaMask to use this application.");
      }
    };
    initWeb3();
  }, []);


  const fetchTokenBalance = useCallback(async (tokenAddress) => {
    if (!web3 || !userAccount) {
      console.error("Web3 is not initialized or user account is not set.");
      return '0'; // Default balance
    }

    try {
      const tokenContract = new web3.eth.Contract(erc20TokenABI, tokenAddress);
      const balanceWei = await tokenContract.methods.balanceOf(userAccount).call();
      return web3.utils.fromWei(balanceWei, 'ether');
    } catch (error) {
      console.error(`Error fetching balance for token at ${tokenAddress}:`, error);
      return '0'; // Default balance in case of an error
    }
  }, [web3, userAccount]);

  const fetchBalances = useCallback(async () => {
    try {
      const whypBalance = await fetchTokenBalance(WHYP_TOKEN_ADDRESS);
      const hypBalance = await fetchTokenBalance(HYP_TOKEN_ADDRESS);
      setWhypBalance(whypBalance);
      setHypBalance(hypBalance);
    } catch (error) {
      console.error("Error fetching balances:", error);
      setErrorMessage("Error fetching balances: " + error.message);
    }
  }, [fetchTokenBalance]);

  // Trigger fetching balances when web3 or userAccount changes
  useEffect(() => {
    if (web3 && userAccount) {
      fetchBalances();
    }
  }, [web3, userAccount, fetchBalances, networkChanged]);
  
  
  useEffect(() => {
    const fetchLimits = async () => {
      const burnLimit = await fetchBridgeLimits('burn');
      const mintLimit = await fetchBridgeLimits('mint');
      setBridgeLimits({ burnLimit, mintLimit });
    };
  
    if (web3 && userAccount && bridgeDirection) {
      fetchLimits();
    }
  }, [web3, userAccount, bridgeDirection, fetchBridgeLimits, networkChanged]);  // Add userAccount as a dependency

  

  useEffect(() => {
    if (window.ethereum) {
      console.log("Web3 is available, waiting for wallet connection...");
      // We're not creating a web3Instance here anymore because it's set in connectWallet
    } else {
      setErrorMessage("Please install MetaMask to use this application.");
    }
  }, []);
  
  


  useEffect(() => {
    let checkInterval = null;
  
    const checkAuthorization = async () => {
      // ... your polling logic here
    };
  
    if (actionId) {
      // Only start polling if we have an action ID
      checkInterval = setInterval(checkAuthorization, 10000);
    }
  
    // Cleanup function to clear the interval when component unmounts or actionId changes
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [actionId]); // Re-run the effect if actionId changes
  

  const ensureCorrectNetwork = useCallback(async () => {
    const hypraChainIdHex = Web3.utils.toHex(622277);
    const polygonChainIdHex = Web3.utils.toHex(137);
    if (!web3 || !window.ethereum) return;

    try {
      const currentChainIdHex = Web3.utils.toHex(await web3.eth.getChainId());
      let targetChainIdHex = bridgeDirection === 'hypraToPolygon' ? hypraChainIdHex : polygonChainIdHex;

      if (currentChainIdHex !== targetChainIdHex) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetChainIdHex }],
        });
        // Toggle network change state to trigger effects dependent on network change
        setNetworkChanged(!networkChanged);
      }
    } catch (error) {
      console.error('Error switching networks:', error);
    }
  }, [web3, bridgeDirection, networkChanged]);
  

  // useEffect hook to run ensureCorrectNetwork when the component mounts or when dependencies change
  useEffect(() => {
    ensureCorrectNetwork();
  }, [ensureCorrectNetwork]);



// Utility function to switch to Hypra Mainnet
async function switchToHypraMainnet() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: Web3.utils.toHex(622277) }], // Hexadecimal chainId for Hypra Mainnet
    });
  } catch (error) {
    if (error.code === 4902) {
      console.error('The Hypra Mainnet is not available in your MetaMask. Please add it manually.');
    } else {
      console.error('Error switching to Hypra Mainnet:', error);
    }
  }
}

// Utility function to switch to Polygon Mumbai Testnet
async function switchToPolygonMumbai() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: Web3.utils.toHex(137) }], // Hexadecimal chainId for Polygon Mumbai
    });
  } catch (error) {
    if (error.code === 4902) {
      console.error('The Polygon Mumbai Testnet is not available in your MetaMask. Please add it manually.');
    } else {
      console.error('Error switching to Polygon Mumbai:', error);
    }
  }
}

// Function to add WHYP Token to MetaMask
async function addWHYPToken() {
  try {
    await switchToHypraMainnet(); // Ensure you're on Hypra Mainnet
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: '0x0000000000079c645A9bDE0Bd8Af1775FAF5598A', // WHYP Token Contract Address
          symbol: 'wHYP',
          decimals: 18,
          image: 'URL_TO_AN_IMAGE_OF_THE_TOKEN', // Optional image URL
        },
      },
    });

    if (wasAdded) {
      console.log('WHYP Token has been added to your wallet!');
    } else {
      console.log('WHYP Token has not been added to your wallet.');
    }
  } catch (error) {
    console.error("Error adding WHYP Token:", error);
  }
}

// Function to add HYP Token to MetaMask
async function addHYPToken() {
  try {
    await switchToPolygonMumbai(); // Ensure you're on Polygon Mumbai
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: '0x1fb21d3D6F1FE38FE49637E277Daf71344732bA4', // HYP Token Contract Address
          symbol: 'wHYP',
          decimals: 18,
          image: 'URL_TO_AN_IMAGE_OF_THE_TOKEN', // Optional image URL
        },
      },
    });

    if (wasAdded) {
      console.log('HYP Token has been added to your wallet!');
    } else {
      console.log('HYP Token has not been added to your wallet.');
    }
  } catch (error) {
    console.error("Error adding HYP Token:", error);
  }
}


const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setUserAccount(accounts[0]);
      setRecipient(accounts[0]); // Prefill the recipient address with the user's address
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance); // Set web3 now that the wallet is connected
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      setErrorMessage(error.message || "An error occurred during the wallet connection.");
    }
  } else {
    alert("Please install MetaMask to use this feature.");
  }
};

  

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


  function isValidAmount(amount) {
    // Convert amount to a numeric value to ensure proper comparison
    const numericAmount = parseFloat(amount);
    return numericAmount && numericAmount >= 0.0001;
  }
  
  function isValidAddress(address) {
    return address && address.startsWith('0x') && address.length === 42;
  }
  
  async function depositTokens() {
    setErrorMessage(''); // Clear any existing error messages
    
    if (!isValidAddress(recipient)) {
      setErrorMessage("Invalid recipient address");
      return;
    }
    
  
    if (!web3) {
      setErrorMessage("Web3 is not initialized");
      console.log("Web3 is not initialized"); // Keeping console.log for debugging purposes
      return;
    }
  
    // Validate amount is not empty and not lower than 0.0001
    if (!isValidAmount(amount)) {
      setErrorMessage("Amount must not be empty and at least 0.0001");
      return;
    }
  
    const depositAmountWei = web3.utils.toWei(amount, 'ether');
  
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
  

  async function withdrawTokens() {
    // Ensure the function is targeting the Hypra network and lockbox for withdrawal
    if (!web3) {
      setErrorMessage("Web3 is not initialized");
      console.error("Web3 is not initialized");
      return;
    }
  
    // First, ensure you are on the correct Hypra network for the withdrawal
    const hypraChainId = 622277; // Assuming this is the correct chain ID for Hypra
    await switchNetwork(hypraChainId);
  
    // Use the lockbox ABI and address for Hypra
    const contract = new web3.eth.Contract(hypraLockboxABI, hypraLockboxAddress);
  
    try {
      const gasPrice = await web3.eth.getGasPrice();
      // Withdraw the specific amount. Ensure 'amountInWei' is defined or calculate it based on the required amount
      const amountInWei = web3.utils.toWei(amount.toString(), 'ether');
  
      // Perform the withdrawal from the Hypra lockbox
      await contract.methods.withdraw(amountInWei)
        .send({ from: userAccount, gasPrice })
        .on('transactionHash', hash => console.log(`Withdraw transaction hash: ${hash}`))
        .on('receipt', receipt => {
          console.log('Withdraw successful', receipt);
        })
        .on('error', error => {
          console.error('Error during withdrawal:', error);
          setErrorMessage(`Error during withdrawal: ${error.message}`);
        });
    } catch (error) {
      console.error("Error during withdrawal on Hypra:", error);
      setErrorMessage(`Error during withdrawal: ${error.message}`);
    }
  }
  
  
  async function burnTokens() {
    setErrorMessage(''); // Reset any previous error messages

    if (!isValidAddress(recipient)) {
        setErrorMessage("Invalid recipient address");
        return;
    }

    if (!isValidAmount(amount)) {
        setErrorMessage("Amount must be at least 0.0001");
        return;
    }

    try {
        // Ensure the network is correct for the burn operation
        await ensureCorrectNetwork();

        const bridgeAddress = bridgeDirection === 'hypraToPolygon' ? hypraBridgeAddress : polygonBridgeAddress;
        const bridgeABI = bridgeDirection === 'hypraToPolygon' ? hypraBridgeABI : polygonBridgeABI;
        const contract = new web3.eth.Contract(bridgeABI, bridgeAddress);

        const gasPrice = await web3.eth.getGasPrice();
        const amountInWei = web3.utils.toWei(amount, 'ether');

        // Perform the burn operation
        const transaction = await contract.methods.burn(recipient, amountInWei)
            .send({ from: userAccount, gasPrice });

        console.log("Burn successful");

        // Extract action ID and nonce from the `ActionCreated` event
        const actionCreatedEvent = transaction.events.ActionCreated;
        if (actionCreatedEvent) {
            const actionId = actionCreatedEvent.returnValues.id;
            const nonce = actionCreatedEvent.returnValues.nonce;
            console.log(`Action ID from ActionCreated: ${actionId}`);
            console.log(`Nonce from ActionCreated: ${nonce}`);

            setActionId(actionId); // Store actionId for later use, such as requesting authorization
            setBridgeNonce(nonce); // Store nonce for potential use in minting process

            // At this point, the burn action has been performed, and an event emitted.
            // The Oracle should be set up to listen for these `ActionCreated` events,
            // verify the burn transaction, and then perform authorization for minting 
            // on the main chain accordingly.

            // Optionally, clear the error message if the transaction was successful
            setErrorMessage('');
        } else {
            // Handle the case where the expected event is not emitted
            setErrorMessage("Burn successful, but no ActionCreated event found.");
        }
    } catch (error) {
        console.error("Error during burn:", error);
        setErrorMessage(`Error during burn: ${error.message}`);
    }
}


async function requestAuthorization() {
  if (!web3 || !actionId) {
    setErrorMessage("Web3 not initialized or Action ID unavailable.");
    return;
  }

  const targetChainId = bridgeDirection === 'hypraToPolygon' ? 137 : 622277;
  await switchNetwork(targetChainId);

  const contract = new web3.eth.Contract(polygonBridgeABI, polygonBridgeAddress);

  try {
    const currentGasCost = await contract.methods.gasCost().call();
    const gasPrice = await web3.eth.getGasPrice(); // Fetch current gas price from the network

    let transactionParameters = {
      from: userAccount,
      value: currentGasCost, // Dynamic gas cost fetched from the contract
      gasPrice: gasPrice  // Use legacy gasPrice for all transactions
    };

    await contract.methods.requestAuthorization(actionId)
      .send(transactionParameters)
      .on('transactionHash', (hash) => {
        console.log(`Authorization request transaction hash: ${hash}`);
        setFrontendMessage("Authorization request sent. Waiting for approval...");
      })
      .on('receipt', (receipt) => {
        console.log('Authorization request completed', receipt);
        if (receipt.status) {
          setFrontendMessage("Waiting for authorization...");
          waitForAuthorization(actionId);
        } else {
          setErrorMessage("Authorization request failed.");
        }
      })
      .on('error', (error) => {
        console.error('Error requesting authorization:', error);
        setErrorMessage('Error requesting authorization. Please try again.');
      });
  } catch (error) {
    console.error('Error requesting authorization:', error);
    setErrorMessage('Error requesting authorization. Please try again.');
  }
}


function waitForAuthorization(actionId) {
  return new Promise((resolve, reject) => {
    if (!web3 || !actionId) {
      reject("Web3 not initialized or Action ID unavailable.");
      return;
    }

    try {
      console.log(`Checking authorization for action ID: ${actionId}`);
      const bridgeAddress = bridgeDirection === 'hypraToPolygon' ? hypraBridgeAddress : polygonBridgeAddress;
      const bridgeABI = bridgeDirection === 'hypraToPolygon' ? hypraBridgeABI : polygonBridgeABI;
      const contract = new web3.eth.Contract(bridgeABI, bridgeAddress);

      const checkAuthorization = async () => {
        const isAuthorized = await contract.methods.authorizedActions(actionId).call();
        if (isAuthorized) {
          console.log('Authorization confirmed for action ID:', actionId);
          clearInterval(checkInterval);
          setFrontendMessage("Authorization confirmed. Proceeding with token minting..."); // Update the message upon confirmation
          resolve(); // Resolve the promise when authorization is confirmed
        } else {
          console.log('Polling for authorization...');
        }
      };

      const checkInterval = setInterval(checkAuthorization, 10000);
    } catch (error) {
      console.error('Error in waitForAuthorization:', error);
      reject(error); // Reject the promise on error
    }
  });
}

  
async function mintTokens() {
  setErrorMessage(''); // Clear any existing error messages first

  if (!web3) {
    setErrorMessage("Web3 is not initialized");
    console.error("Web3 is not initialized");
    return;
  }

  try {
    let targetChainId, bridgeAddress, bridgeABI;
    if (bridgeDirection === 'polygonToHypra') {
      targetChainId = 622277; // Hypra's Chain ID
      bridgeAddress = hypraBridgeAddress;
      bridgeABI = hypraBridgeABI;
    } else {
      targetChainId = 137; // Polygon Mumbai Testnet Chain ID
      bridgeAddress = polygonBridgeAddress;
      bridgeABI = polygonBridgeABI;
    }

    await switchNetwork(targetChainId);

    const contract = new web3.eth.Contract(bridgeABI, bridgeAddress);
    const gasPrice = await web3.eth.getGasPrice();
    const amountInWei = web3.utils.toWei(amount.toString(), 'ether');

    await contract.methods.mint(recipient, bridgeNonce, amountInWei)
      .send({ from: userAccount, gasPrice })
      .on('transactionHash', hash => console.log(`Transaction hash: ${hash}`))
      .on('receipt', async (receipt) => {
        console.log('Mint successful', receipt);
        setErrorMessage(''); // Clear error message on successful transaction

        // Check if the transaction was successful
        if (receipt.status) {
          // Refresh the page to reflect the changes
          window.location.reload();
        }

        // If bridging from Polygon to Hypra, perform the withdraw action after minting
        if (bridgeDirection === 'polygonToHypra') {
          console.log('Proceeding to withdraw tokens...');
          await withdrawTokens(); // Call the withdraw function after minting
        }
      })
      .on('error', error => {
        console.error('Error minting tokens:', error);
        setErrorMessage(`Error minting tokens: ${error.message}`);
      });
  } catch (error) {
    console.error("Error during minting:", error);
    setErrorMessage(`Error during minting: ${error.message}`);
  }
}


async function depositAndInitiateBridge() {
  setDepositProgress(0);
  setErrorMessage('');

  if (!web3 || !isValidAddress(recipient) || !isValidAmount(amount)) {
    setErrorMessage("Validation failed");
    return;
  }

  if (parseFloat(amount) > parseFloat(bridgeDirection === 'hypraToPolygon' ? bridgeLimits.burnLimit : bridgeLimits.mintLimit)) {
    setLimitError("Amount exceeds the bridge limit.");
    return;
  }

  try {
    await ensureCorrectNetwork();
    setDepositProgress(25);

    if (bridgeDirection === 'hypraToPolygon') {
      await depositTokens();
      setDepositProgress(50);

      await burnTokens();
      setDepositProgress(75);

      setDepositProgress(100);
    } else {
      await burnTokens();
      setDepositProgress(50);

      setDepositProgress(100);
    }
  } catch (error) {
    console.error("Error in deposit and initiate bridge:", error);
    setErrorMessage(error.message || "An error occurred during the deposit and initiate bridge process.");
  }
}



async function authorizeAndCompleteBridge() {
  setAuthorizeProgress(0); // Reset authorize progress
  setErrorMessage('');

  if (!web3 || !actionId) {
    console.error("Web3 not initialized or action ID missing");
    setErrorMessage("Web3 not initialized or action ID missing");
    return;
  }

  try {
    await requestAuthorization();
    setAuthorizeProgress(25); // Update progress after request authorization

    // Assuming requestAuthorization is asynchronous and takes some time
    await waitForAuthorization(actionId); // Wait for authorization to be confirmed
    setAuthorizeProgress(50); // Update progress after authorization confirmed

    if (bridgeDirection === 'polygonToHypra') {
      // If bridging from Polygon to Hypra, withdraw tokens from lockbox after authorization
      await withdrawTokens(); // Withdraw tokens from the lockbox on Hypra
      setAuthorizeProgress(75); // Update progress after withdrawal
    }

    await mintTokens(); // Proceed to mint tokens once authorization is confirmed
    setAuthorizeProgress(100); // Complete the authorize progress
  } catch (error) {
    console.error("Error in authorization and complete bridge:", error);
    setErrorMessage(error.message);
  }
}

return (
  <>
    <header className="app-header">
      <div className="header-left">
        <span className="hypra-title">HYPRA</span>
        <button onClick={() => window.location.href = 'https://www.hypra.network/'} className="header-button">Home</button>
        <button onClick={() => window.location.href = 'https://explorer.hypra.network/'} className="header-button">Explorer</button>
        <button onClick={() => window.location.href = 'https://whyp.hypra.network/'} className="header-button">Wrapping</button>
      </div>
      <div className="header-placeholder"></div>
      <div className="header-buttons">
        <button onClick={addWHYPToken} className="small-action-btn">Add wHYP Token (Hypra)</button>
        <button onClick={addHYPToken} className="small-action-btn">Add wHYP Token (Polygon)</button>
      </div>
      <div className="connect-wallet-container">
        <button onClick={connectWallet} className="connect-wallet-btn">
          {userAccount ? 'Wallet Connected' : 'Connect Wallet'}
        </button>
      </div>
      <p className="header-instruction">
        Ensure you have both of these tokens imported into your wallet before using the bridge.<br />
        Also, make sure you have enough HYP and MATIC to cover the gas fees on both chains.
      </p>
    </header>

    <div className="app-container">
      <h1 className="artistic-text">HYPRA Bridge (beta)</h1>
      <p className="subtitle-text">This bridge allows you to send wrapped HYP (wHYP) between Hypra and Polygon.</p>

      <div>
        {bridgeDirection === 'hypraToPolygon' && <p>Your wHYP Balance: {whypBalance}</p>}
        {bridgeDirection === 'polygonToHypra' && <p>Your wHYP Balance: {hypBalance}</p>}
      </div>

      {limitError && (
        <div>
          <h1>Bridge Limits</h1>
          <p>Burning Limit: {bridgeLimits.burnLimit}</p>
          <p>Minting Limit: {bridgeLimits.mintLimit}</p>
          <div className="error-message">{limitError}</div>
        </div>
      )}

      {amount && recipient && parseFloat(amount) > 0 && (!amount || parseFloat(amount) > parseFloat(bridgeDirection === 'hypraToPolygon' ? whypBalance : hypBalance)) && (
        <div className="error-message">
          Insufficient funds for this operation.
          {bridgeDirection === 'hypraToPolygon' &&
            <a href="https://whyp.hypra.network/" target="_blank" rel="noopener noreferrer" className="get-more-whyp-btn">Get more wHYP</a>
          }
        </div>
      )}

      <div className="input-group">
        <label>Bridge Direction:</label>
        <select value={bridgeDirection} onChange={(e) => setBridgeDirection(e.target.value)}>
          <option value="hypraToPolygon">Hypra to Polygon</option>
          <option value="polygonToHypra">Polygon to Hypra</option>
        </select>
      </div>

      <div className="input-group">
  {!userAccount && (
    <p className="warning-message">Please connect your wallet to proceed.</p>
  )}
  <input 
    type="text" 
    value={amount}
    readOnly={!userAccount}  // Makes the field read-only if the wallet is not connected
    onChange={(e) => {
      setAmount(e.target.value);
      if (parseFloat(e.target.value) > parseFloat(bridgeDirection === 'hypraToPolygon' ? bridgeLimits.burnLimit : bridgeLimits.mintLimit)) {
        setLimitError("Amount exceeds the bridge limit.");
      } else {
        setLimitError('');
      }
    }} 
    placeholder="Amount to transfer" 
  />
  <input 
    type="text" 
    value={recipient}
    readOnly={!userAccount}  // Optionally make this read-only too until wallet is connected
    onChange={(e) => setRecipient(e.target.value)} 
    placeholder={userAccount ? "Enter recipient address" : "Connect wallet to set recipient"}
  />
</div>


      <button onClick={depositAndInitiateBridge} className="action-btn" disabled={!amount || parseFloat(amount) > parseFloat(bridgeDirection === 'hypraToPolygon' ? whypBalance : hypBalance) || limitError}>
        (step 1) Deposit & Initiate Bridge
      </button>
      {depositProgress > 0 && (
        <div className="progress-container progress-deposit">
          <progress value={depositProgress} max="100" className="progress-bar"></progress>
          <p className="progress-text">Step 1: {depositProgress}%</p>
        </div>
      )}

      <button onClick={authorizeAndCompleteBridge} className="action-btn" disabled={limitError}>
        (step 2) Authorize & Complete Bridge
      </button>
      {authorizeProgress > 0 && (
        <div className="progress-container progress-authorize">
          <progress value={authorizeProgress} max="100" className="progress-bar"></progress>
          <p className="progress-text">Step 2: {authorizeProgress}%</p>
        </div>
      )}

      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {frontendMessage && <div className="frontend-message">{frontendMessage}</div>}
    </div>
  </>
);

}

export default App;
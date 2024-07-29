import Web3 from "web3";
import contract from "@truffle/contract";
import data from "./build/contracts/Election.json" assert { type: "json" };

export const web3 = new Web3("https://public-node.testnet.rsk.co/");
// const web3 = new Web3("https://data-seed-prebsc-1-s1.binance.org:8545");
// const web3 = new Web3("http://127.0.0.1:7545");

const ElectionContract = contract(data);

// Set the provider directly from web3
ElectionContract.setProvider(web3.currentProvider);

export default ElectionContract;

// import Web3 from "web3";
// import data from "../build/contracts/Election.json";

// export const web3 = new Web3("http://localhost:7545");

// const provider = new Web3.providers.HttpProvider("http://localhost:7545");
// const contract = require("@truffle/contract");

// const ElectionContract = contract(data);

// ElectionContract.setProvider(provider);

// export default ElectionContract;
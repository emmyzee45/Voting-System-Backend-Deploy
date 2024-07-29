import ElectionContract, { web3 } from "../../web3.js";

export default async (req, res) => {
  try{
    const accounts = await web3.eth.getAccounts();
    const instance = await ElectionContract.deployed();
  
    const status = await instance.getStatus();
    if (status !== "finished")
      return res.status(400).send("election not finished or already reset");
  
    await instance.resetElection({ from: accounts[0] });
  
    return res.send("successful"); 
  }catch(err){
    console.log(err);
  }
};

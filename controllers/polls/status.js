import ElectionContract from "../../web3.js";

export default async (req, res) => {
  try{
    const instance = await ElectionContract.deployed();

  const status = await instance.getStatus();
  console.log(status)
  return res.send({ status });
  }catch(err){
    console.log(err)
  }
};

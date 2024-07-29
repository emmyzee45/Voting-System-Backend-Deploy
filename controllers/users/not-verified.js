import User from "../../entity/User.js";

export default async (req, res) => {
  const users = await User.find(
    { verified: false }
  ).select("id name citizenshipNumber email");

  return res.send({ users });
};
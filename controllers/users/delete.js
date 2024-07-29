import User from "../../entity/User.js";

export default async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).send("no id found");

  try {
    await User.findByIdAndDelete(id);
  } catch (error) {
    return res.status(400).send({ error });
  }

  return res.send({ userId: id });
};

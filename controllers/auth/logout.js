
export default (req, res) => {
  res.clearCookie("refreshToken");
  res.end();
};

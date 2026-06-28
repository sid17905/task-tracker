export const currentUser = (req, res, next) => {
  const email = String(req.header("x-user-email") || "").trim().toLowerCase();
  const name = String(req.header("x-user-name") || "").trim();

  if (!email) {
    return res.status(401).json({ message: "Signed-in user email is required" });
  }

  req.user = {
    email,
    name: name || email.split("@")[0]
  };
  next();
};

router.post("/yo", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    console.log(user);
    res.json({ success: true });
  } catch (error) {
    console.error("Error adding tasks:", error);
    res.json({ success: false });
  }
});

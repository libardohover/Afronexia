function stub(sprint, requisitos) {
  return (req, res) => {
    res.status(501).json({ error: "Endpoint pendiente de implementación.", sprint, requisitos });
  };
}
module.exports = { stub };

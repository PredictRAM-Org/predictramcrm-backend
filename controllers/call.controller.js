module.exports = class CallController {
  static async handelIncomeingCall(req, res, next) {
    try {
      const { uid, clid } = req.body;
      console.log(uid, clid);
      res.send({
        action: "tts",
        value: "welcome to AssetRam",
      });
    } catch (err) {
      next(err);
    }
  }
};

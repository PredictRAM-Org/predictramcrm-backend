const { KycController } = require("../../controllers");
const auth = require("../../middlewares/auth");

const router = require("express").Router();

router.post("/esign", auth, KycController.sendESignRequest);
router.post("/ekyc", auth, KycController.sendEKYCRequest);
router.get("/ekyc/report", auth, KycController.getEKYCDocReport);
router.get("/esign/doc", auth, KycController.getESignDoc);
//router.post("/webhook/auth", KycController.kycAuth);
router.post("/webhook/send", KycController.kycWebhook);

module.exports = router;

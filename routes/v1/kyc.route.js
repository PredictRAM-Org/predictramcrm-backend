const { KycController } = require("../../controllers");
const auth = require("../../middlewares/auth");

const router = require("express").Router();

router.post("/esign", auth, KycController.sendESignRequest);
router.post("/esign/response", KycController.handelESignResponse);
router.post("/ekyc", auth, KycController.sendEKYCRequest);
router.post("/ekyc-verify", auth, KycController.verifyEKYCRequest);
// router.get("/ekyc/report", auth, KycController.getEKYCDocReport);
// router.get("/esign/doc", auth, KycController.getESignDoc);
// router.post("/send", KycController.sendKYCRequest);

module.exports = router;

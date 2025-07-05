const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const { raiseWarrantyClaim, getProductsClaimList, getWarrantyClaimsByProductId, getWarrantyClaimsById, getCustomerWarrantyClaimHistory, rejectWarrantyClaim, approveWarrantyClaim, resolveWarrantyClaim, getClaimsCount } = require("../controllers/warrantyClaimController");
const { upload } = require("../middlewares/upload");

const router = express.Router();

router.post(
    '/',
    authenticate(["customer"]),
    upload.fields([
        { name: 'invoice', maxCount: 1 },
        { name: 'warrantySlip', maxCount: 1 },
        { name: 'media', maxCount: 3 }
    ]),
    raiseWarrantyClaim
);

//warranty claim list with claim count api
router.get(
    '/getProductsClaimList',
    authenticate(["store"]),
    getProductsClaimList
);

//warranty claims of specific product api
router.get(
    '/getWarrantyClaimsByProductId/:productId',
    authenticate(["store"]),
    getWarrantyClaimsByProductId
);

//warranty claim details api
router.get(
    '/getWarrantyClaimsById/:id',
    authenticate(["store"]),
    getWarrantyClaimsById
);

//warranty claim history api
router.get(
    "/claimHistory/:customerId/:productId",
    authenticate(["store"]),
    getCustomerWarrantyClaimHistory
);

//reject warranty claim api
router.put(
    "/reject/:claimId",
    authenticate(["store"]),
    rejectWarrantyClaim
);

//approve warranty claim api
router.put(
    '/approve/:claimId',
    authenticate(["store"]),
    approveWarrantyClaim
);

//resolve warranty claim api
router.put(
    '/resolve/:claimId',
    authenticate(["store"]),
    resolveWarrantyClaim
);

//warranty claims count api
router.get(
    '/getClaimsCount',
    authenticate(["store"]),
    getClaimsCount
);

module.exports = router;
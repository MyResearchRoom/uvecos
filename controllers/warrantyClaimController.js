const { log } = require("winston");
const { WarrantyClaim, WarrantyImage, User, CustomerAddress, Product, OrderItem, Sequelize } = require("../models");
const { generateRandomSerialNo, generateRandomClaimId } = require("../utils/idGenerator");
const { where } = require("sequelize");

exports.raiseWarrantyClaim = async (req, res) => {
    try {
        const customerId = req.user.id;
        const { orderId, productId, issue } = req.body;

        if (!orderId || !productId || !issue) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        const invoiceFiles = req.files.invoice;
        const warrantySlipFiles = req.files.warrantySlip;
        const media = req.files.media || [];


        if (!invoiceFiles || !warrantySlipFiles) {
            return res.status(400).json({
                success: false,
                message: "Invoice and warranty slip are required."
            });
        }

        if (invoiceFiles.length > 1 || warrantySlipFiles.length > 1) {
            return res.status(400).json({
                success: false,
                message: 'Only one file is allowed for both Invoice and Warranty Slip.',
            });
        }

        const invoice = invoiceFiles[0];
        const warrantySlip = warrantySlipFiles[0];

        const newClaim = await WarrantyClaim.create({
            customerId,
            orderId,
            productId,
            issue,
            serialNo: generateRandomSerialNo(),
            claimId: generateRandomClaimId(),
            date: new Date(),
            invoice: invoice.buffer,
            invoiceType: invoice.mimetype,
            warrantySlip: warrantySlip.buffer,
            warrantySlipType: warrantySlip.mimetype,
        });

        const mediaEntries = media.map((file) => ({
            warrantyClaimId: newClaim.id,
            image: file.buffer,
            contentType: file.mimetype,
        }));

        if (mediaEntries.length > 0) {
            await WarrantyImage.bulkCreate(mediaEntries);
        }

        res.status(201).json({
            success: true,
            message: 'Warranty claim submitted successfully.',
            data: newClaim
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit claim.'
        });
    }
};

exports.getProductsClaimList = async (req, res) => {
    try {
        const listData = await WarrantyClaim.findAll({
            attributes: [
                'productId',
                [Sequelize.fn('COUNT', Sequelize.col('productId')), 'claimCount']
            ],
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'productName']
                }
            ],
            group: ['productId', 'product.id']
        });

        const claimListData = listData.map((item) => ({
            id: item.product.id,
            productName: item.product.productName,
            claimCount: parseInt(item.get('claimCount'))
        }));


        res.status(200).json({
            success: true,
            message: "Products claim list fetched successfully.",
            data: claimListData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to fetch Products claim list." });
    }
};

exports.getWarrantyClaimsByProductId = async (req, res) => {
    try {
        const { productId } = req.params;
        const { status, date } = req.query;

        const whereClause = { productId };

        if (status) {
            whereClause.status = status;
        }

        if (date) {
            whereClause.date = date;
        }

        const claimsData = await WarrantyClaim.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'customer',
                    attributes: ['name']
                }
            ],
            attributes: [
                "id",
                "claimId",
                "serialNo",
                "issue",
                "status",
                "date",
                "resolutionSummary"
            ],
        });
        if (!claimsData || claimsData.length === 0) {
            res.status(404).json({
                success: false,
                message: "No warranty claims found for this product."
            });
        }

        const data = claimsData.map((claim) => ({
            id: claim.id,
            claimId: claim.claimId,
            serialNo: claim.serialNo,
            issue: claim.issue,
            status: claim.status,
            date: claim.date,
            resolutionSummary: claim.resolutionSummary,
            customerName: claim.customer?.name || null
        }))

        res.status(200).json({
            success: true,
            message: "Warranty claims fetched successfully.",
            data: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch warranty claims."
        });
    }
};

exports.getWarrantyClaimsById = async (req, res) => {
    try {
        const { id } = req.params;

        const claim = await WarrantyClaim.findOne({
            where: { id },
            include: [
                {
                    model: User,
                    as: "customer",
                    attributes: ["name", "email", "mobileNumber"],
                    include: [
                        {
                            model: CustomerAddress,
                            as: "customerAddress",
                            attributes: ["baseAddress", "street", "city", "state", "district", "country"]
                        }
                    ]
                },
                {
                    model: Product,
                    as: "product",
                    attributes: ["productName", "warranty"]
                },
                {
                    model: OrderItem,
                    as: "order",
                    attributes: ["orderId"]
                },
                {
                    model: WarrantyImage,
                    as: "images",
                    attributes: ["id", "image", "contentType", "createdAt"]
                }
            ],
        });

        if (!claim) {
            return res.status(404).json({
                success: false,
                message: "Warranty claim details not found."
            });
        }

        const claimData = {
            id: claim.id,
            claimId: claim.claimId,
            serialNo: claim.serialNo,
            date: claim.date,
            issue: claim.issue,
            status: claim.status,
            resolutionSummary: claim.resolutionSummary,
            rejectReason: claim.rejectReason,
            customer: claim.customer,
            address: claim.address,
            product: claim.product,
            order: claim.order,
            invoice: {
                contentType: claim.invoiceType,
                dataUrl: `data:${claim.invoiceType};base64,${claim.invoice.toString("base64")}`
            },
            warrantySlip: {
                contentType: claim.warrantySlipType,
                dataUrl: `data:${claim.warrantySlipType};base64,${claim.warrantySlip.toString("base64")}`
            },
            images: claim.images.map(img => ({
                id: img.id,
                createdAt: img.createdAt,
                contentType: img.contentType,
                dataUrl: `data:${img.contentType};base64,${img.image.toString("base64")}`
            }))
        };

        res.status(200).json({
            success: true,
            message: "Warranty claim details fetched successfully.",
            data: claimData
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to get warranty claim details."
        });
    }
};

exports.getCustomerWarrantyClaimHistory = async (req, res) => {
    try {
        const { customerId, productId } = req.params;

        if (!customerId || !productId) {
            return res.status(400).json({
                success: false,
                message: "Product and customer are required."
            });
        }

        const claimsData = await WarrantyClaim.findAll({
            where: { customerId, productId },
            include: [
                {
                    model: Product,
                    as: "product",
                    attributes: ["productName"]
                },
                {
                    model: User,
                    as: "customer",
                    attributes: ["name"]
                }
            ],
            attributes: [
                "id",
                "claimId",
                "issue",
                "status",
                "date",
                "resolutionSummary"
            ]
        });

        if (!claimsData.length) {
            return res.status(404).json({
                success: false,
                message: "No claim history found for this product."
            });
        }

        const customer = claimsData[0].customer;
        const product = claimsData[0].product;

        const data = claimsData.map((claim) => ({
            id: claim.id,
            claimId: claim.claimId,
            issue: claim.issue,
            status: claim.status,
            date: claim.date,
            resolutionSummary: claim.resolutionSummary
        }))

        res.status(200).json({
            success: true,
            message: "Claim history fetched successfully.",
            customer: {
                customerName: customer.name,
            },
            product: {
                productName: product.productName
            },
            totalClaims: data.length,

            data: data

        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch claim history."
        });
    }
};

exports.rejectWarrantyClaim = async (req, res) => {
    try {
        const { claimId } = req.params;
        const { reason } = req.body;

        if (!claimId || !reason) {
            return res.status(400).json({
                success: false,
                message: "Claim ID and rejection reason are required."
            });
        }

        const claim = await WarrantyClaim.findOne({ where: { claimId } });

        if (!claim) {
            return res.status(404).json({
                success: false,
                message: "Warranty Claim not found."
            });
        }

        if (claim.status === "rejected") {
            return res.status(400).json({
                success: false,
                message: "Claim has already been rejected."
            });
        }

        claim.status = "rejected"
        claim.rejectReason = reason;
        await claim.save();

        res.status(200).json({
            success: true,
            message: "Warranty Claim rejected successfully.",
            data: {
                claimId: claim.claimId,
                status: claim.status,
                rejectReason: claim.rejectReason
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

exports.approveWarrantyClaim = async (req, res) => {
    try {
        const { claimId } = req.params;

        if (!claimId) {
            return res.status(400).json({
                success: false,
                message: "Claim Id is required"
            });
        }

        const claim = await WarrantyClaim.findOne({ where: { claimId } });

        if (!claim) {
            return res.status(404).json({
                success: false,
                message: "Warranty claim not found"
            });
        }

        claim.status = "approved"
        await claim.save();

        res.status(200).json({
            success: true,
            message: "Warranty Claim approved successfully.",
            data: {
                claimId: claim.claimId,
                status: claim.status
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to approve warranty claim."
        });
    }
};

exports.resolveWarrantyClaim = async (req, res) => {
    try {
        const { claimId } = req.params;
        const { summary } = req.body;

        if (!claimId) {
            return res.status(400).json({
                success: false,
                message: "Claim Id is required"
            });
        }

        const claim = await WarrantyClaim.findOne({ where: { claimId } });

        if (!claim) {
            return res.status(404).json({
                success: false,
                message: "Warranty claim not found"
            });
        }

        if (claim.status !== "approved") {
            return res.status(400).json({
                success: false,
                message: "Only approved claims can be resolved"
            });
        }

        claim.status = "resolved"
        claim.resolutionSummary = summary,
            await claim.save();

        return res.status(200).json({
            success: true,
            message: "Warranty claim status changed to resolved successfully.",
            data: {
                claimId: claim.claimId,
                status: claim.status,
                resolutionSummary: claim.resolutionSummary
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to change status of warranty claim to resolved."
        });
    }
};

exports.getClaimsCount = async (req, res) => {
    try {
        const totalClaims = await WarrantyClaim.count();
        const pendingClaims = await WarrantyClaim.count({ where: { status: "pending" } });
        const approvedClaims = await WarrantyClaim.count({ where: { status: ["approved", "resolved"] } });
        const rejectedClaims = await WarrantyClaim.count({ where: { status: "rejected" } });

        res.status(200).json({
            success: true,
            message: "Claims count fetched successfully.",
            data: { totalClaims, pendingClaims, approvedClaims, rejectedClaims }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch claims count."
        });
    }
};
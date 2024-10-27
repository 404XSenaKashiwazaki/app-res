import { check } from "express-validator"
import { Orders, Payments } from "../../models/Index.js"

export const rule = [
    check("payments.*.amount").trim().notEmpty().withMessage("Jumlah Pembayaran tidak boleh kosong"),
    check("payments.*.bill_amount").trim().notEmpty().withMessage("Jumlah Tagihan Pembayaran tidak boleh kosong").custom( (billAmount,{ req }) => {
        if(billAmount < req.body.payments[0].amount) throw new Error("Jumlah Pembayaran kurang")
        return true
    }),
    check("payments.*.return_amount").custom( (returnAmount,{ req }) => {
        const kebalian = req.body.payments[0].bill_amount - req.body.payments[0].amount
        req.body.payments[0].kembalian = kebalian
        return true
    }),
    check("payments.*.PaymentsMethodId").trim().notEmpty().withMessage("Metode Pembayaran tidak boleh kosong"),
    // check("payments.*.payment_date").notEmpty().withMessage("Tanggal Pembayaran tidak boleh kosong").isDate().withMessage("Tanggal Pembayaran tidak valid"),
    check("payments.*.OrderId").notEmpty().withMessage("Data Order tidak boleh kosong").custom( async (OrderId,{ req }) => {
        const paymentsInDb = await Payments.findOne({  where: { OrderId: OrderId  }, include: [{ model: Orders, where: { UserId: req.body.payments[0].UserId } }]})
        if(!paymentsInDb) throw new Error("Pembayaran Order tidak valid")
        return true
    }),
    check("payments.*.UserId").notEmpty().withMessage("Data Order tidak boleh kosong"),
]
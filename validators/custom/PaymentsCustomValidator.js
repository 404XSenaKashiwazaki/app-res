import { check } from "express-validator"

export const rule = [
    check("amount").trim().notEmpty().withMessage("Jumlah Pembayaran tidak boleh kosong"),
    check("PaymentMethodId").trim().notEmpty().withMessage("Metode Pembayaran tidak boleh kosong"),
    check("payment_date").trim().notEmpty("Tanggal Pembayaran tidak boleh kosong").isDate().withMessage("Tanggal Pembayaran tidak valid"),
    check("OrderId").trim().notEmpty("Data Order tidak boleh kosong"),

]
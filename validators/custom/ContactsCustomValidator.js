import { check } from "express-validator"

export const rule = [
check("contacts.*.contacts_id").trim().notEmpty().withMessage("Contats tidak boleh kosong"),
    check("contacts.*.username").trim().notEmpty().withMessage("Username tidak boleh kosong"),
    check("contacts.*.email").trim().notEmpty().withMessage("Email tidak boleh kosong"),
    check("contacts.*.content").trim().optional(),
    check("contacts.*.tanggapan").trim().notEmpty().withMessage("Tanggapan tidak boleh kosong")
]

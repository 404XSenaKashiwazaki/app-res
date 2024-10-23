import { check } from "express-validator"

export const rule = [
    check("username").trim().notEmpty().withMessage("Username tidak boleh kosong"),
    check("email").trim().notEmpty().withMessage("Email tidak boleh kosong"),
    check("content").trim().notEmpty().withMessage("Isi Komentar tidak boleh kosong"),
    check("userId").trim().notEmpty().withMessage("Pembuat tidak boleh kosong"),
]
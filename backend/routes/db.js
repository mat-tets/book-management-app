import express from "express";

import { pool } from "../connection/database.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    return res.status(200).json({
      success: true,
      message: "Databese OK",
      data: result.rows[0],
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Database ERROR",
      data: null,
    });
  }
});

export default router;

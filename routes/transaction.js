const express = require("express");
const db = require("../config/db");
const transactionCommon = require("../common/transaction");

const router = express.Router();

router.get("/", async (req, res) => {
  const userId = req.userId;
  const { startDate, endDate, size, transactionType } = req.query;
  let userTransactions;

  try {
    userTransactions = await transactionCommon.getTransaction(
      userId,
      startDate,
      endDate,
      size,
      transactionType
    );
    if (userTransactions && userTransactions.length > 0) {
      res.send({
        data: userTransactions,
      });
    } else {
      res.status(200).json({ message: "no transaction found", data: [] });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/add", (req, res) => {
  const userId = req.userId;
  const {
    description,
    transaction_amount,
    transaction_type,
    transaction_date,
  } = req.body;

  if (
    !userId ||
    !description ||
    !transaction_amount ||
    !transaction_type ||
    !transaction_date
  ) {
    console.log("Bad request ", req.body);
    return res
      .status(400)
      .json({ message: "Please fill all the boxes mentioned" });
  }

  const timestamp = new Date(transaction_date);

  // Convert to local time
  const localDate = new Date(
    timestamp.toLocaleString("en-US", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  );

  // Set time to midnight (00:00:00)
  localDate.setHours(0, 0, 0, 0);

  // Format the date as "YYYY-MM-DD HH:mm:ss"
  const formattedDate =
    localDate.getFullYear() +
    "-" +
    String(localDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(localDate.getDate()).padStart(2, "0") +
    " " +
    String(localDate.getHours()).padStart(2, "0") +
    ":" +
    String(localDate.getMinutes()).padStart(2, "0") +
    ":" +
    String(localDate.getSeconds()).padStart(2, "0");
  const sql =
    "INSERT INTO user_transactions(user_id, description, transaction_amount, transaction_type,time_stamp) VALUES (?, ?, ?, ?, ?)";

  const values = [
    userId,
    description,
    transaction_amount,
    transaction_type,
    formattedDate,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error executing query", err);
      return res.status(500).json({ message: "Database error" });
    }

    const newTransactionId = result.insertId;

    db.query(
      "SELECT * FROM user_transactions WHERE transaction_id = ?",
      [newTransactionId],
      (err, rows) => {
        if (err) {
          console.error("Error fetching transaction", err);
          return res
            .status(500)
            .json({ message: "Database error while fetching transaction" });
        }
        return res.status(201).json({
          message: "Transaction added successfully",
          data: rows[0],
        });
      }
    );
  });
});

router.delete("/delete/:id", (req, res) => {
  const transactionId = req.params.id;

  if (!transactionId) {
    return res.status(400).json({ message: "Transaction ID is required" });
  }

  const sql = "DELETE FROM user_transactions WHERE transaction_id = ?";
  db.query(sql, [transactionId], (err, result) => {
    if (err) {
      console.error("Database error", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Transaction not found or not authorized" });
    }

    return res
      .status(200)
      .json({ message: "Transaction deleted successfully" });
  });
});

module.exports = router;

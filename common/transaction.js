const db = require("../config/db");

const convertToTimestamp = (date) => {
  const timestamp = new Date(date);

  const localDate = new Date(
    timestamp.toLocaleString("en-US", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  );

  localDate.setHours(0, 0, 0, 0);

  return (
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
    String(localDate.getSeconds()).padStart(2, "0")
  );
};

const getTransaction = async (
  userId,
  startDate,
  endDate,
  size,
  transactionType
) => {
  let query = "SELECT * FROM user_transactions WHERE user_id = ? ";
  const params = [];
  params.push(userId);

  if (startDate != null && endDate != null && transactionType != null) {
    startDate = convertToTimestamp(startDate);
    endDate = convertToTimestamp(endDate);

    query += "AND transaction_type = ? AND time_stamp BETWEEN ? and ? ";

    params.push(transactionType);
    params.push(startDate);
    params.push(endDate);
  }

  query += "ORDER BY time_stamp ";

  if (size != null) {
    query += "LIMIT ?";
    params.push(Number(size));
  }

  const transactions = await new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });

  return transactions;
};

module.exports = { getTransaction };

const express = require("express");
const cors = require("cors");
const authorizeRoute = require("./routes/authorize");
const TransactionRoute = require("./routes/transaction");
const chatbot = require("./routes/chatbot");
const authmiddleware = require("./middlewares/authmiddleware");
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/authorize", authorizeRoute);

app.use("/transactions", authmiddleware, TransactionRoute);

app.use("/chatbot", authmiddleware, chatbot);

app.listen(5000, () => {
  console.log("Listening on port 5000");
});

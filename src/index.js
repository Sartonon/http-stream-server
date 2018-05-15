const http = require("http");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const router = express.Router();

app.use(cors());
app.use(bodyParser.json());

const messages = [];

const EventEmitter = require("events").EventEmitter;
const messageBus = new EventEmitter();
messageBus.setMaxListeners(100);

router.get("/", (req, res) => {
  res.send("/");
});

router.get("/messages", (req, res) => {
  console.log("getMessages");
  res.writeHead(200, { "Content-Type": "application/json" });
  res.write("Connection open");
  function onMessage(data) {
    if (req.aborted) {
      console.log("aborted");
      messageBus.removeListener("message", onMessage);
    } else {
      res.write(JSON.stringify(data));
    }
  }
  messageBus.on("message", onMessage);

  setTimeout(() => {
    messageBus.removeListener("message", onMessage);
    res.end();
  }, 60000);
});

router.post("/messages", (req, res) => {
  messages.push(req.body);
  messageBus.emit("message", req.body);
  res.status(200).end();
});

router.get("/pastMessages", (req, res) => {
  res.send(messages);
});

app.use("/", router);

app.listen(9001, () => console.log("Example app listening on port 9001!"));

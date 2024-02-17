import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Schema, model } from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 5000;

dotenv.config();

app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "./public")));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Cookie, Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
  res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.get("/api/events", (req, res) => {
  if (req.query.surveyId) {
    SurveyModel.findById(req.query.surveyId).then(({ numberVotes }) => {
      res.send({ numberVotes });
    });
  } else res.sendStatus(200);
});

app.get("/api/numberoptions", (req, res) => {
  if (req.query.surveyId) {
    SurveyModel.findById(req.query.surveyId).then(({ numberOptions }) => {
      res.send({ numberOptions });
    });
  }
});

app.post("/api/generate-qr-code", (req, res) => {
  var newSurvey = new SurveyModel({
    _id: new mongoose.Types.ObjectId(),
    numberOptions: req.body.numberOptions || 2,
    numberVotes: 0,
    votes: {},
    creationDate: new Date(),
  });
  newSurvey
    .save()
    .then((newElement) => {
      res.send(newElement._id.toString());
    })
    .catch((err) => {
      console.log("save error ", err);
      if (err.name === "MongoError" && err.code === 11000) {
        res.json({ success: false, message: "already exists" });
        return;
      }
      res.json({ success: false, message: "some error happened" });
      return;
    });
});

app.post("/api/vote", (req, res) => {
  SurveyModel.findByIdAndUpdate(req.body.surveyId)
    .then((survey) => {
      const { vote } = req.body;
      survey.votes = Object.entries(vote).reduce((acc, currentValue) => {
        return { ...acc, [currentValue[0]]: (acc[currentValue[0]] || 0) + currentValue[1] };
      }, survey.votes || {});
      survey.numberVotes++;
      survey.save();
    })
    .catch((err) => {
      console.log("survey not found", err);
      res.send();
    });
});

app.get("/api/results", (req, res) => {
  if (req.query.surveyId) {
    SurveyModel.findById(req.query.surveyId).then(({ numberOptions, numberVotes, votes }) => {
      const votesIncludedZeros =
        votes !== undefined
          ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
              .split("")
              .slice(0, numberOptions)
              .reduce((acc, currentValue) => {
                return { ...acc, [currentValue]: votes[currentValue] || 0 };
              }, {})
          : undefined;
      res.send({ numberVotes, votes: votesIncludedZeros });
    });
  }
});

const surveySchema = new Schema({
  _id: Schema.Types.ObjectId,
  numberOptions: Number,
  creationDate: Date,
  votes: {},
  numberVotes: Number,
});
export const SurveyModel = model("Survey", surveySchema);

import mongoose from "mongoose";
mongoose.set("debug", true);
mongoose.set("strictQuery", true);
mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}.mongodb.net/${process.env.MONGO_DBNAME}?retryWrites=true&w=majority`
);
mongoose.Promise = Promise;

var db = mongoose.connection;
db.on("error", function (e) {
  console.error("connection error:", e);
});
db.once("open", function (callback) {
  // the connection to the DB is okay, let's start the application
  const httpServer = app.listen(process.env.PORT || port, () => {
    console.log(`Example app listening on port ${process.env.PORT || port}!`);
  });
});

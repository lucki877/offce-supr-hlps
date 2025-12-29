// controllers/adminMapController.js
import Submission from "../models/Submission.js";

export async function getMapData(req, res) {
  const submissions = await Submission.find(
    { lat: { $ne: null }, lon: { $ne: null } },
    {
      email: 1,
      ip: 1,
      country: 1,
      city: 1,
      isp: 1,
      lat: 1,
      lon: 1,
      time: 1
    }
  ).lean();

  res.json(submissions);
}
import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { faceID } = req.query;
  const FACEIO_API_KEY = process.env.FACEIO_API_KEY;

  if (!faceID || typeof faceID !== "string") {
    return res.status(400).json({ error: "Face ID is required" });
  }

  try {
    const response = await fetch(
      `https://api.faceio.net/deletefacialid?fid=${faceID}&key=${FACEIO_API_KEY}`
    );

    const text = await response.text(); // Read response as text

    try {
      const data = JSON.parse(text); // Convert response to JSON

      if (data.status !== 200) {
        console.error("FaceIO API Error:", data.error);
        return res.status(500).json({ error: data.error });
      }

      return res.status(200).json({ message: "Face ID deleted successfully" });
    } catch (parseError) {
      console.error("Invalid JSON response:", text);
      return res.status(200).json({ message: "Face ID deleted successfully (No JSON response from FaceIO)" });
    }
  } catch (error) {
    console.error("Error deleting Face ID:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

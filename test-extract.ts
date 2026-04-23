import { extractChartData } from "./src/services/gemini.ts";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  try {
    // Create a dummy 1x1 pixel base64 PNG
    const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const res = await extractChartData(dummyBase64, "image/png");
    console.log("Success:", res);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();

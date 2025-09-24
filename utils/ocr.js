import { createWorker } from "tesseract.js";

let ocrWorker = null;

async function ensureOcrWorker() {
  if (!ocrWorker) {
    ocrWorker = await createWorker("spa");
  }
}

export async function ocrFile(filePath) {
  await ensureOcrWorker();
  const { data } = await ocrWorker.recognize(filePath);
  return data.text || "";
}

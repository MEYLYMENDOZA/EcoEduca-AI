// ---------------------------------------------------------------------------
// Extracción de texto plano desde el material que el docente sube (PDF o Word),
// para que el motor de IA (aiGenerator.ts) lo use como fuente del contenido y
// de las preguntas de un tema/semana. Ver HU de "carga de material docente".
// ---------------------------------------------------------------------------

const PDF_MIME = "application/pdf";
const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const DOC_MIME = "application/msword";

export function isSupportedDocument(mimetype: string, originalName: string): boolean {
  const lower = originalName.toLowerCase();
  return (
    mimetype === PDF_MIME ||
    mimetype === DOCX_MIME ||
    mimetype === DOC_MIME ||
    lower.endsWith(".pdf") ||
    lower.endsWith(".docx") ||
    lower.endsWith(".doc")
  );
}

export async function extractTextFromDocument(
  buffer: Buffer,
  mimetype: string,
  originalName: string
): Promise<string> {
  const lower = originalName.toLowerCase();

  if (mimetype === PDF_MIME || lower.endsWith(".pdf")) {
    // Import diferido: pdf-parse ejecuta código de prueba al cargarse si no se
    // usa así, y solo lo necesitamos cuando realmente llega un PDF.
    const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (mimetype === DOCX_MIME || lower.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }

  throw new Error(
    "Formato de archivo no soportado. Sube un PDF o un Word (.docx)."
  );
}

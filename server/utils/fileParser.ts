import textract from "@nosferatu500/textract";
import { promisify } from "util";

const textractFromBuffer = promisify(textract.fromBufferWithName);

const TEXT_EXTENSIONS = new Set([
  'txt', 'js', 'ts', 'json', 'html', 'htm', 'atom', 'rss', 'md', 'markdown',
  'epub', 'xml', 'xsl', 'pdf', 'doc', 'docx', 'odt', 'ott', 'rtf',
  'xls', 'xlsx', 'xlsb', 'xlsm', 'xltx', 'csv', 'ods', 'ots',
  'pptx', 'potx', 'odp', 'otp', 'odg', 'otg', 'png', 'jpg', 'jpeg', 'gif', 'dxf'
]);

const TEXT_MIMETYPES = new Set([
  'text/html', 'text/htm', 'application/atom+xml', 'application/rss+xml',
  'text/markdown', 'application/epub+zip', 'application/xml', 'text/xml',
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.oasis.opendocument.text', 'application/rtf',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv', 'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.presentation',
  'application/vnd.oasis.opendocument.graphics',
  'image/png', 'image/jpeg', 'image/gif',
  'application/dxf', 'application/javascript'
]);

export async function parseFile(
  filename: string,
  buffer: Buffer,
  mimeType?: string
): Promise<string> {
  try {
    const ext = filename.split('.').pop()?.toLowerCase();

    // Use buffer.toString() for plain text files and specific cases
    if (
      mimeType?.startsWith('text/') ||
      mimeType === 'application/json' ||
      mimeType === 'application/javascript' ||
      ext === 'ts' ||
      ext === 'js' ||
      ext === 'json'
    ) {
      return buffer.toString();
    }

    // Use textract for supported file types
    if (
      TEXT_EXTENSIONS.has(ext) ||
      (mimeType && TEXT_MIMETYPES.has(mimeType))
    ) {
      const text = await textractFromBuffer(filename, buffer);
      return text;
    }

    // Default to buffer.toString() if no specific handling is defined
    return buffer.toString();
  } catch (error) {
    console.error("Error parsing file:", error);
    throw new Error(`Failed to parse file: ${error.message}`);
  }
}
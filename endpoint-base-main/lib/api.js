import fs from 'fs';
import path from 'path';

export function getApiSections() {
  const filePath = path.join(process.cwd(), 'data', 'api-sections.json');
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const apiSections = JSON.parse(fileContent);
    return apiSections;
  } catch (error) {
    console.error("Gagal membaca file api-sections.json:", error);
    return []; // Kembalikan array kosong jika gagal
  }
}

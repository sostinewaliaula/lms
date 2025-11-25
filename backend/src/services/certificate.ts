import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import pool from '../config/database';

const CERTIFICATES_DIR = path.join(process.env.UPLOAD_PATH || './uploads', 'certificates');

// Ensure certificates directory exists
if (!fs.existsSync(CERTIFICATES_DIR)) {
  fs.mkdirSync(CERTIFICATES_DIR, { recursive: true });
}

export const generateCertificate = async (
  user_id: string,
  course_id: string,
  certificate_number: string
): Promise<string> => {
  // Get user and course data
  const [userResult] = await pool.query(
    'SELECT first_name, last_name FROM users WHERE id = ?',
    [user_id]
  );
  const user = (userResult as any[])[0];

  const [courseResult] = await pool.query(
    'SELECT title FROM courses WHERE id = ?',
    [course_id]
  );
  const course = (courseResult as any[])[0];

  if (!user || !course) {
    throw new Error('User or course not found');
  }

  // Create PDF
  const filename = `certificate-${certificate_number}.pdf`;
  const filepath = path.join(CERTIFICATES_DIR, filename);

  const doc = new PDFDocument({
    size: 'LETTER',
    layout: 'landscape',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
  });

  doc.pipe(fs.createWriteStream(filepath));

  // Background
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#1a1f3a');

  // Border
  doc.strokeColor('#10b981').lineWidth(5).rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke();

  // Title
  doc.fontSize(48).fillColor('#10b981').text('Certificate of Completion', {
    align: 'center',
    y: 150,
  });

  // Subtitle
  doc.fontSize(20).fillColor('#ffffff').text('This is to certify that', {
    align: 'center',
    y: 250,
  });

  // Student name
  doc.fontSize(36).fillColor('#10b981').text(`${user.first_name} ${user.last_name}`, {
    align: 'center',
    y: 300,
  });

  // Course completion text
  doc.fontSize(18).fillColor('#ffffff').text('has successfully completed the course', {
    align: 'center',
    y: 380,
  });

  // Course name
  doc.fontSize(28).fillColor('#8b5cf6').text(course.title, {
    align: 'center',
    y: 420,
  });

  // Certificate number
  doc.fontSize(12).fillColor('#9ca3af').text(`Certificate Number: ${certificate_number}`, {
    align: 'center',
    y: 500,
  });

  // Date
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.fontSize(12).fillColor('#9ca3af').text(`Issued on: ${date}`, {
    align: 'center',
    y: 520,
  });

  doc.end();

  // Wait for PDF to be written
  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      const url = `/api/media/certificates/${filename}`;
      resolve(url);
    });
    doc.on('error', reject);
  });
};



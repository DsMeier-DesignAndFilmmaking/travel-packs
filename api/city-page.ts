// api/city-page.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  
  if (!slug || typeof slug !== 'string') {
    return res.status(400).send('Invalid city slug');
  }
  
  try {
    // Read the built index.html
    const indexPath = join(process.cwd(), 'dist', 'index.html');
    let html = readFileSync(indexPath, 'utf-8');
    
    // Replace the manifest link
    const manifestUrl = `/api/manifest/${slug}`;
    
    html = html.replace(
      /<link[^>]*rel="manifest"[^>]*>/i,
      `<link rel="manifest" href="${manifestUrl}">`
    );
    
    // Send the modified HTML
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.status(200).send(html);
    
  } catch (error) {
    console.error('Error serving city page:', error);
    res.status(500).send('Error loading page');
  }
}
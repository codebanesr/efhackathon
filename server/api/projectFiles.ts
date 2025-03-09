import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { mkdir, copyFile } from 'fs/promises';

const router = Router();

// Helper function to recursively copy a directory
async function copyDir(src: string, dest: string) {
  // Create the destination directory if it doesn't exist
  await mkdir(dest, { recursive: true });
  
  // Read the source directory
  const entries = await fs.promises.readdir(src, { withFileTypes: true });
  
  // Copy each entry
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively copy subdirectories
      await copyDir(srcPath, destPath);
    } else {
      // Copy files
      await copyFile(srcPath, destPath);
    }
  }
}

// Endpoint to copy a project to the extras folder
router.post('/copy-to-extras', async (req, res) => {
  try {
    const { sourcePath, projectName } = req.body;
    
    if (!sourcePath || !projectName) {
      return res.status(400).json({ error: 'Source path and project name are required' });
    }
    
    // Create the destination path in the extras folder
    const destPath = path.join(process.cwd(), 'extras', projectName);
    
    // Check if the destination already exists
    if (fs.existsSync(destPath)) {
      return res.status(409).json({ error: 'Project already exists in extras folder' });
    }
    
    // Copy the directory
    await copyDir(sourcePath, destPath);
    
    res.json({ success: true, path: `extras/${projectName}` });
  } catch (error) {
    console.error('Error copying project:', error);
    res.status(500).json({ error: 'Failed to copy project' });
  }
});

export default router; 
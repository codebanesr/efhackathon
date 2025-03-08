import { tool } from "@langchain/core/tools";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);

/**
 * Tool for file operations like creating, reading, listing, and deleting files
 */
export const fileTool = tool(
  async (input): Promise<string> => {
    const { operation, filePath, content, recursive } = input;
    
    try {
      switch (operation) {
        case "create":
          if (!filePath) {
            return "Error: File path is required for create operation";
          }
          
          // Ensure directory exists
          const dirPath = path.dirname(filePath);
          if (!fs.existsSync(dirPath)) {
            await mkdir(dirPath, { recursive: true });
          }
          
          await writeFile(filePath, content || "");
          return `File created successfully at ${filePath}`;
          
        case "read":
          if (!filePath) {
            return "Error: File path is required for read operation";
          }
          
          if (!fs.existsSync(filePath)) {
            return `Error: File ${filePath} does not exist`;
          }
          
          const fileContent = await readFile(filePath, "utf-8");
          return fileContent;
          
        case "delete":
          if (!filePath) {
            return "Error: File path is required for delete operation";
          }
          
          if (!fs.existsSync(filePath)) {
            return `Error: File ${filePath} does not exist`;
          }
          
          await unlink(filePath);
          return `File ${filePath} deleted successfully`;
          
        case "list":
          if (!filePath) {
            return "Error: Directory path is required for list operation";
          }
          
          if (!fs.existsSync(filePath)) {
            return `Error: Directory ${filePath} does not exist`;
          }
          
          const stats = await stat(filePath);
          if (!stats.isDirectory()) {
            return `Error: ${filePath} is not a directory`;
          }
          
          const files = await readdir(filePath);
          return files.join("\n");
          
        case "exists":
          if (!filePath) {
            return "Error: File path is required for exists operation";
          }
          
          const exists = fs.existsSync(filePath);
          return exists ? "true" : "false";
          
        case "append":
          if (!filePath) {
            return "Error: File path is required for append operation";
          }
          
          if (!content) {
            return "Error: Content is required for append operation";
          }
          
          if (!fs.existsSync(filePath)) {
            // Create file if it doesn't exist
            await writeFile(filePath, content);
            return `File created and content appended at ${filePath}`;
          } else {
            const existingContent = await readFile(filePath, "utf-8");
            await writeFile(filePath, existingContent + content);
            return `Content appended to ${filePath}`;
          }
          
        default:
          return `Error: Unsupported operation '${operation}'. Supported operations are: create, read, delete, list, exists, append`;
      }
    } catch (error) {
      return `Error performing file operation: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  {
    name: "file_operations",
    description: "Perform various file operations like creating, reading, listing, and deleting files",
    schema: z.object({
      operation: z.enum(["create", "read", "delete", "list", "exists", "append"])
        .describe("The file operation to perform"),
      filePath: z.string()
        .describe("Path to the file or directory for the operation"),
      content: z.string().optional()
        .describe("Content to write to the file (for create and append operations)"),
      recursive: z.boolean().optional().default(true)
        .describe("Whether to create directories recursively (for create operation)"),
    }),
  }
);
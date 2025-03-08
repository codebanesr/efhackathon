import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

/**
 * Tool for Docker operations: build images, run containers, and view logs
 */
export const dockerTool = tool(
  async (input): Promise<string> => {
    const { command } = input;
    
    if (!command?.startsWith('docker')) {
      return "Error: Command must start with 'docker'";
    }

    try {
      const result = await execAsync(command);
      return `Command output:\n${result.stdout}\n${result.stderr}`.trim();
    } catch (error) {
      return `Docker command failed: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  {
    name: "docker_cli",
    description: "Execute raw Docker commands and return their output",
    schema: z.object({
      command: z.string().describe("Full Docker command to execute (e.g. 'docker build -t my-image .')")
    }),
  }
);

// Example usage (uncomment to test)
/*
dockerTool.invoke({
  operation: "build",
  imageName: "my-app",
  dockerfile: "./Dockerfile"
}).then(console.log);
*/
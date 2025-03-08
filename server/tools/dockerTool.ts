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
    const { operation, imageName, containerName, dockerfile, port, command, tail } = input;
    
    try {
      switch (operation) {
        case "build":
          if (!dockerfile || !imageName) {
            return "Error: Both dockerfile path and image name are required for build operation";
          }
          
          // Check if Dockerfile exists
          const dockerfilePath = path.resolve(dockerfile);
          if (!fs.existsSync(dockerfilePath)) {
            return `Error: Dockerfile not found at ${dockerfilePath}`;
          }
          
          // Get directory containing the Dockerfile
          const contextDir = path.dirname(dockerfilePath);
          
          // Build the Docker image
          const buildResult = await execAsync(`docker build -t ${imageName} -f ${dockerfilePath} ${contextDir}`);
          return `Successfully built Docker image ${imageName}:\n${buildResult.stdout}`;
          
        case "run":
          if (!imageName) {
            return "Error: Image name is required for run operation";
          }
          
          let runCommand = `docker run -d`;
          
          // Add container name if provided
          if (containerName) {
            runCommand += ` --name ${containerName}`;
          }
          
          // Add port mapping if provided
          if (port) {
            runCommand += ` -p ${port}`;
          }
          
          // Add custom command if provided
          runCommand += ` ${imageName}`;
          if (command) {
            runCommand += ` ${command}`;
          }
          
          const runResult = await execAsync(runCommand);
          const containerId = runResult.stdout.trim();
          return `Successfully started container ${containerId} from image ${imageName}`;
          
        case "logs":
          if (!containerName) {
            return "Error: Container name or ID is required for logs operation";
          }
          
          let logsCommand = `docker logs`;
          
          // Add tail option if provided
          if (tail) {
            logsCommand += ` --tail ${tail}`;
          }
          
          logsCommand += ` ${containerName}`;
          
          const logsResult = await execAsync(logsCommand);
          return `Logs for container ${containerName}:\n${logsResult.stdout}`;
          
        default:
          return `Unsupported operation: ${operation}. Supported operations are: build, run, logs`;
      }
    } catch (error) {
      return `Docker operation failed: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  {
    name: "docker_operations",
    description: "Perform Docker operations: build images, run containers, and view logs",
    schema: z.object({
      operation: z.enum(["build", "run", "logs"]).describe("The Docker operation to perform: build, run, or logs"),
      imageName: z.string().optional().describe("The name for the Docker image (required for build and run operations)"),
      containerName: z.string().optional().describe("The name for the Docker container (optional for run, required for logs)"),
      dockerfile: z.string().optional().describe("Path to the Dockerfile (required for build operation)"),
      port: z.string().optional().describe("Port mapping for the container (e.g., '8080:80' for run operation)"),
      command: z.string().optional().describe("Custom command to run in the container (optional for run operation)"),
      tail: z.number().optional().describe("Number of lines to show from the end of logs (optional for logs operation)"),
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
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
    const { operation, imageName, containerName, dockerfile, port, command, tail, all } = input;
    
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
          return `Successfully built Docker image ${imageName}:\n${buildResult.stdout}\n${buildResult.stderr}`;

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
          return `Successfully started container ${runResult.stdout.trim()} from image ${imageName}\n${runResult.stderr}`;

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
          return `Logs for container ${containerName}:\n${logsResult.stdout}\n${logsResult.stderr}`;

        case "ps":
          // List containers
          let psCommand = "docker ps";
          if (all) {
            psCommand += " -a";
          }
          
          const psResult = await execAsync(psCommand);
          return `Docker containers:\n${psResult.stdout}\n${psResult.stderr}`;

        case "images":
          const imagesResult = await execAsync("docker images");
          return `Docker images:\n${imagesResult.stdout}\n${imagesResult.stderr}`;

        case "rm":
          // Remove container
          if (!containerName) {
            return "Error: Container name or ID is required for rm operation";
          }
          
          const rmResult = await execAsync(`docker rm ${containerName}`);
          return `Container removed:\n${rmResult.stdout}\n${rmResult.stderr}`;

        case "rmi":
          // Remove image
          if (!imageName) {
            return "Error: Image name or ID is required for rmi operation";
          }
          
          const rmiResult = await execAsync(`docker rmi ${imageName}`);
          return `Image removed:\n${rmiResult.stdout}\n${rmiResult.stderr}`;

        case "stop":
          // Stop container
          if (!containerName) {
            return "Error: Container name or ID is required for stop operation";
          }
          
          const stopResult = await execAsync(`docker stop ${containerName}`);
          return `Container stopped:\n${stopResult.stdout}\n${stopResult.stderr}`;

        case "prune":
          const pruneResult = await execAsync(`docker system prune -f`);
          return `Docker system pruned:\n${pruneResult.stdout}\n${pruneResult.stderr}`;
          
        default:
          return `Unsupported operation: ${operation}. Supported operations are: build, run, logs, ps, images, rm, rmi, stop, prune`;
      }
    } catch (error) {
      return `Docker operation failed: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  {
    name: "docker_operations",
    description: "Perform Docker operations: build images, run containers, view logs, list containers/images, and manage Docker resources",
    schema: z.object({
      operation: z.enum(["build", "run", "logs", "ps", "images", "rm", "rmi", "stop", "prune"])
        .describe("The Docker operation to perform: build, run, logs, ps, images, rm, rmi, stop, or prune"),
      imageName: z.string().optional().describe("The name for the Docker image (required for build, run, rmi operations)"),
      containerName: z.string().optional().describe("The name for the Docker container (optional for run, required for logs, rm, stop)"),
      dockerfile: z.string().optional().describe("Path to the Dockerfile (required for build operation)"),
      port: z.string().optional().describe("Port mapping for the container (e.g., '8080:80' for run operation)"),
      command: z.string().optional().describe("Custom command to run in the container (optional for run operation)"),
      tail: z.number().optional().describe("Number of lines to show from the end of logs (optional for logs operation)"),
      all: z.boolean().optional().describe("Show all containers, including stopped ones (optional for ps operation)"),
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
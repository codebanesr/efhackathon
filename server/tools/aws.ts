import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

const execAsync = promisify(exec);

// Load environment variables
dotenv.config();

/**
 * Tool for AWS EC2 deployment operations
 * Note: Use Public IPv4 address of the EC2 instance for ec2Ip
 */
export const awsTool = tool(
  async (input): Promise<string> => {
    const { operation, ec2Ip, dockerImage, containerPort, hostPort, envVars } = input;

    // Validate AWS credentials and environment variables
    if (!process.env.AWS_SSH_KEY_PATH) {
      return "Error: AWS_SSH_KEY_PATH is required in .env file";
    }

    // Get default port from environment or use 3000
    const defaultPort = process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 3000;

    const sshKeyPath = process.env.AWS_SSH_KEY_PATH;
    const ec2User = process.env.AWS_EC2_USER || 'ec2-user';

    try {
      switch (operation) {
        case "deploy":
          if (!ec2Ip || !dockerImage) {
            return "Error: EC2 IP and Docker image are required for deployment";
          }

          // Build SSH command prefix
          const sshPrefix = `ssh -i ${sshKeyPath} -o StrictHostKeyChecking=no ${ec2User}@${ec2Ip}`;

          // Pull the Docker image
          const pullCmd = `${sshPrefix} "docker pull ${dockerImage}"`;
          await execAsync(pullCmd);

          // Stop and remove any existing container
          const cleanupCmd = `${sshPrefix} "docker ps -q | xargs -r docker stop && docker ps -aq | xargs -r docker rm"`;
          await execAsync(cleanupCmd).catch(() => {}); // Ignore errors if no containers exist

          // Prepare environment variables for docker run
          const envString = envVars ? Object.entries(envVars)
            .map(([key, value]) => `-e ${key}=${value}`)
            .join(' ') : '';

          // Run the new container
          const effectiveContainerPort = containerPort || defaultPort;
          const effectiveHostPort = hostPort || effectiveContainerPort;
          const portMapping = `-p ${effectiveHostPort}:${effectiveContainerPort}`;
          const runCmd = `${sshPrefix} "docker run -d ${portMapping} ${envString} ${dockerImage}"`;
          const { stdout } = await execAsync(runCmd);

          return `Successfully deployed container ${stdout.trim()} on EC2 instance ${ec2Ip}`;

        case "status":
          if (!ec2Ip) {
            return "Error: EC2 IP is required for status check";
          }

          const statusCmd = `ssh -i ${sshKeyPath} -o StrictHostKeyChecking=no ${ec2User}@${ec2Ip} "docker ps"`;
          const { stdout: statusOutput } = await execAsync(statusCmd);
          return `Container status on ${ec2Ip}:\n${statusOutput}`;

        case "logs":
          if (!ec2Ip) {
            return "Error: EC2 IP is required for logs";
          }

          const logsCmd = `ssh -i ${sshKeyPath} -o StrictHostKeyChecking=no ${ec2User}@${ec2Ip} "docker logs \$(docker ps -q -l)"`;
          const { stdout: logsOutput } = await execAsync(logsCmd);
          return `Container logs on ${ec2Ip}:\n${logsOutput}`;

        default:
          return `Error: Unsupported operation '${operation}'. Supported operations are: deploy, status, logs`;
      }
    } catch (error) {
      return `Error performing AWS operation: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  {
    name: "aws_operations",
    description: "Perform AWS EC2 deployment operations with Docker containers",
    schema: z.object({
      operation: z.enum(["deploy", "status", "logs"])
        .describe("The AWS operation to perform"),
      ec2Ip: z.string()
        .describe("The IP address of the EC2 instance"),
      dockerImage: z.string().optional()
        .describe("The Docker image to deploy (required for deploy operation)"),
      containerPort: z.number().optional()
        .describe("The container port to expose"),
      hostPort: z.number().optional()
        .describe("The host port to map to the container port"),
      envVars: z.record(z.string()).optional()
        .describe("Environment variables to pass to the container"),
    }),
  }
);

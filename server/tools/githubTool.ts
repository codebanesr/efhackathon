import { tool } from "@langchain/core/tools";
import { z } from "zod";
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";

/**
 * Tool for cloning GitHub repositories to a specified directory
 */
export const githubTool = tool(
  async (input): Promise<string> => {
    const { repoUrl, branch } = input;
    const targetDir = "extras";
    
    // Ensure the target directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Extract repo name from URL for the target directory
    const repoName = repoUrl.split("/").pop()?.replace(".git", "") || "repo";
    const repoPath = path.join(targetDir, repoName);
    
    try {
      const git = simpleGit();
      
      // Check if directory already exists
      if (fs.existsSync(repoPath)) {
        return `Repository already exists at ${repoPath}. Please use a different name or remove the existing directory.`;
      }
      
      // Clone the repository
      if (branch) {
        await git.clone(repoUrl, repoPath, ["--branch", branch]);
        return `Successfully cloned repository ${repoUrl} (branch: ${branch}) to ${repoPath}`;
      } else {
        await git.clone(repoUrl, repoPath);
        return `Successfully cloned repository ${repoUrl} to ${repoPath}`;
      }
    } catch (error) {
      return `Failed to clone repository: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  {
    name: "github_clone",
    description: "Clone a GitHub repository to the /tmp/ef directory",
    schema: z.object({
      repoUrl: z.string().describe("The URL of the GitHub repository to clone (e.g., https://github.com/username/repo.git)"),
      branch: z.string().optional().describe("Optional branch name to checkout after cloning"),
    }),
  }
);

githubTool.invoke({
  repoUrl: "https://github.com/browser-use/browser-use.git",
  branch: "main"
}).then(console.log)
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatAnthropic } from "@langchain/anthropic";
import { githubTool } from "./tools/githubTool";
import { fileTool } from "./tools/fileTool";
import { dockerTool } from "./tools/dockerTool";

// Create the LLM instance

export const callReactAgent = async (userMessage = "What's the weather in NYC?") => {
    const llm = new ChatAnthropic({
        model: "claude-3-5-sonnet-20241022",
        temperature: 0,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY
    });

    const graph = createReactAgent({
        llm: llm,
        tools: [githubTool, fileTool, dockerTool],
    })

    const response = await graph.invoke({
        messages: [
            {
                role: "user",
                content: userMessage,
            },
        ],
    }, {
        "runId": "12345"
    })

    return response;
}
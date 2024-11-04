import Anthropic from "@anthropic-ai/sdk";
import { H3Event } from "h3";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

const MAX_MESSAGES = 4;
const MODEL = "claude-3-5-sonnet-20241022";
const MAX_TOKENS = 1024;
const TEMPERATURE = 0;

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Get configuration and request body
    const { anthropicKey } = useRuntimeConfig();
    const db = hubDatabase();
    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: anthropicKey,
    });

    if (!anthropicKey) {
      throw createError({
        statusCode: 500,
        message: "Anthropic API key is not configured",
      });
    }

    const body = await readBody(event);
    const messages = validateMessages(body.messages);

    const thread = await db
      .prepare("SELECT * FROM threads WHERE id = ?")
      .bind(body.threadId)
      .run();

    await db
      .prepare(
        "INSERT INTO messages (content, role , created_at , thread_id) VALUES ( ?, 'user' , ?, ?)"
      )
      .bind(
        ...[messages[messages.length - 1].content, Date.now(), body.threadId]
      )
      .run();

    // Process messages
    const processedMessages = preprocessMessages(messages);

    let systemMessage = [
      {
        type: "text",
        text:
          thread.results[0].system_message || "You are a helpfull assistant",
        cache_control: { type: "ephemeral" },
      },
    ];

    if (body.selectedFiles && body.selectedFiles.length > 0) {
      // retreive text from files
      const files = await db
        .prepare(
          ` SELECT 
                  f.name,
                  f.text
              FROM files f
              WHERE f.thread_id = ?
              AND f.id IN (?)`
        )
        .bind(...[body.threadId, ...body.selectedFiles])
        .run();

      for (let f = 0; f < files.results.length; f++) {
        const element = files.results[f];
        systemMessage.push({
          type: "text",
          text: element.text,
          cache_control: { type: "ephemeral" },
        });
      }
    }

    // Make API call
    const response = await anthropic.beta.promptCaching.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: processedMessages,
      temperature: thread.results[0].temperature || TEMPERATURE,
      system: systemMessage,
    });

    await db
      .prepare(
        "INSERT INTO messages (content, role , created_at, thread_id) VALUES ( ?, 'assistant' , ?, ?)"
      )
      .bind(...[response.content[0].text, Date.now(), body.threadId])
      .run();

    return response;
  } catch (error) {
    console.error("Error in Anthropic API handler:", error);

    throw createError({
      statusCode: error.status || 500,
      message: error.message || "Internal server error",
    });
  }
});

function validateMessages(messages: any): Message[] {
  if (!Array.isArray(messages)) {
    throw createError({
      statusCode: 400,
      message: "Messages must be an array",
    });
  }

  if (messages.length === 0) {
    throw createError({
      statusCode: 400,
      message: "Messages array cannot be empty",
    });
  }

  return messages.map((message) => {
    if (!message.role || !message.content) {
      throw createError({
        statusCode: 400,
        message: "Each message must have role and content properties",
      });
    }
    return message;
  });
}

function preprocessMessages(messages: Message[]): Message[] {
  // Create a new array with cleaned messages
  return messages
    .map(({ role, content }) => ({ role, content }))
    .slice(-MAX_MESSAGES);
}

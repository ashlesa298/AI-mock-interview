// Quick standalone test: is your Groq API key working?
// Run with: node test-groq.js

require("dotenv").config();

const API_KEY = process.env.GROQ_API_KEY;

async function testKey() {
  console.log("Testing Groq API key...\n");

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: "Say hello in one word",
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.log("❌ FAILED — status:", response.status);
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    console.log("✅ SUCCESS — Groq responded:");
    console.log(data.choices[0].message.content);
  } catch (err) {
    console.log("❌ Network/other error:", err.message);
  }
}

testKey();
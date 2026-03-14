const fs = require('fs');

const apiKey = "AIzaSyDuSmL3pmTwjbPuCs0KDgP7gcwOBxweZm8";
const results = {};

async function testModel(model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
      });
      const data = await response.json();
      results[model] = {
        status: response.status,
        data: data
      };
  } catch (e) {
      results[model] = { error: e.message };
  }
}

async function run() {
  await testModel('gemini-1.5-flash');
  await testModel('gemini-2.0-flash');
  await testModel('gemini-2.5-flash');
  fs.writeFileSync('out3.json', JSON.stringify(results, null, 2));
}
run();

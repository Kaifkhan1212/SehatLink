import fs from 'fs';

const apiKey = "AIzaSyDuSmL3pmTwjbPuCs0KDgP7gcwOBxweZm8";

async function testModel(model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
  });
  
  if (!response.ok) {
     const text = await response.text();
     console.log(`${model} failed: ${response.status} - ${text}`);
  } else {
     console.log(`${model} success!`);
  }
}

async function run() {
  await testModel('gemini-1.5-flash');
  await testModel('gemini-2.0-flash');
  await testModel('gemini-2.5-flash');
  await testModel('gemini-pro');
}
run();

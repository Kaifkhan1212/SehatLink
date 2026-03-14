const apiKey = "AIzaSyDuSmL3pmTwjbPuCs0KDgP7gcwOBxweZm8";

async function testModel(model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
      });
      const text = await response.text();
      console.log("---- MODEL:", model, "----");
      console.log("STATUS:", response.status);
      console.log("RESPONSE:", text);
      console.log("------------------------");
  } catch (e) {
      console.log("FETCH ERRROR:", model, e.message);
  }
}

async function run() {
  await testModel('gemini-1.5-flash');
  await testModel('gemini-2.0-flash');
  await testModel('gemini-2.5-flash');
}
run();

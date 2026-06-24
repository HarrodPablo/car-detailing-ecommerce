const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModel(modelName) {
  try {
    const genAI = new GoogleGenerativeAI('AQ.Ab8RN6LIiwW9TPXyAmqUH8Pbe5kuWEtnNKcZXAr4Py-h59p1Pw');
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hola");
    console.log(modelName, ":", await result.response.text());
  } catch (e) {
    console.log(modelName, "ERROR:", e.message);
  }
}

async function run() {
  await testModel('gemini-2.5-flash');
  await testModel('gemini-flash-latest');
  await testModel('gemini-2.0-flash-lite-001');
}
run();

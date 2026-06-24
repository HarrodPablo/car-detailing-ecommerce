const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testText() {
  try {
    const genAI = new GoogleGenerativeAI('AQ.Ab8RN6LIiwW9TPXyAmqUH8Pbe5kuWEtnNKcZXAr4Py-h59p1Pw');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent("Hola");
    console.log(await result.response.text());
  } catch (e) {
    console.error('ERROR OCCURRED:', e.message);
  }
}

testText();

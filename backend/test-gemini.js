const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiPDF() {
  try {
    const genAI = new GoogleGenerativeAI('AQ.Ab8RN6LIiwW9TPXyAmqUH8Pbe5kuWEtnNKcZXAr4Py-h59p1Pw');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const pdfBuffer = Buffer.from('%PDF-1.4\n%EOF\n');
    const imageParts = [
      {
        inlineData: {
          data: pdfBuffer.toString('base64'),
          mimeType: 'application/pdf'
        }
      }
    ];

    const prompt = 'Test';
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    console.log(response.text());
  } catch (e) {
    console.error('ERROR OCCURRED:', e.message);
  }
}

testGeminiPDF();

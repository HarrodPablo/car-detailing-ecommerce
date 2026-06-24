const fs = require('fs');

async function testUpload() {
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  let body = '';
  body += '--' + boundary + '\r\n';
  body += 'Content-Disposition: form-data; name="factura"; filename="test.pdf"\r\n';
  body += 'Content-Type: application/pdf\r\n\r\n';
  body += '%PDF-1.4\n%EOF\n\r\n';
  body += '--' + boundary + '--\r\n';

  try {
    const res = await fetch('http://localhost:5000/api/gastos/escanear-factura', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary
      },
      body: body
    });
    const data = await res.json();
    console.log(res.status, data);
  } catch (e) {
    console.error(e);
  }
}
testUpload();

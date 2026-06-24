async function checkModels() {
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=AQ.Ab8RN6LIiwW9TPXyAmqUH8Pbe5kuWEtnNKcZXAr4Py-h59p1Pw');
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}
checkModels();

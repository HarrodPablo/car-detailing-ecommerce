const { removeBackground } = require('@imgly/background-removal-node');

const removeBg = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }

    // Convertir Buffer a Blob con el mimetype correcto
    const inputBlob = new Blob([req.file.buffer], { type: req.file.mimetype });

    const blob = await removeBackground(inputBlob);
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const base64 = buffer.toString('base64');
    const imageBase64 = `data:image/png;base64,${base64}`;

    res.json({ success: true, imageBase64 });
  } catch (error) {
    console.error('REMOVE BG ERROR:', error);
    next(error);
  }
};

module.exports = { removeBg };
import app from "./app";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🌱 EcoEduca-AI Backend escuchando en http://localhost:${PORT}`);
});

const express = require("express");
const redis = require("redis");
const app = express();
const port = 3000;

const client = redis.createClient({
  socket: {
    host: 'redis',
    port: 6379
  }
});

app.use(express.json());

client.connect().catch(console.error);

app.post("/usuaris", async (req, res) => {
  const { user, pass, rol } = req.body;
  if (!user || !pass || !rol) return res.status(400).send("Falten camps");
  await client.hSet(`usuari:${user}`, { pass, rol });
  res.send("Usuari afegit");
});

app.get("/usuaris", async (req, res) => {
  const keys = await client.keys("usuari:*");
  const usuaris = [];

  for (const key of keys) {
    const data = await client.hGetAll(key);
    usuaris.push({ user: key.split(":")[1], ...data });
  }

  res.json(usuaris);
});

app.delete("/usuaris/:user", async (req, res) => {
  const key = `usuari:${req.params.user}`;
  await client.del(key);
  res.send("Usuari eliminat");
});

app.listen(port, () => {
  console.log(`API escoltant a http://localhost:${port}`);
});

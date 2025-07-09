import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: '9g9sOEjVi6XPmyihvq7AjcVc3B8odlOa',
    socket: {
        host: 'redis-16979.c74.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 16979
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

await client.set('foo', 'bar');
const result = await client.get('foo');
console.log(result)  // >>> bar



import express from "express";
import cors from "cors";
import redis from "redis";

const app = express();
app.use(cors());
app.use(express.json());

const client = redis.createClient({
  url: "redis://default:9g9sOEjVi6XPmyihvq7AjcVc3B8odlOa@redis-16979.c74.us-east-1-4.ec2.redns.redis-cloud.com:16979"
});
client.connect().catch(console.error);

app.get("/", (req, res) => {
  res.send("API d'usuaris operativa. Fes GET a /usuaris per veure dades.");
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

app.post("/alta", async (req, res) => {
  const { user, pass, rol } = req.body;
  await client.hSet(`usuari:${user}`, { pass, rol });
  res.sendStatus(201);
});

app.delete("/baixa/:user", async (req, res) => {
  const { user } = req.params;
  await client.del(`usuari:${user}`);
  res.sendStatus(200);
});

app.listen(3000, () => console.log("Backend escoltant a http://localhost:3000"));

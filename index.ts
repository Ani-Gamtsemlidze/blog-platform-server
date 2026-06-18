import express from "express";
import { prisma } from "./lib/prisma";
const app = express();
app.get('/test-db', async(req,res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
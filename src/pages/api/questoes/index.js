import { connectDB } from "@/lib/dbConnect";
import Questao from "@/models/questao.model.mjs";
import { getSession } from "next-auth/react";

// Essa rota permite listar (GET) e criar (POST) questões
export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    // Lista todas as questões (com informações completas)
    const questoes = await Questao.find();
    return res.status(200).json(questoes);
  }

  if (req.method === "POST") {
    // Apenas admin pode criar questões
    const session = await getSession({ req });
    if (!session?.user?.isAdmin) {
      return res.status(403).json({ error: "Apenas admin pode adicionar questões" });
    }

    const { tipo, enunciado, opcoes } = req.body;

    if (!tipo || !enunciado || !opcoes || !Array.isArray(opcoes)) {
      return res.status(400).json({ error: "Dados obrigatórios ausentes ou inválidos" });
    }

    const questao = await Questao.create({ tipo, enunciado, opcoes });
    return res.status(201).json(questao);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Método ${req.method} não permitido`);
}
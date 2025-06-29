import { connectDB } from "@/lib/dbConnect";
import Questao from "@/models/questao.model.mjs";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    // Paginação e busca
    const { page = 1, limit = 10, q, tipo } = req.query;
    const filter = {};

    if (q) {
      filter.enunciado = { $regex: q, $options: "i" };
    }
    if (tipo) {
      filter.tipo = tipo;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [questoes, total] = await Promise.all([
      Questao.find(filter).skip(skip).limit(parseInt(limit)),
      Questao.countDocuments(filter),
    ]);

    return res.status(200).json({
      questoes,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  }

  if (req.method === "POST") {
    const session = await getSession({ req });
    if (session?.user?.isAdmin === false) {
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
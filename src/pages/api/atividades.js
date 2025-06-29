import { connectDB } from "@/lib/dbConnect";
import Atividade from "@/models/atividade.model.mjs";
import Questao from "@/models/questao.model.mjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "POST") {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.isAdmin) {
      return res.status(403).json({ error: "Apenas admin pode acessar esta rota." });
    }

    const { titulo, descricao, dataInicio, dataFim, quantidadeQuestoes } = req.body;

    if (!titulo || !dataInicio || !dataFim || !quantidadeQuestoes || quantidadeQuestoes < 1) {
      return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    }

    const questoes = await Questao.aggregate([{ $sample: { size: Number(quantidadeQuestoes) } }]);
    if (questoes.length < quantidadeQuestoes) {
      return res.status(400).json({ error: "Não há questões suficientes no banco." });
    }

    const atividade = await Atividade.create({
      titulo,
      descricao,
      dataInicio,
      dataFim,
      questoes: questoes.map(q => q._id),
      ativa: true,
    });

    return res.status(201).json(atividade);
  }

  if (req.method === "GET") {
    // GET deve ser público ou só exigir autenticação se quiser
    const atividades = await Atividade.find().populate("questoes");
    return res.status(200).json(atividades);
  }

  res.status(405).end();
}
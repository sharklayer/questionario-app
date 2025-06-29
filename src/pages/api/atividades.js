import { connectDB } from "@/lib/dbConnect";
import Atividade from "@/models/atividade.model.mjs";
import Questao from "@/models/questao.model.mjs";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "POST") {
    const { titulo, descricao, dataInicio, dataFim, quantidadeQuestoes } = req.body;

    if (!titulo || !dataInicio || !dataFim || !quantidadeQuestoes || quantidadeQuestoes < 1) {
      return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    }

    // Sorteio das questões aleatórias
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
    // Para listar atividades (opcional)
    const atividades = await Atividade.find().populate("questoes");
    return res.status(200).json(atividades);
  }

  res.status(405).end();
}
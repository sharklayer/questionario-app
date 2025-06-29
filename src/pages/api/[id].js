import { connectDB } from "@/lib/dbConnect";
import Atividade from "@/models/atividade.model.mjs";
import Questao from "@/models/questao.model.mjs"; // Certifique-se que existe esse model
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  await connectDB();

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  const { id } = req.query;

  // GET: retorna detalhes da atividade
  if (req.method === "GET") {
    const atividade = await Atividade.findById(id).populate("questoes");
    if (!atividade) return res.status(404).json({ error: "Atividade não encontrada" });
    return res.status(200).json(atividade);
  }

  // PUT: atualiza campos editáveis (agora incluindo 'ativa')
  if (req.method === "PUT") {
    try {
      const { titulo, dataFim, quantidadeQuestoes, ativa } = req.body;
      const update = {};
      if (titulo) update.titulo = titulo;
      if (dataFim) update.dataFim = dataFim;
      if (typeof ativa !== "undefined") update.ativa = !!ativa;
      // Sorteio automático (opcional: ajuste filtro conforme seu caso)
      if (quantidadeQuestoes) {
        const todasQuestoes = await Questao.find();
        const sorteadas = todasQuestoes.sort(() => Math.random() - 0.5)
          .slice(0, Math.max(1, Number(quantidadeQuestoes)))
          .map(q => q._id);
        update.questoes = sorteadas;
      }
      // Inativa automaticamente se dataFim passada for do passado
      if (dataFim && new Date(dataFim) < new Date()) update.ativa = false;

      const atividade = await Atividade.findByIdAndUpdate(
        id,
        { $set: update },
        { new: true }
      ).populate("questoes");

      if (!atividade) return res.status(404).json({ error: "Atividade não encontrada" });
      return res.status(200).json(atividade);
    } catch (err) {
      return res.status(400).json({ error: "Erro ao editar atividade." });
    }
  }

  // POST: para encerrar atividade imediatamente (rota: /api/[id]/encerrar)
  if (req.method === "POST") {
    try {
      const atividade = await Atividade.findByIdAndUpdate(
        id,
        { dataFim: new Date(), ativa: false },
        { new: true }
      ).populate("questoes");
      if (!atividade) return res.status(404).json({ error: "Atividade não encontrada" });
      return res.status(200).json(atividade);
    } catch (err) {
      return res.status(400).json({ error: "Erro ao encerrar atividade." });
    }
  }

  res.status(405).end();
}
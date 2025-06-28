import { connectDB } from "@/lib/dbConnect";
import Questao from "@/models/questao.model.mjs";

// Essa rota retorna questões sem o campo "correta" nas opções, evitando trapaça dos alunos
export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Método ${req.method} não permitido`);
  }

  // Busca todas as questões e remove o campo "correta" das opções antes de enviar ao aluno
  const questoes = await Questao.find().lean();
  const questoesParaAluno = questoes.map(q => ({
    _id: q._id,
    tipo: q.tipo,
    enunciado: q.enunciado,
    opcoes: q.opcoes.map(o => ({ texto: o.texto })),
  }));

  res.status(200).json(questoesParaAluno);
}
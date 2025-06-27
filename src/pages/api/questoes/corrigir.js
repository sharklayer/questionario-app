import { connectDB } from "@/lib/dbConnect";
import Questao from "@/models/questao.model";
import Resposta from "@/models/resposta.model";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Método ${req.method} não permitido`);
  }

  // Obtém o usuário logado (aluno)
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: "Precisa estar logado para submeter respostas" });
  }

  // NOVO: Verifica se o aluno já respondeu
  const tentativaExistente = await Resposta.findOne({ aluno: session.user.id });
  if (tentativaExistente) {
    return res.status(400).json({
      error: "Você já respondeu o questionário. Não é permitido mais de uma tentativa."
    });
  }

  const respostasAluno = req.body;
  if (!Array.isArray(respostasAluno)) {
    return res.status(400).json({ error: "Formato de resposta inválido" });
  }

  const questoesIds = respostasAluno.map(r => r.questaoId);
  const questoes = await Questao.find({ _id: { $in: questoesIds } }).lean();

  const resultado = respostasAluno.map(resposta => {
    const questao = questoes.find(q => q._id.toString() === resposta.questaoId);
    if (!questao) {
      return { questaoId: resposta.questaoId, correta: false, erro: "Questão não encontrada" };
    }
    const indicesCorretos = questao.opcoes
      .map((op, idx) => (op.correta ? idx : null))
      .filter(idx => idx !== null);
    const acertou =
      indicesCorretos.length === resposta.resposta.length &&
      indicesCorretos.every(idx => resposta.resposta.includes(idx));
    return {
      questaoId: resposta.questaoId,
      correta: acertou,
      respostaAluno: resposta.resposta,
      indicesCorretos,
      enunciado: questao.enunciado,
      opcoes: questao.opcoes.map(o => o.texto),
    };
  });

  const acertos = resultado.filter(r => r.correta).length;
  const total = resultado.length;

  // Salva no histórico do aluno
  await Resposta.create({
    aluno: session.user.id,
    respostas: respostasAluno,
    acertos,
    total
  });

  res.status(200).json({
    total,
    acertos,
    detalhes: resultado,
  });
}
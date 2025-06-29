import { connectDB } from "@/lib/dbConnect";
import Resposta from "@/models/resposta.model.mjs";
import Questao from "@/models/questao.model.mjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  await connectDB();
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  if (req.method === "POST") {
    const { respostas, atividadeId } = req.body; // agora recebe atividadeId
    let acertos = 0;
    let total = respostas.length;

    // Corrigir automaticamente
    for (const item of respostas) {
      const questao = await Questao.findById(item.questaoId);
      if (!questao) continue;

      // Pegando índices das opções corretas
      const indicesCorretos = questao.opcoes.map((op, idx) => op.correta ? idx : null).filter(idx => idx !== null);

      // Checa se a resposta do aluno bate exatamente com a(s) correta(s)
      const respostaAluno = (item.resposta || []).sort().join(",");
      const respostaCerta = indicesCorretos.sort().join(",");
      if (respostaAluno === respostaCerta) {
        acertos += 1;
      }
    }

    // Upsert: Se já existe resposta desse aluno para esta atividade, atualiza; senão cria
    const respostaDoc = await Resposta.findOneAndUpdate(
      { aluno: session.user.id, atividade: atividadeId },
      {
        aluno: session.user.id,
        atividade: atividadeId,
        respostas,
        acertos,
        total,
        atualizadoEm: new Date()
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({
      message: "Respostas salvas e corrigidas automaticamente.",
      acertos,
      total,
      respostaId: respostaDoc._id,
      resposta: respostaDoc
    });
  }

  // GET: lista respostas (corrigido)
  let respostasDocs;
  const { atividade } = req.query;

  if (session.user.isAdmin) {
    const filtro = atividade ? { atividade } : {};
    respostasDocs = await Resposta.find(filtro)
      .populate("aluno", "nome email")
      .sort({ criadoEm: -1 });
  } else {
    const filtro = { aluno: session.user.id };
    if (atividade) filtro.atividade = atividade;
    respostasDocs = await Resposta.find(filtro)
      .sort({ criadoEm: -1 });
  }
  res.status(200).json(respostasDocs);
}
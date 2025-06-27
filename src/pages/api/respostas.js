import { connectDB } from "@/lib/dbConnect";
import Resposta from "@/models/resposta.model";
import Usuario from "@/models/usuario.model";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  await connectDB();
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  // Admin vê todas as respostas; aluno vê só as suas
  let respostas;
  if (session.user.isAdmin) {
    respostas = await Resposta.find()
      .populate("aluno", "nome email")
      .sort({ criadoEm: -1 });
  } else {
    respostas = await Resposta.find({ aluno: session.user.id })
      .sort({ criadoEm: -1 });
  }
  res.status(200).json(respostas);
}
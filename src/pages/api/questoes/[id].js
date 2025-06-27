import { connectDB } from "@/lib/dbConnect";
import Questao from "@/models/questao.model";
import { getSession } from "next-auth/react";

// Essa rota permite editar (PUT) ou excluir (DELETE) uma questão específica pelo ID
export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  const session = await getSession({ req });
  if (!session?.user?.isAdmin) {
    return res.status(403).json({ error: "Apenas admin pode editar ou excluir questões" });
  }

  if (req.method === "PUT") {
    // Atualiza uma questão existente
    const { tipo, enunciado, opcoes } = req.body;
    const questaoAtualizada = await Questao.findByIdAndUpdate(
      id,
      { tipo, enunciado, opcoes },
      { new: true }
    );
    return res.status(200).json(questaoAtualizada);
  }

  if (req.method === "DELETE") {
    // Remove uma questão existente
    await Questao.findByIdAndDelete(id);
    return res.status(204).end();
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  res.status(405).end(`Método ${req.method} não permitido`);
}
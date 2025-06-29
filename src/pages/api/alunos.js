import { connectDB } from "@/lib/dbConnect";
import Usuario from "@/models/usuario.model.mjs";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

// Gera senha aleatória
/*
function gerarSenhaAleatoria(tamanho = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let senha = "";
  for (let i = 0; i < tamanho; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return senha;
}
*/
// Usa RGA como senha (descomente para testar essa opção)
function gerarSenhaRGA(rga) {
  return String(rga);
}

export default async function handler(req, res) {
  await connectDB();

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.isAdmin) {
    return res.status(403).json({ error: "Apenas admin pode acessar esta rota." });
  }

  if (req.method === "GET") {
    // Listagem dos alunos (mantenha igual ao que você já tem)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const q = (req.query.q || "").trim();

    const filter = { isAdmin: false };
    if (q) {
      filter.$or = [
        { nome: new RegExp(q, "i") },
        { email: new RegExp(q, "i") },
        { rga: new RegExp(q, "i") },
      ];
    }

    const total = await Usuario.countDocuments(filter);
    const pages = Math.ceil(total / limit);
    const alunos = await Usuario.find(filter, "-senha")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ nome: 1 });

    return res.status(200).json({
      alunos,
      total,
      pages,
      page,
    });
  }

  if (req.method === "POST") {
    const { alunos } = req.body;
    if (!Array.isArray(alunos) || alunos.length === 0) {
      return res.status(400).json({ error: "Lista de alunos inválida" });
    }

    const novos = [];
    const senhasGeradas = [];
    for (const aluno of alunos) {
      if (!aluno.nome || !aluno.email || !aluno.rga) continue;
      const jaExiste = await Usuario.findOne({ $or: [ { email: aluno.email }, { rga: aluno.rga } ] });
      if (!jaExiste) {
        // Opção 1: senha aleatória
        //const senhaGerada = gerarSenhaAleatoria();

        // Opção 2: usar o RGA como senha
        const senhaGerada = gerarSenhaRGA(aluno.rga);

        const senhaCriptografada = await bcrypt.hash(senhaGerada, 10);
        novos.push({
          nome: aluno.nome,
          email: aluno.email,
          rga: aluno.rga,
          isAdmin: false,
          senha: senhaCriptografada,
        });
        senhasGeradas.push({ email: aluno.email, senha: senhaGerada });
      }
    }

    if (novos.length === 0) {
      return res.status(400).json({ error: "Nenhum aluno novo para cadastrar." });
    }

    await Usuario.insertMany(novos);
    return res.status(201).json({ inseridos: novos.length, senhas: senhasGeradas });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Método ${req.method} não permitido`);
}
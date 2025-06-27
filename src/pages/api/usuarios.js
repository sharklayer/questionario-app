import { connectDB } from "@/lib/dbConnect";
import Usuario from "@/models/usuario.model";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    // Lista todos os usuários (atenção: nunca envie a senha!)
    const usuarios = await Usuario.find({}, "-senha");
    return res.status(200).json(usuarios);
  }

  if (req.method === "POST") {
    // Cadastro de novo usuário
    const { nome, email, senha, isAdmin } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: "Nome, email e senha são obrigatórios." });
    }

    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ error: "Email já cadastrado." });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha: senhaCriptografada,
      isAdmin: !!isAdmin,
    });

    // Nunca envie a senha no retorno!
    const { senha: _, ...usuarioSemSenha } = novoUsuario.toObject();

    return res.status(201).json(usuarioSemSenha);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Método ${req.method} não permitido`);
}
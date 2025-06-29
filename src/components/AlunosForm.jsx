'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AlunosForm() {
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  const parseAlunos = (texto) => {
    // Suporta separador por vírgula, ponto e vírgula, tab ou espaço
    const linhas = texto.split("\n").map(l => l.trim()).filter(l => l);
    return linhas.map(linha => {
      // tenta vírgula, depois ponto e vírgula, depois tab
      let partes = linha.split(",").map(p => p.trim());
      if (partes.length < 3) partes = linha.split(";").map(p => p.trim());
      if (partes.length < 3) partes = linha.split("\t").map(p => p.trim());
      if (partes.length < 3) partes = linha.split(" ").map(p => p.trim());
      return {
        nome: partes[0] || "",
        email: partes[1] || "",
        rga: partes[2] || "",
      }
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    if (!texto.trim()) {
      setErro("Cole pelo menos uma linha com nome, email e rga.");
      return;
    }
    const alunos = parseAlunos(texto).filter(a => a.nome && a.email && a.rga);
    if (alunos.length === 0) {
      setErro("Não foi possível identificar nenhum aluno válido.");
      return;
    }
    setEnviando(true);

    const res = await fetch("/api/alunos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alunos }),
      credentials: "include",
    });
    setEnviando(false);

    if (res.ok) {
      router.push("/admin/alunos");
    } else {
      const data = await res.json();
      setErro(data.error || "Erro ao cadastrar alunos.");
    }
  }

  return (
    <>
      <button
        type="button"
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        onClick={() => router.back()}
      >
        ← Voltar
      </button>
      <form onSubmit={handleSubmit} className="bg-white shadow rounded p-6 space-y-4">
        <div>
          <label className="block font-semibold mb-1">Cole a lista de alunos (nome, email, rga):</label>
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            className="border p-2 rounded w-full min-h-[150px]"
            placeholder={`Exemplo:\nMaria Silva, maria@email.com, 202212345\nJoão Souza, joao@email.com, 202298765`}
          />
        </div>
        {erro && <div className="text-red-500">{erro}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={enviando}
        >
          {enviando ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </>
  );
}
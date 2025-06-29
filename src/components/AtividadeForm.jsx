'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AtividadeForm() {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [quantidadeQuestoes, setQuantidadeQuestoes] = useState(5);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if(!titulo.trim() || !dataInicio || !dataFim || !quantidadeQuestoes) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    setEnviando(true);
    const res = await fetch("/api/atividades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo,
        descricao,
        dataInicio,
        dataFim,
        quantidadeQuestoes,
      }),
    });

    setEnviando(false);

    if (res.ok) {
      router.push("/admin/atividades");
    } else {
      const data = await res.json();
      setErro(data.error || "Erro ao criar atividade.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded p-6 space-y-4 max-w-xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Criar nova atividade</h2>
      <div>
        <label className="block font-semibold mb-1">Título*</label>
        <input
          type="text"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Descrição</label>
        <textarea
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          className="border p-2 rounded w-full min-h-[60px]"
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-semibold mb-1">Data início*</label>
          <input
            type="datetime-local"
            value={dataInicio}
            onChange={e => setDataInicio(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1">Data fim*</label>
          <input
            type="datetime-local"
            value={dataFim}
            onChange={e => setDataFim(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>
      </div>
      <div>
        <label className="block font-semibold mb-1">Quantidade de questões*</label>
        <input
          type="number"
          min={1}
          value={quantidadeQuestoes}
          onChange={e => setQuantidadeQuestoes(e.target.value)}
          className="border p-2 rounded w-32"
          required
        />
      </div>
      {erro && <div className="text-red-500">{erro}</div>}
      <div className="flex gap-2">
        <button
          type="button"
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          onClick={() => router.back()}
        >
          ← Voltar
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={enviando}
        >
          {enviando ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
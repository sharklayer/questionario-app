'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ResponderAtividadeAluno() {
  const params = useParams();
  const router = useRouter();
  const [atividade, setAtividade] = useState(null);
  const [respostas, setRespostas] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    async function fetchAtividade() {
      const res = await fetch(`/api/atividades/${params.id}`);
      if (!res.ok) {
        router.push("/aluno/atividades");
        return;
      }
      const data = await res.json();
      setAtividade(data);
    }
    fetchAtividade();
  }, [params.id, router]);

  const handleChange = (questaoId, resposta) => {
    setRespostas(r => ({ ...r, [questaoId]: resposta }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    setMensagem("");
    const res = await fetch(`/api/respostas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        atividadeId: params.id,
        respostas // { questaoId: resposta, ... }
      }),
    });
    setEnviando(false);
    if (res.ok) {
      setMensagem("Respostas enviadas com sucesso!");
    } else {
      setMensagem("Erro ao enviar respostas.");
    }
  }

  if (!atividade) return <div className="mt-12 text-center">Carregando...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white rounded shadow p-8">
      <h1 className="text-2xl font-bold text-blue-700 mb-2">{atividade.titulo}</h1>
      <div className="text-gray-700 mb-2">{atividade.descricao}</div>
      <div className="text-xs text-gray-500 mb-6">
        {new Date(atividade.dataInicio).toLocaleString()} até {new Date(atividade.dataFim).toLocaleString()}
      </div>
      <form onSubmit={handleSubmit}>
        <ul className="space-y-6">
          {atividade.questoes.map((q, i) => (
            <li key={q._id} className="border rounded p-4 bg-gray-50">
              <div className="font-semibold mb-2">Q{i + 1}: {q.enunciado}</div>
              {q.alternativas && q.alternativas.length > 0 ? (
                <div className="mt-2 flex flex-col gap-2">
                  {q.alternativas.map((alt, idx) => (
                    <label key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`q${q._id}`}
                        value={alt}
                        checked={respostas[q._id] === alt}
                        onChange={() => handleChange(q._id, alt)}
                        required
                      />
                      {alt}
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  className="border p-2 rounded w-full mt-2"
                  placeholder="Digite sua resposta"
                  value={respostas[q._id] || ""}
                  onChange={e => handleChange(q._id, e.target.value)}
                  required
                />
              )}
            </li>
          ))}
        </ul>
        {mensagem && <div className="my-4 text-green-700">{mensagem}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded mt-6"
          disabled={enviando}
        >
          {enviando ? "Enviando..." : "Enviar Respostas"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="ml-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          Voltar
        </button>
      </form>
    </div>
  );
}
'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function DetalheAtividadeAdmin() {
  const params = useParams();
  const router = useRouter();
  const [atividade, setAtividade] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function fetchAtividade() {
      setCarregando(true);
      const res = await fetch(`/api/atividades/${params.id}`);
      if (!res.ok) {
        router.push("/admin/atividades");
        return;
      }
      const data = await res.json();
      setAtividade(data);
      setCarregando(false);
    }
    fetchAtividade();
  }, [params.id, router]);

  if (carregando) return <div className="text-center mt-12">Carregando...</div>;
  if (!atividade) return <div className="text-center mt-12 text-red-500">Atividade não encontrada.</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white rounded shadow p-8">
      <h1 className="text-2xl font-bold text-blue-700 mb-2">{atividade.titulo}</h1>
      <div className="text-gray-700 mb-2">{atividade.descricao}</div>
      <div className="text-xs text-gray-500 mb-4">
        {new Date(atividade.dataInicio).toLocaleString()} até {new Date(atividade.dataFim).toLocaleString()}
      </div>
      <div className="mb-2">
        <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${atividade.ativa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {atividade.ativa ? "Ativa" : "Inativa"}
        </span>
      </div>
      <h2 className="text-lg font-bold mt-6 mb-3">Questões sorteadas:</h2>
      <ul className="space-y-5">
        {atividade.questoes && atividade.questoes.length > 0 ? (
          atividade.questoes.map((q, i) => (
            <li key={q._id || i} className="border rounded p-4 bg-gray-50">
              <div className="font-semibold mb-2">Q{i + 1}: {q.enunciado}</div>
              {q.alternativas && q.alternativas.length > 0 && (
                <ul className="ml-4 list-disc text-gray-700">
                  {q.alternativas.map((alt, idx) => (
                    <li key={idx}>{alt}</li>
                  ))}
                </ul>
              )}
              {q.respostaCorreta && (
                <div className="text-sm text-green-700 mt-2">
                  <strong>Resposta correta:</strong> {q.respostaCorreta}
                </div>
              )}
            </li>
          ))
        ) : (
          <li className="text-gray-500">Nenhuma questão cadastrada nesta atividade.</li>
        )}
      </ul>
      <div className="mt-8">
        <button
          onClick={() => router.back()}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          ← Voltar
        </button>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { CheckCircleIcon, XCircleIcon, UserCircleIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

export default function HistoricoRespostas() {
  const { data: session, status } = useSession();
  const [historico, setHistorico] = useState([]);
  const [questoesMap, setQuestoesMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) signIn();
  }, [session, status]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/respostas")
      .then(res => res.json())
      .then(async data => {
        setHistorico(data);
        // Busca todos os IDs de questões do histórico
        const questaoIds = [
          ...new Set(
            data.flatMap(resp =>
              resp.respostas.map(q => q.questaoId)
            )
          )
        ];
        // Busca questões completas
        const todasQuestoes = await fetch("/api/questoes").then(res => res.json());
        const map = {};
        todasQuestoes.forEach(q => {
          if (questaoIds.includes(q._id)) map[q._id] = q;
        });
        setQuestoesMap(map);
        setLoading(false);
      });
  }, [session]);

  if (loading) return <div className="text-center text-gray-400 py-8">Carregando histórico...</div>;
  if (!session) return <div className="text-center text-gray-400">Requer login</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-8 text-center">Histórico de Respostas</h1>
      {historico.length === 0 && (
        <p className="text-gray-500 text-center">Nenhuma tentativa registrada.</p>
      )}
      <ul className="space-y-8">
        {historico.map((resp, idx) => (
          <li key={resp._id} className="bg-white rounded shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="h-5 w-5 text-blue-400" />
                <span className="text-gray-700 text-sm">{new Date(resp.criadoEm).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span className="text-green-700 font-bold">{resp.acertos} acertos</span>
                <span className="text-gray-500">/ {resp.total} perguntas</span>
              </div>
            </div>
            <ul className="space-y-4 mt-4">
              {resp.respostas.map((q, i) => {
                const questao = questoesMap[q.questaoId];
                if (!questao) return (
                  <li key={i} className="text-red-400">Questão não encontrada (ID: {q.questaoId})</li>
                );
                // Descobre gabarito
                const indicesCorretos = questao.opcoes
                  .map((op, idx) => op.correta ? idx : null)
                  .filter(idx => idx !== null);
                const acertou = indicesCorretos.length === q.resposta.length && indicesCorretos.every(idx => q.resposta.includes(idx));
                return (
                  <li key={i} className="bg-gray-50 rounded p-4 shadow-inner">
                    <div className="flex items-center gap-2 mb-1">
                      {acertou
                        ? <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        : <XCircleIcon className="h-5 w-5 text-red-500" />}
                      <span className={clsx("font-semibold", acertou ? "text-green-700" : "text-red-700")}>
                        Pergunta {i + 1}:
                      </span>
                      <span className="ml-2 text-gray-800">{questao.enunciado}</span>
                    </div>
                    <ul className="space-y-1 mt-2">
                      {questao.opcoes.map((op, idx2) => {
                        const correta = op.correta;
                        const marcada = q.resposta.includes(idx2);
                        return (
                          <li
                            key={idx2}
                            className={clsx(
                              "py-1 px-2 rounded",
                              correta && marcada && "bg-green-100 border border-green-400 font-semibold",
                              correta && !marcada && "text-green-600 font-semibold",
                              !correta && marcada && "bg-red-100 border border-red-400 text-red-700 font-semibold line-through"
                            )}
                          >
                            {op.texto}
                            {correta && " (correta)"}
                            {marcada && " ← sua escolha"}
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
'use client'
import React, { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

export default function QuestionarioAluno() {
  const { data: session, status } = useSession();
  const [questoes, setQuestoes] = useState([]);
  const [respostas, setRespostas] = useState({});
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [jaRespondeu, setJaRespondeu] = useState(false);
  const [historico, setHistorico] = useState(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) signIn();
  }, [session, status]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/respostas")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setJaRespondeu(true);
          setHistorico(data[0]);
        } else {
          fetch("/api/questoes/aluno")
            .then(res => res.json())
            .then(data => {
              setQuestoes(data);
              setCarregando(false);
            });
        }
      });
  }, [session]);

  const handleResposta = (questaoId, idxOpcao) => {
    setRespostas(prev => ({
      ...prev,
      [questaoId]: [idxOpcao],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = Object.entries(respostas).map(([questaoId, resposta]) => ({
      questaoId,
      resposta,
    }));

    const res = await fetch("/api/questoes/corrigir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.status === 400) {
      const data = await res.json();
      alert(data.error || "Você já respondeu o questionário.");
      setJaRespondeu(true);
      return;
    }
    const data = await res.json();
    setResultado(data);
  };

  if (carregando && !jaRespondeu) return <div className="text-center py-8 text-gray-400">Carregando questões...</div>;
  if (!session) return <div className="text-center text-gray-400">Requer login</div>;

  // Resultado detalhado
  if (resultado) {
    return (
      <div className="max-w-3xl mx-auto p-4 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Resultado detalhado</h2>
        <p className="mb-6 text-lg">Acertos: <span className="font-bold">{resultado.acertos}</span> de <span className="font-bold">{resultado.total}</span></p>
        <ul className="space-y-6">
          {resultado.detalhes.map((det, idx) => (
            <li key={det.questaoId} className="bg-gray-50 p-4 rounded shadow">
              <div className="flex items-center gap-2 mb-2">
                <span className={clsx("text-xl", det.correta ? "text-green-600" : "text-red-600")}>
                  {det.correta ? <CheckCircleIcon className="h-6 w-6 inline" /> : <XCircleIcon className="h-6 w-6 inline" />}
                </span>
                <strong className="text-lg">{idx + 1}. {det.enunciado}</strong>
              </div>
              <ul>
                {det.opcoes.map((texto, i) => {
                  const correta = det.indicesCorretos.includes(i);
                  const marcada = det.respostaAluno.includes(i);
                  return (
                    <li
                      key={i}
                      className={clsx(
                        "py-1 px-2 rounded",
                        correta && marcada && "bg-green-100 border border-green-400 font-semibold",
                        correta && !marcada && "text-green-600 font-semibold",
                        !correta && marcada && "bg-red-100 border border-red-400 text-red-700 font-semibold line-through"
                      )}
                    >
                      {texto}
                      {correta && " (correta)"}
                      {marcada && " ← sua escolha"}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-center">Consulte seu <a href="/historico" className="text-blue-700 underline">histórico completo</a>.</p>
      </div>
    );
  }

  // Se já respondeu
  if (jaRespondeu) {
    return (
      <div className="max-w-xl mx-auto bg-white shadow rounded p-8 mt-12 text-center">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Você já respondeu o questionário.</h2>
        {historico && (
          <>
            <p className="mb-2">
              Acertos: <span className="font-bold">{historico.acertos}</span> de <span className="font-bold">{historico.total}</span>
            </p>
            <p>Consulte seu <a href="/historico" className="text-blue-700 underline">histórico completo</a>.</p>
          </>
        )}
      </div>
    );
  }

  // Formulário das questões
  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Questionário</h2>
      {questoes.map((q, idx) => (
        <div key={q._id} className="mb-8">
          <div className="mb-2 font-semibold text-lg text-gray-700">{idx + 1}. {q.enunciado}</div>
          <ul className="space-y-2">
            {q.opcoes.map((op, i) => (
              <li key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={q._id}
                  value={i}
                  checked={respostas[q._id]?.includes(i) || false}
                  onChange={() => handleResposta(q._id, i)}
                  className="form-radio text-blue-600"
                  id={`q${q._id}o${i}`}
                />
                <label htmlFor={`q${q._id}o${i}`} className="text-gray-700 cursor-pointer">{op.texto}</label>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 mt-4 rounded font-bold hover:bg-blue-700 transition"
      >
        Enviar respostas
      </button>
    </form>
  );
}
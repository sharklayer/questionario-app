'use client'
import React, { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

// Função para detectar se uma questão tem múltiplas corretas
function isMultiplaCorreta(q) {
  return q.tipo === "objetiva" && q.opcoes.filter(o => o.correta).length > 1;
}

export default function QuestionarioAluno() {
  const { data: session, status } = useSession();
  const [questoes, setQuestoes] = useState([]);
  const [respostas, setRespostas] = useState({});
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [jaRespondeu, setJaRespondeu] = useState(false);
  const [historico, setHistorico] = useState(null);
  const [revisando, setRevisando] = useState(false);

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

  const handleResposta = (questaoId, idxOpcao, tipo, checked) => {
    setRespostas(prev => {
      if (tipo === "objetiva" && isMultiplaCorreta(questoes.find(q => q._id === questaoId))) {
        // checkbox (múltiplas)
        const selecionadas = new Set(prev[questaoId] || []);
        if (checked) {
          selecionadas.add(idxOpcao);
        } else {
          selecionadas.delete(idxOpcao);
        }
        return { ...prev, [questaoId]: Array.from(selecionadas) };
      } else {
        // radio (única)
        return { ...prev, [questaoId]: [idxOpcao] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRevisando(true);
  };

  const handleEnviarDefinitivo = async () => {
    // Envia para API corrigir
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
      setRevisando(false);
      return;
    }
    const data = await res.json();
    setResultado(data);
    setRevisando(false);
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

  // Tela de revisão antes do envio
  if (revisando) {
    return (
      <div className="max-w-2xl mx-auto bg-white shadow rounded p-6">
        <h2 className="text-2xl font-bold mb-6 text-blue-700">Revisão das Respostas</h2>
        <ul className="space-y-8">
          {questoes.map((q, idx) => {
            const multipla = isMultiplaCorreta(q);
            const marcadas = respostas[q._id] || [];
            return (
              <li key={q._id} className="mb-4">
                <div className="font-semibold text-lg text-gray-700 mb-2">{idx + 1}. {q.enunciado}</div>
                <ul>
                  {q.opcoes.map((op, i) => (
                    <li key={i} className={clsx(
                      "flex items-center gap-2 py-1",
                      marcadas.includes(i)
                        ? "bg-yellow-100 border-l-4 border-yellow-400"
                        : ""
                    )}>
                      <span>
                        {multipla
                          ? <input type="checkbox" checked={marcadas.includes(i)} disabled />
                          : <input type="radio" checked={marcadas.includes(i)} disabled />}
                      </span>
                      <span>{op.texto}</span>
                      {marcadas.includes(i) && <span className="text-yellow-700 ml-2">(selecionada)</span>}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
        <div className="flex gap-4 mt-8 justify-center">
          <button
            type="button"
            className="bg-gray-400 text-white px-4 py-2 rounded font-bold hover:bg-gray-500"
            onClick={() => setRevisando(false)}
          >
            Editar respostas
          </button>
          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700"
            onClick={handleEnviarDefinitivo}
          >
            Enviar respostas
          </button>
        </div>
      </div>
    );
  }

  // Formulário das questões
  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Questionário</h2>
      {questoes.map((q, idx) => {
        const multipla = isMultiplaCorreta(q);
        const inputType = multipla ? "checkbox" : "radio";
        return (
          <div key={q._id} className="mb-8">
            <div className="mb-2 font-semibold text-lg text-gray-700 flex items-center gap-2">
              <span>{idx + 1}.</span>
              <textarea
                value={q.enunciado}
                readOnly
                className="w-full border rounded resize-y bg-gray-50 min-h-[60px] py-1 px-2"
                rows={3}
                tabIndex={-1}
                style={{ fontWeight: 500, fontSize: "1.1em", pointerEvents: "none" }}
              />
            </div>
            <ul className="space-y-2">
              {q.opcoes.map((op, i) => (
                <li key={i} className="flex items-center gap-2">
                  <input
                    type={inputType}
                    name={multipla ? `${q._id}_${i}` : q._id}
                    value={i}
                    checked={
                      multipla
                        ? respostas[q._id]?.includes(i) || false
                        : respostas[q._id]?.[0] === i
                    }
                    onChange={e =>
                      handleResposta(
                        q._id,
                        i,
                        q.tipo,
                        multipla ? e.target.checked : undefined
                      )
                    }
                    className="form-checkbox text-blue-600"
                    id={`q${q._id}o${i}`}
                  />
                  <textarea
                    value={op.texto}
                    readOnly
                    className="border rounded bg-gray-50 resize-y min-h-[32px] py-1 px-2 w-full"
                    rows={2}
                    tabIndex={-1}
                    style={{ pointerEvents: "none" }}
                  />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 mt-4 rounded font-bold hover:bg-blue-700 transition"
      >
        Revisar respostas
      </button>
    </form>
  );
}
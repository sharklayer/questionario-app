'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

// Função auxiliar para embaralhar um array qualquer (Fisher-Yates)
function embaralharArray(arr) {
  const embaralhado = [...arr];
  for (let i = embaralhado.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [embaralhado[i], embaralhado[j]] = [embaralhado[j], embaralhado[i]];
  }
  return embaralhado;
}

// Embaralha questões e as opções, mantendo mapeamento para correção correta
function embaralharQuestoesEOpcoes(questoes) {
  // Embaralha questões
  const questoesEmbaralhadas = embaralharArray(questoes);
  // Embaralha opções de cada questão e guarda o mapeamento
  return questoesEmbaralhadas.map(q => {
    if (!q.opcoes) return { ...q, opcoes: [], opcoesMap: [] };
    const opcoesOriginal = q.opcoes.map((op, idx) => ({ ...op, _originalIndex: idx }));
    const opcoesEmbaralhadas = embaralharArray(opcoesOriginal);
    // Mapeamento: embaralhada index -> original index
    const opcoesMap = opcoesEmbaralhadas.map(op => op._originalIndex);
    // Remove _originalIndex do objeto antes de usar
    const opcoesLimpa = opcoesEmbaralhadas.map(({ _originalIndex, ...op }) => op);
    return { ...q, opcoes: opcoesLimpa, opcoesMap };
  });
}

export default function ResponderAtividadeAluno() {
  const params = useParams();
  const router = useRouter();
  const [atividade, setAtividade] = useState(null);
  const [respostas, setRespostas] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respostaSalva, setRespostaSalva] = useState(null);

  // Novo estado para manter a ordem embaralhada das questões e opções
  const [questoesEmbaralhadas, setQuestoesEmbaralhadas] = useState(null);

  // Busca atividade e resposta do aluno
  useEffect(() => {
    async function fetchAll() {
      const resAtv = await fetch(`/api/${params.id}`);
      if (!resAtv.ok) {
        router.push("/aluno/atividades");
        return;
      }
      const data = await resAtv.json();
      setAtividade(data);

      // Busca resposta do aluno para esta atividade (SEM CACHE)
      const resResp = await fetch(`/api/respostas?atividade=${params.id}`, { cache: "no-store" });
      if (resResp.ok) {
        const respostaAluno = await resResp.json();
        if (Array.isArray(respostaAluno)) {
          if (respostaAluno.length > 0) {
            setRespostaSalva(respostaAluno[0]);
          }
        } else if (respostaAluno && respostaAluno._id) {
          setRespostaSalva(respostaAluno);
        }
      }
    }
    fetchAll();
  }, [params.id, router]);

  // Embaralha as questões e opções só se ainda não respondeu
  useEffect(() => {
    if (respostaSalva) {
      setQuestoesEmbaralhadas(null); // Não embaralha se já respondeu, mantém ordem salva
    } else if (atividade && atividade.questoes) {
      setQuestoesEmbaralhadas(embaralharQuestoesEOpcoes(atividade.questoes));
    }
  }, [atividade, respostaSalva]);

  // Use questões da resposta salva (ordem original) OU embaralhadas se ainda não respondeu
  const questoes =
    respostaSalva?.atividadeDetalhada?.questoes ||
    questoesEmbaralhadas ||
    atividade?.questoes;

  if (!atividade || !questoes) return <div className="mt-12 text-center">Carregando...</div>;

  // Se já respondeu, mostra feedback completo (sem embaralhamento nem mapeamento)
  if (respostaSalva) {
    return (
      <div className="max-w-2xl mx-auto mt-10 bg-white rounded shadow p-8">
        <h1 className="text-2xl font-bold text-blue-700 mb-2">
          {respostaSalva.atividadeDetalhada?.titulo || atividade.titulo}
        </h1>
        <div className="text-gray-700 mb-2">
          {respostaSalva.atividadeDetalhada?.descricao || atividade.descricao}
        </div>
        <div className="text-xs text-gray-500 mb-6">
          {new Date(respostaSalva.atividadeDetalhada?.dataInicio || atividade.dataInicio).toLocaleString()} até{" "}
          {new Date(respostaSalva.atividadeDetalhada?.dataFim || atividade.dataFim).toLocaleString()}
        </div>
        <div className="my-4 text-lg font-semibold text-green-700">
          Você acertou {respostaSalva.acertos} de {respostaSalva.total} questões!
        </div>
        <h2 className="text-lg font-bold mb-4">Suas respostas e gabarito:</h2>
        <ul className="space-y-6">
          {questoes.map((q, idx) => {
            const questaoId = (typeof q._id === "object" ? q._id.toString() : q._id) + "";
            const respObj = respostaSalva.respostas?.find(r => {
              const rId = (typeof r.questaoId === "object" ? r.questaoId.toString() : r.questaoId) + "";
              return rId === questaoId;
            });
            const marcada = respObj?.resposta || [];
            const corretas = q.opcoes
              ? q.opcoes.map((op, i) => (op.correta ? i : null)).filter(i => i !== null)
              : [];

            return (
              <li key={q._id} className="border rounded p-4">
                <div className="font-semibold mb-2">Q{idx + 1}: {q.enunciado}</div>
                {q.opcoes && q.opcoes.length > 0 && (
                  <ul>
                    {q.opcoes.map((op, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span
                          className={
                            op.correta
                              ? "text-green-700 font-semibold"
                              : ""
                          }
                        >
                          {op.texto}
                          {op.correta && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 rounded px-2 py-0.5">Correta</span>
                          )}
                        </span>
                        {marcada.includes(i) && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5">Sua resposta</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
        <div className="flex justify-end mt-8">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => router.push('/aluno/atividades')}
          >
            Retornar
          </button>
        </div>
      </div>
    );
  }

  // ========== FORMULÁRIO PADRÃO ==========
  const q = questoes[currentIndex];
  const isMultiplaEscolha = q?.opcoes && q.opcoes.filter(o => o.correta).length > 1;

  // Handler de resposta: salva índice da opção marcada (na ordem embaralhada)
  const handleChange = (questaoId, resposta) => {
    if (isMultiplaEscolha) {
      setRespostas(prev => {
        const prevArr = prev[questaoId] || [];
        if (prevArr.includes(resposta)) {
          return { ...prev, [questaoId]: prevArr.filter(r => r !== resposta) };
        } else {
          return { ...prev, [questaoId]: [...prevArr, resposta] };
        }
      });
    } else {
      setRespostas(prev => ({ ...prev, [questaoId]: resposta }));
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (currentIndex < questoes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = (e) => {
    e.preventDefault();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Envio: converte índice marcado na ordem embaralhada para o índice original
  async function handleSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    setMensagem("");

    // Prepara o array de respostas para o backend
    const respostasArray = questoes.map(q => {
      const questaoId = q._id;
      let idxs = [];
      if (Array.isArray(respostas[questaoId])) {
        // Opções marcadas (nome da opção)
        idxs = respostas[questaoId].map(marcada => {
          const embaralhadaIndex = q.opcoes.findIndex(op => op.texto === marcada);
          // Mapeia para o índice original da alternativa
          return q.opcoesMap ? q.opcoesMap[embaralhadaIndex] : embaralhadaIndex;
        }).filter(i => i !== -1);
      } else if (typeof respostas[questaoId] !== "undefined") {
        const embaralhadaIndex = q.opcoes.findIndex(op => op.texto === respostas[questaoId]);
        idxs = [q.opcoesMap ? q.opcoesMap[embaralhadaIndex] : embaralhadaIndex];
      }
      return { questaoId, resposta: idxs };
    });

    const res = await fetch(`/api/respostas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ respostas: respostasArray, atividadeId: params.id }),
    });

    setEnviando(false);

    if (res.ok) {
      const data = await res.json();
      setRespostaSalva(data.resposta);
    } else {
      const data = await res.json();
      setMensagem(data?.error || "Erro ao enviar respostas.");
    }
  }

  // Validação: precisa responder antes de avançar/enviar
  const answered = () => {
    if (!q.opcoes || q.opcoes.length === 0) {
      return false;
    }
    if (isMultiplaEscolha) {
      return respostas[q._id] && respostas[q._id].length > 0;
    }
    return typeof respostas[q._id] !== "undefined";
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white rounded shadow p-8">
      <h1 className="text-2xl font-bold text-blue-700 mb-2">{atividade.titulo}</h1>
      <div className="text-gray-700 mb-2">{atividade.descricao}</div>
      <div className="text-xs text-gray-500 mb-6">
        {new Date(atividade.dataInicio).toLocaleString()} até {new Date(atividade.dataFim).toLocaleString()}
      </div>
      {mensagem && (
        <div className={`my-4 text-lg font-semibold ${mensagem.startsWith("Você acertou") ? "text-green-700" : "text-red-700"}`}>
          {mensagem}
        </div>
      )}
      {!mensagem && (
        <form onSubmit={currentIndex === questoes.length - 1 ? handleSubmit : handleNext}>
          <div className="border rounded p-4 bg-gray-50 mb-4">
            <div className="font-semibold mb-2">Q{currentIndex + 1}: {q.enunciado}</div>
            {q.opcoes && q.opcoes.length > 0 && (
              <div className="mt-2 flex flex-col gap-2">
                {q.opcoes.map((alt, idx) => (
                  <label key={idx} className="flex items-center gap-2">
                    <input
                      type={isMultiplaEscolha ? "checkbox" : "radio"}
                      name={`q${q._id}${isMultiplaEscolha ? idx : ""}`}
                      value={alt.texto}
                      checked={
                        isMultiplaEscolha
                          ? (respostas[q._id] || []).includes(alt.texto)
                          : respostas[q._id] === alt.texto
                      }
                      onChange={() => handleChange(q._id, alt.texto)}
                      required={!isMultiplaEscolha}
                    />
                    {alt.texto}
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-between gap-2 mt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              Voltar
            </button>
            <div className="flex gap-2">
              {currentIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Anterior
                </button>
              )}
              {currentIndex < questoes.length - 1 ? (
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  disabled={!answered()}
                >
                  Próxima
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  disabled={enviando || !answered()}
                >
                  {enviando ? "Enviando..." : "Enviar Respostas"}
                </button>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
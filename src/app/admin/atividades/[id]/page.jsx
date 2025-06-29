'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function DetalheAtividadeAdmin() {
  const params = useParams();
  const router = useRouter();
  const [atividade, setAtividade] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const [abaAtiva, setAbaAtiva] = useState("atividade");

  // Para listar todos os alunos e respostas da atividade
  const [alunos, setAlunos] = useState([]);
  const [respostas, setRespostas] = useState([]);
  const [carregandoAlunos, setCarregandoAlunos] = useState(false);

  // Para modal de edição
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitulo, setEditTitulo] = useState("");
  const [editDataFim, setEditDataFim] = useState("");
  const [editQtdQuestoes, setEditQtdQuestoes] = useState(1);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // Estado do botão de encerrar/reativar
  const [alterandoAtividade, setAlterandoAtividade] = useState(false);
  const [alterarError, setAlterarError] = useState("");
  const [alterarSuccess, setAlterarSuccess] = useState("");

  // Busca a atividade
  useEffect(() => {
    async function fetchAtividade() {
      setCarregando(true);
      const res = await fetch(`/api/${params.id}`);
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

  // Busca todos os alunos e as respostas para a atividade
  useEffect(() => {
    if (abaAtiva === "alunos") {
      setCarregandoAlunos(true);
      Promise.all([
        fetch('/api/alunos').then(res => res.json()),
        fetch(`/api/respostas?atividade=${params.id}`).then(res => res.json()),
      ]).then(([alunosData, respostasData]) => {
        setAlunos(Array.isArray(alunosData) ? alunosData : alunosData.alunos || []);
        setRespostas(Array.isArray(respostasData) ? respostasData : []);
        setCarregandoAlunos(false);
      }).catch(() => setCarregandoAlunos(false));
    }
  }, [abaAtiva, params.id]);

  if (carregando) return <div className="text-center mt-12">Carregando...</div>;
  if (!atividade) return <div className="text-center mt-12 text-red-500">Atividade não encontrada.</div>;

  // Função utilitária para encontrar a resposta do aluno
  function getRespostaDoAluno(aluno) {
    return respostas.find(r =>
      (r.aluno && aluno._id && r.aluno._id === aluno._id) ||
      (r.aluno && aluno.email && r.aluno.email === aluno.email) ||
      (r.aluno && aluno.rga && r.aluno.rga === aluno.rga)
    );
  }

  // Modal de edição
  function openEditModal() {
    setEditTitulo(atividade.titulo || "");
    setEditDataFim(atividade.dataFim ? new Date(atividade.dataFim).toISOString().slice(0, 16) : "");
    setEditQtdQuestoes(atividade.questoes ? atividade.questoes.length : 1);
    setEditError("");
    setEditSuccess("");
    setShowEditModal(true);
  }

  async function handleEdit(e) {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    setEditSuccess("");
    try {
      const res = await fetch(`/api/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: editTitulo,
          dataFim: editDataFim ? new Date(editDataFim).toISOString() : undefined,
          quantidadeQuestoes: editQtdQuestoes,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setEditError(data?.error || "Erro ao editar atividade.");
      } else {
        setEditSuccess("Atividade editada com sucesso!");
        const data = await res.json();
        setAtividade(data);
        setShowEditModal(false);
      }
    } catch (err) {
      setEditError("Erro ao editar atividade.");
    }
    setEditLoading(false);
  }

  // Encerrar ou reativar atividade
  async function handleToggleAtiva() {
    if (atividade.ativa) {
      if (!window.confirm("Tem certeza que deseja ENCERRAR a atividade agora? Isso impedirá novos envios.")) return;
    } else {
      if (!window.confirm("Tem certeza que deseja REATIVAR esta atividade? Ela ficará disponível novamente para os alunos.")) return;
    }
    setAlterandoAtividade(true);
    setAlterarError("");
    setAlterarSuccess("");
    try {
      const res = await fetch(`/api/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ativa: !atividade.ativa,
          // Se estiver encerrando, atualiza dataFim para agora
          ...(atividade.ativa ? { dataFim: new Date().toISOString() } : {})
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setAlterarError(data?.error || (atividade.ativa ? "Erro ao encerrar atividade." : "Erro ao reativar atividade."));
      } else {
        setAlterarSuccess(atividade.ativa ? "Atividade encerrada com sucesso." : "Atividade reativada com sucesso.");
        const data = await res.json();
        setAtividade(data);
      }
    } catch (err) {
      setAlterarError(atividade.ativa ? "Erro ao encerrar atividade." : "Erro ao reativar atividade.");
    }
    setAlterandoAtividade(false);
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white rounded shadow p-8">
      {/* Botões de ação */}
      <div className="flex flex-wrap justify-end gap-2 mb-4">
        <button
          onClick={openEditModal}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-semibold"
        >
          Editar Atividade
        </button>
        <button
          onClick={handleToggleAtiva}
          disabled={alterandoAtividade}
          className={`${
            atividade.ativa
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          } text-white px-4 py-2 rounded font-semibold`}
        >
          {alterandoAtividade
            ? atividade.ativa
              ? "Encerrando..."
              : "Reativando..."
            : atividade.ativa
              ? "Encerrar Atividade"
              : "Reativar Atividade"}
        </button>
      </div>
      {/* Mensagens de sucesso/erro para alternar status */}
      {alterarError && <div className="text-red-600 mb-2">{alterarError}</div>}
      {alterarSuccess && <div className="text-green-600 mb-2">{alterarSuccess}</div>}

      {/* Modal de edição */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Editar Atividade</h2>
            <form onSubmit={handleEdit}>
              <div className="mb-3">
                <label className="block font-semibold mb-1">Título</label>
                <input
                  type="text"
                  className="border rounded px-3 py-2 w-full"
                  value={editTitulo}
                  onChange={e => setEditTitulo(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block font-semibold mb-1">Prazo de Entrega (Data Fim)</label>
                <input
                  type="datetime-local"
                  className="border rounded px-3 py-2 w-full"
                  value={editDataFim}
                  onChange={e => setEditDataFim(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block font-semibold mb-1">Quantidade de questões sorteadas</label>
                <input
                  type="number"
                  min={1}
                  className="border rounded px-3 py-2 w-full"
                  value={editQtdQuestoes}
                  onChange={e => setEditQtdQuestoes(Number(e.target.value))}
                  required
                />
              </div>
              {editError && <div className="text-red-600 mb-2">{editError}</div>}
              {editSuccess && <div className="text-green-600 mb-2">{editSuccess}</div>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                  disabled={editLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  disabled={editLoading}
                >
                  {editLoading ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Abas */}
      <div className="flex space-x-2 mb-6 border-b">
        <button
          className={`px-4 py-2 -mb-px rounded-t font-semibold focus:outline-none transition ${
            abaAtiva === "atividade"
              ? "bg-white border-l border-t border-r border-b-0 text-blue-700"
              : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setAbaAtiva("atividade")}
        >
          Atividade
        </button>
        <button
          className={`px-4 py-2 -mb-px rounded-t font-semibold focus:outline-none transition ${
            abaAtiva === "alunos"
              ? "bg-white border-l border-t border-r border-b-0 text-blue-700"
              : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setAbaAtiva("alunos")}
        >
          Alunos
        </button>
      </div>

      {/* Conteúdo das abas */}
      {abaAtiva === "atividade" && (
        <>
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
                  {q.opcoes && q.opcoes.length > 0 && (
                    <ul className="ml-4 list-disc text-gray-700">
                      {q.opcoes.map((op, idx) => (
                        <li key={idx}>
                          <span
                            className={
                              op.correta
                                ? "text-green-700 font-semibold"
                                : ""
                            }
                          >
                            {op.texto}
                            {op.correta && <span className="ml-2 text-xs bg-green-100 text-green-700 rounded px-2 py-0.5">Correta</span>}
                          </span>
                        </li>
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
        </>
      )}

      {abaAtiva === "alunos" && (
        <div>
          {carregandoAlunos ? (
            <div>Carregando alunos...</div>
          ) : alunos.length === 0 ? (
            <div className="text-gray-500">Nenhum aluno cadastrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2 border">Nome</th>
                    <th className="px-3 py-2 border">Email</th>
                    <th className="px-3 py-2 border">RGA</th>
                    <th className="px-3 py-2 border">Acertos</th>
                    <th className="px-3 py-2 border">Respondeu?</th>
                  </tr>
                </thead>
                <tbody>
                  {alunos.map(aluno => {
                    const resposta = getRespostaDoAluno(aluno);
                    return (
                      <tr key={aluno._id || aluno.email || aluno.rga}>
                        <td className="px-3 py-2 border">{aluno.nome}</td>
                        <td className="px-3 py-2 border">{aluno.email}</td>
                        <td className="px-3 py-2 border">{aluno.rga}</td>
                        <td className="px-3 py-2 border">
                          {resposta
                            ? `${resposta.acertos ?? 0} de ${resposta.total ?? (atividade.questoes?.length ?? '-')}`
                            : '-'}
                        </td>
                        <td className={`px-3 py-2 border ${resposta ? "text-green-700 font-bold" : "text-gray-500"}`}>
                          {resposta ? "Sim" : "Não"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-row gap-2">
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
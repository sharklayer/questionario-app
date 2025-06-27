'use client'

import React, { useEffect, useState } from "react";
import { getSession, useSession, signIn } from "next-auth/react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [questoes, setQuestoes] = useState([]);
  const [novaQuestao, setNovaQuestao] = useState({
    tipo: "objetiva",
    enunciado: "",
    opcoes: [{ texto: "", correta: false }, { texto: "", correta: false }]
  });
  const [loading, setLoading] = useState(true);

  // Protege a rota: só admins podem acessar
  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user?.isAdmin) {
      signIn(); // Redireciona para login caso não seja admin
    }
  }, [session, status]);

  // Carrega lista de questões
  useEffect(() => {
    if (!session?.user?.isAdmin) return;
    fetch("/api/questoes")
      .then(res => res.json())
      .then(setQuestoes)
      .finally(() => setLoading(false));
  }, [session]);

  // Manipula campos do formulário de nova questão
  const handleQuestaoChange = (e) => {
    setNovaQuestao({ ...novaQuestao, [e.target.name]: e.target.value });
  };

  // Manipula opções do formulário
  const handleOpcaoChange = (idx, field, value) => {
    const novasOpcoes = novaQuestao.opcoes.map((op, i) =>
      i === idx ? { ...op, [field]: field === "correta" ? value : value } : op
    );
    setNovaQuestao({ ...novaQuestao, opcoes: novasOpcoes });
  };

  // Adiciona uma nova opção ao formulário
  const addOpcao = () => {
    setNovaQuestao({
      ...novaQuestao,
      opcoes: [...novaQuestao.opcoes, { texto: "", correta: false }]
    });
  };

  // Remove uma opção do formulário
  const removeOpcao = (idx) => {
    setNovaQuestao({
      ...novaQuestao,
      opcoes: novaQuestao.opcoes.filter((_, i) => i !== idx)
    });
  };

  // Envia nova questão para a API
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/questoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novaQuestao),
    });
    if (res.ok) {
      setNovaQuestao({
        tipo: "objetiva",
        enunciado: "",
        opcoes: [{ texto: "", correta: false }, { texto: "", correta: false }]
      });
      // Atualiza lista
      fetch("/api/questoes")
        .then(res => res.json())
        .then(setQuestoes);
    } else {
      alert("Erro ao cadastrar questão!");
    }
  };

  // Exclui uma questão
  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    await fetch(`/api/questoes/${id}`, { method: "DELETE" });
    setQuestoes(questoes.filter(q => q._id !== id));
  };

  if (loading) return <div>Carregando...</div>;
  if (!session?.user?.isAdmin) return <div>Acesso restrito ao administrador.</div>;

  return (
    <div>
      <h1>Painel de Administração</h1>

      <h2>Cadastrar nova questão</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tipo:&nbsp;
            <select name="tipo" value={novaQuestao.tipo} onChange={handleQuestaoChange}>
              <option value="objetiva">Objetiva</option>
              <option value="vf">Verdadeiro/Falso</option>
            </select>
          </label>
        </div>
        <div>
          <label>Enunciado:&nbsp;
            <input
              type="text"
              name="enunciado"
              value={novaQuestao.enunciado}
              onChange={handleQuestaoChange}
              required
              style={{ width: "400px" }}
            />
          </label>
        </div>
        <div>
          <label>Opções:</label>
          <ul>
            {novaQuestao.opcoes.map((op, idx) => (
              <li key={idx}>
                <input
                  type="text"
                  placeholder={`Opção ${idx + 1}`}
                  value={op.texto}
                  onChange={e => handleOpcaoChange(idx, "texto", e.target.value)}
                  required
                />
                <label>
                  &nbsp;Correta?
                  <input
                    type="checkbox"
                    checked={op.correta}
                    onChange={e => handleOpcaoChange(idx, "correta", e.target.checked)}
                  />
                </label>
                <button type="button" onClick={() => removeOpcao(idx)} disabled={novaQuestao.opcoes.length <= 2}>Remover</button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={addOpcao}>Adicionar opção</button>
        </div>
        <button type="submit">Cadastrar questão</button>
      </form>

      <h2>Lista de questões</h2>
      <ul>
        {questoes.map((q, idx) => (
          <li key={q._id}>
            <strong>{idx + 1}. {q.enunciado}</strong> ({q.tipo})<br />
            <ul>
              {q.opcoes.map((op, i) => (
                <li key={i} style={{ color: op.correta ? "green" : "black" }}>
                  {op.texto}
                  {op.correta ? " (correta)" : ""}
                </li>
              ))}
            </ul>
            <button onClick={() => handleDelete(q._id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
'use client'
import { useState, useEffect } from "react";

export default function QuestoesTable() {
  const [questoes, setQuestoes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("");
  const [limit] = useState(10);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    setCarregando(true);
    const params = new URLSearchParams({
      page,
      limit,
      ...(q ? { q } : {}),
      ...(tipo ? { tipo } : {}),
    });
    fetch(`/api/questoes?${params}`)
      .then(res => res.json())
      .then(data => {
        setQuestoes(data.questoes);
        setTotal(data.total);
        setPages(data.pages);
        setCarregando(false);
      });
  }, [page, q, tipo, limit]);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar enunciado..."
          value={q}
          onChange={e => { setQ(e.target.value); setPage(1); }}
          className="border rounded p-2"
        />
        <select
          value={tipo}
          onChange={e => { setTipo(e.target.value); setPage(1); }}
          className="border rounded p-2"
        >
          <option value="">Todos os tipos</option>
          <option value="objetiva">Múltipla Escolha</option>
          <option value="vf">Verdadeiro ou Falso</option>
        </select>
      </div>

      {carregando ? (
        <p>Carregando...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Enunciado</th>
              <th className="border px-2 py-1">Tipo</th>
              <th className="border px-2 py-1">Nº Opções</th>
            </tr>
          </thead>
          <tbody>
            {questoes.map(q => (
              <tr key={q._id}>
                <td className="border px-2 py-1">{q.enunciado}</td>
                <td className="border px-2 py-1">{q.tipo === "objetiva" ? "Múltipla Escolha" : "V/F"}</td>
                <td className="border px-2 py-1">{q.opcoes.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-2 py-1 rounded border mr-2 disabled:opacity-50"
        >Anterior</button>
        <span>Página {page} de {pages}</span>
        <button
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
          className="px-2 py-1 rounded border ml-2 disabled:opacity-50"
        >Próxima</button>
      </div>
      <div className="mt-2 text-sm text-gray-500">
        Total de questões: {total}
      </div>
    </div>
  );
}
'use client'
import { useState, useEffect } from "react";

export default function AlunosTable() {
  const [alunos, setAlunos] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [q, setQ] = useState("");
  const [limit] = useState(10);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    setCarregando(true);
    const params = new URLSearchParams({
      page,
      limit,
      ...(q ? { q } : {}),
    });
    fetch(`/api/alunos?${params}`)
      .then(res => res.json())
      .then(data => {
        setAlunos(Array.isArray(data.alunos) ? data.alunos : []);
        setTotal(Number.isFinite(data.total) ? data.total : 0);
        setPages(Number.isFinite(data.pages) ? data.pages : 1);
      })
      .catch(() => {
        setAlunos([]);
        setTotal(0);
        setPages(1);
      })
      .finally(() => setCarregando(false));
  }, [page, q, limit]);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar nome ou e-mail..."
          value={q}
          onChange={e => { setQ(e.target.value); setPage(1); }}
          className="border rounded p-2"
        />
      </div>

      {carregando ? (
        <p>Carregando...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Nome</th>
              <th className="border px-2 py-1">E-mail</th>
              <th className="border px-2 py-1">RGA</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(alunos) ? alunos : []).map(a => (
              <tr key={a._id}>
                <td className="border px-2 py-1">{a.nome}</td>
                <td className="border px-2 py-1">{a.email}</td>
                <td className="border px-2 py-1">{a.rga}</td>
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
        Total de alunos: {total}
      </div>
    </div>
  );
}
'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ListaAtividades({ paraAluno = false }) {
  const [atividades, setAtividades] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchAtividades() {
      setCarregando(true);
      const res = await fetch("/api/atividades");
      const lista = await res.json();
      setAtividades(lista);
      setCarregando(false);
    }
    fetchAtividades();
  }, []);

  // Filtra por período se for para aluno (só mostra disponíveis)
  const agora = new Date();
  const atividadesFiltradas = paraAluno
    ? atividades.filter(a =>
        a.ativa &&
        new Date(a.dataInicio) <= agora &&
        new Date(a.dataFim) >= agora
      )
    : atividades;

  if (carregando) return <div>Carregando atividades...</div>;

  if (!atividadesFiltradas.length) return (
    <div className="text-center text-gray-500 mt-8">
      Nenhuma atividade disponível.
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-6">Atividades</h2>
      <ul className="space-y-4">
        {atividadesFiltradas.map(atv => (
          <li key={atv._id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-semibold">{atv.titulo}</div>
              <div className="text-sm text-gray-600">{atv.descricao}</div>
              <div className="text-xs text-gray-500 mt-2">
                {new Date(atv.dataInicio).toLocaleString()} até {new Date(atv.dataFim).toLocaleString()}
              </div>
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded mt-3 md:mt-0"
              onClick={() => router.push(`/atividades/${atv._id}`)}
            >
              {paraAluno ? "Responder" : "Visualizar"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
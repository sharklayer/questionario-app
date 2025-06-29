'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Função para formatar data com dia da semana (sem '-feira'!), dia/mês/ano e hora:minuto (sem segundos)
function formatarDataCompleta(dateString) {
  const date = new Date(dateString);
  let str = date.toLocaleString('pt-BR', {
    weekday: 'long',    // dia da semana
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  // Remove o sufixo "-feira" dos dias da semana
  str = str.replace(/-feira/gi, "");
  // Opcional: tirar espaço duplo caso reste, e capitalizar primeira letra
  str = str.replace(/\s+/g, ' ').replace(/^./, c => c.toUpperCase());
  return str.trim();
}

export default function ListaAtividades({ paraAluno = false }) {
  const [atividades, setAtividades] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchAtividades() {
      setCarregando(true);
      const res = await fetch("/api/atividades");
      const data = await res.json();
      // Corrija conforme formato do backend!
      const lista = Array.isArray(data) 
        ? data 
        : Array.isArray(data.atividades) 
          ? data.atividades 
          : [];
      setAtividades(lista);
      setCarregando(false);
    }
    fetchAtividades();
  }, []);

  // Agora mostra todas as atividades ativas cujo fim ainda não passou
  const agora = new Date();
  const atividadesFiltradas = paraAluno
    ? atividades.filter(a =>
        a.ativa &&
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
        {atividadesFiltradas.map(atv => {
          const dataInicio = new Date(atv.dataInicio);
          const dataFim = new Date(atv.dataFim);
          const bloqueada = paraAluno && dataInicio > agora;
          return (
            <li key={atv._id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold flex items-center gap-2">
                  {atv.titulo}
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      atv.ativa
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                    title={atv.ativa ? "Ativa" : "Inativa"}
                  >
                    {atv.ativa ? "Ativa" : "Inativa"}
                  </span>
                </div>
                <div className="text-sm text-gray-600">{atv.descricao}</div>
                <div className="text-xs text-gray-500 mt-2">
                  De {formatarDataCompleta(atv.dataInicio)} até {formatarDataCompleta(atv.dataFim)}
                </div>
                {bloqueada && (
                  <div className="text-xs text-yellow-700 bg-yellow-100 mt-2 px-2 py-1 inline-block rounded">
                    Disponível a partir de {formatarDataCompleta(atv.dataInicio)}
                  </div>
                )}
              </div>
              <button
                className={`bg-blue-600 text-white px-4 py-2 rounded mt-3 md:mt-0 ${bloqueada ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => {
                  if (bloqueada) return;
                  router.push(
                    paraAluno
                      ? `/aluno/atividades/${atv._id}`
                      : `/admin/atividades/${atv._id}`
                  );
                }}
                disabled={bloqueada}
              >
                {paraAluno 
                  ? bloqueada 
                    ? "Aguardando início" 
                    : "Responder"
                  : "Visualizar"}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  );
}
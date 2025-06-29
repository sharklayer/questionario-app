'use client'

import AtividadeTable from "@/components/AtividadeTable";

export default function ListaAtividadesAluno() {
  return (
    <div className="max-w-3xl mx-auto pt-8">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Atividades Disponíveis</h1>
      {/* AtividadeTable com paraAluno faz o filtro de datas/ativas */}
      <AtividadeTable paraAluno />
    </div>
  );
}
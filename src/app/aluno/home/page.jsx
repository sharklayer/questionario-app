'use client'

import AtividadeTable from "@/components/AtividadeTable";

export default function AlunoHome() {
  return (
    <div className="max-w-3xl mx-auto pt-8">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Minhas Atividades</h1>
      <p className="mb-8 text-gray-600">Você pode visualizar e responder suas atividades disponíveis abaixo.</p>
      <AtividadeTable paraAluno />
    </div>
  );
}
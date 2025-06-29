'use client'

import AlunosTable from "@/components/AlunosTable";

export default function ListaAlunosAdmin() {
  return (
    <div className="max-w-3xl mx-auto pt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Alunos cadastrados</h1>
        <a
          href="/admin/alunos/add"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Novo Aluno
        </a>
      </div>
      <AlunosTable />
    </div>
  );
}
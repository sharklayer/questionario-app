'use client'

import QuestoesTable from "@/components/QuestoesTable";

export default function ListaQuestoesAdmin() {
  return (
    <div className="max-w-3xl mx-auto pt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Questões cadastradas</h1>
        <a
          href="/admin/questoes/add"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Nova Questão
        </a>
      </div>
      <QuestoesTable />
    </div>
  );
}
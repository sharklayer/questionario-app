'use client'

import AtividadeTable from "@/components/AtividadeTable";
import Link from "next/link";

export default function ListaAtividadesAdmin() {
  return (
    <div className="max-w-3xl mx-auto pt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Atividades cadastradas</h1>
        <Link
          href="/admin/atividades/add"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Nova Atividade
        </Link>
      </div>
      <AtividadeTable />
    </div>
  );
}
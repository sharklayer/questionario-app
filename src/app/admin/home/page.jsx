'use client'

import AtividadeTable from "@/components/AtividadeTable";

export default function AdminHome() {
  return (
    <div className="max-w-3xl mx-auto pt-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard Administrativo</h1>
      <p className="mb-8 text-gray-600">Bem-vindo ao painel do administrador!</p>
      <h2 className="text-xl font-semibold mb-2">Atividades Cadastradas</h2>
      <AtividadeTable />
    </div>
  );
}
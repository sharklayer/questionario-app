'use client'
import AtividadeForm from "@/components/AtividadeForm";

export default function NovaAtividadeAdmin() {
  return (
    <div className="max-w-xl mx-auto pt-10">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Cadastrar Nova Atividade</h1>
      <AtividadeForm />
    </div>
  );
}
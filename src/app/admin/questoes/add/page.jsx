'use client'
import QuestaoForm from "@/components/QuestoesForm";

export default function NovaQuestaoAdmin() {
  return (
    <div className="max-w-xl mx-auto pt-10">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Cadastrar Nova Questão</h1>
      <QuestaoForm />
    </div>
  );
}
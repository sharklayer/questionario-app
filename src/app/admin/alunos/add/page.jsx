'use client'
import AlunoForm from "@/components/AlunosForm";

export default function NovoAlunoAdmin() {
  return (
    <div className="max-w-xl mx-auto pt-10">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Cadastrar Novo Aluno</h1>
      <AlunoForm />
    </div>
  );
}
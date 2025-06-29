'use client'
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

export default function QuestaoForm({ initialData = {} }) {
  const [tipo, setTipo] = useState(initialData.tipo || "objetiva");
  const [enunciado, setEnunciado] = useState(initialData.enunciado || "");
  const [opcoes, setOpcoes] = useState(
    initialData.opcoes ||
      (tipo === "vf"
        ? [
            { texto: "Verdadeiro", correta: false },
            { texto: "Falso", correta: false },
          ]
        : [{ texto: "", correta: false }, { texto: "", correta: false }])
  );
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const opcaoRefs = useRef([]);

  useEffect(() => {
    if (tipo === "vf") {
      setOpcoes([
        { texto: "Verdadeiro", correta: false },
        { texto: "Falso", correta: false },
      ]);
    } else if (
      opcoes.length === 2 &&
      ["Verdadeiro", "Falso"].includes(opcoes[0].texto)
    ) {
      setOpcoes([
        { texto: "", correta: false },
        { texto: "", correta: false },
      ]);
    }
  }, [tipo]);

  if (status === "loading") return <div>Carregando...</div>;
  if (!session) return signIn();
  if (!session.user?.isAdmin)
    return (
      <div className="text-center mt-8">
        <p>Acesso restrito a administradores.</p>
        <button
          className="text-blue-600 underline"
          onClick={() => signOut()}
        >
          Sair
        </button>
      </div>
    );

  const adicionarOpcao = () => {
    setOpcoes([...opcoes, { texto: "", correta: false }]);
    setTimeout(() => {
      if (opcaoRefs.current[opcoes.length]) {
        opcaoRefs.current[opcoes.length].focus();
      }
    }, 10);
  };

  const removerOpcao = (idx) =>
    setOpcoes(opcoes.filter((_, i) => i !== idx));
  const atualizarOpcao = (idx, texto) => {
    const novas = [...opcoes];
    novas[idx].texto = texto;
    setOpcoes(novas);
  };
  const marcarCorreta = (idx, checked) => {
    if (tipo === "vf") {
      setOpcoes(
        opcoes.map((o, i) => ({
          ...o,
          correta: i === idx ? true : false,
        }))
      );
    } else {
      const novas = [...opcoes];
      novas[idx].correta = checked;
      setOpcoes(novas);
    }
  };

  const handleOptionKeyDown = (idx, e) => {
    if (e.key === "Tab" && !e.shiftKey) {
      if (idx < opcoes.length - 1) {
        e.preventDefault();
        opcaoRefs.current[idx + 1]?.focus();
      }
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    if (!enunciado.trim()) {
      setErro("Preencha o enunciado.");
      return;
    }
    if (
      tipo === "objetiva" &&
      (opcoes.length < 2 || opcoes.some((o) => !o.texto.trim()))
    ) {
      setErro("Preencha pelo menos 2 opções válidas.");
      return;
    }
    if (!opcoes.some((o) => o.correta)) {
      setErro("Marque ao menos uma opção como correta.");
      return;
    }
    setEnviando(true);

    const res = await fetch("/api/questoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, enunciado, opcoes }),
      credentials: "include",
    });
    setEnviando(false);
    if (res.ok) {
      router.push("/admin/questoes");
    } else {
      const data = await res.json();
      setErro(data.error || "Erro ao cadastrar questão.");
    }
  }

  return (
    <>
      <button
        type="button"
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        onClick={() => router.back()}
      >
        ← Voltar
      </button>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded p-6 space-y-4"
      >
        <div>
          <label className="block font-semibold mb-1">Tipo:</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="objetiva">Múltipla Escolha</option>
            <option value="vf">Verdadeiro ou Falso</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Enunciado:</label>
          <textarea
            value={enunciado}
            onChange={(e) => setEnunciado(e.target.value)}
            className="border p-2 rounded w-full min-h-[80px] resize-y"
            rows={3}
            placeholder="Digite o enunciado da questão"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Opções:</label>
          {opcoes.map((op, idx) => (
            <div key={idx} className="flex items-center mb-2 gap-2">
              {tipo === "objetiva" ? (
                <>
                  <textarea
                    ref={el => opcaoRefs.current[idx] = el}
                    value={op.texto}
                    onChange={e => atualizarOpcao(idx, e.target.value)}
                    onKeyDown={e => handleOptionKeyDown(idx, e)}
                    className="border p-2 rounded w-full min-h-[40px] resize-y"
                    placeholder={`Opção ${idx + 1}`}
                    rows={2}
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={!!op.correta}
                      onChange={e =>
                        marcarCorreta(idx, e.target.checked)
                      }
                      className="mr-1"
                    />
                    correta
                  </label>
                  {opcoes.length > 2 && (
                    <button
                      type="button"
                      className="ml-2 text-red-500"
                      onClick={() => removerOpcao(idx)}
                    >
                      Remover
                    </button>
                  )}
                </>
              ) : (
                <>
                  <textarea
                    value={op.texto}
                    readOnly
                    className="border p-2 rounded w-full bg-gray-100 min-h-[40px] resize-none"
                    rows={2}
                  />
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!!op.correta}
                      onChange={() => marcarCorreta(idx, true)}
                      className="mr-1"
                      name="verdadeiro_falso"
                    />
                    correta
                  </label>
                </>
              )}
            </div>
          ))}
          {tipo === "objetiva" && (
            <button
              type="button"
              onClick={adicionarOpcao}
              className="text-blue-500 mt-1"
            >
              Adicionar opção
            </button>
          )}
        </div>
        {erro && <div className="text-red-500">{erro}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={enviando}
        >
          {enviando ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </>
  );
}
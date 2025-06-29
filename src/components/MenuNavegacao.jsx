'use client'
import Link from "next/link";
import { signOut } from "next-auth/react";
import { UserCircleIcon, ArrowRightOnRectangleIcon, HomeIcon } from "@heroicons/react/24/outline";

export default function MenuNavegacao({ session }) {
  return (
    <nav className="bg-white shadow mb-6">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex gap-4 items-center">
          <HomeIcon className="h-6 w-6 text-blue-500" />
          <Link href="/aluno" className="text-gray-700 font-semibold hover:text-blue-600 transition">Questionário</Link>
          <Link href="/historico" className="text-gray-700 font-semibold hover:text-blue-600 transition">Histórico</Link>
          {session?.user?.isAdmin && (
            <Link href="/admin" className="text-gray-700 font-semibold hover:text-blue-600 transition">Admin</Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <UserCircleIcon className="h-6 w-6 text-gray-400" />
          <span className="text-gray-600 text-sm">{session?.user?.nome || session?.user?.email}</span>
          <button
            className="ml-4 flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
            onClick={() => signOut()}
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
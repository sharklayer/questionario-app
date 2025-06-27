'use client'

import { getProviders, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { LockClosedIcon } from "@heroicons/react/24/solid";

export default function SignIn() {
  const [providers, setProviders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getProviders().then(setProviders);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm flex flex-col items-center">
        <div className="flex justify-center mb-4">
          <LockClosedIcon className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">Entrar no sistema</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center">
            {error}
          </div>
        )}
        <div className="space-y-4 w-full">
          {providers &&
            Object.values(providers).map((provider) => (
              <button
                key={provider.name}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition"
                onClick={() => signIn(provider.id)}
              >
                Entrar com {provider.name}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
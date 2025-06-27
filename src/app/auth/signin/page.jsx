'use client'

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const router = useRouter();
    const { data: session } = useSession();
    const [serverError, setServerError] = useState('');

    // Redireciona automaticamente se o usuário já estiver autenticado
    useEffect(() => {
        if (session) {
            router.replace('/');
        }
    }, [session]);

    // Definindo o esquema de validação com Yup
    const loginSchema = yup.object().shape({
        email: yup
            .string()
            .email('Digite um email válido!')
            .required('O email é obrigatório!'),
        senha: yup
            .string()
            .min(8, 'A senha deve ter no mínimo 8 caracteres!')
            .required('A senha é obrigatória!'),
    });

    // Configurando o React Hook Form
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(loginSchema) });

    // Função de autenticação
    const onSubmit = async (credentials) => {
        setServerError(''); // Limpa erros anteriores
        const response = await signIn('credentials', {
            ...credentials,
            redirect: false,
        });

        if (response?.ok) {
            router.replace('/');
        } else {
            setServerError('Email e/ou senha inválidos!');
        }
    };

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    Entre na sua conta
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
                <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {/* Exibe erro do servidor */}
                        {serverError && (
                            <div className="text-sm text-red-600 mb-4">{serverError}</div>
                        )}

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium leading-6 text-gray-900"
                            >
                                Email
                            </label>
                            <div className="mt-2">
                                <input
                                    {...register('email')}
                                    type="text"
                                    autoComplete="email"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600" id="email-error">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium leading-6 text-gray-900"
                            >
                                Senha
                            </label>
                            <div className="mt-2">
                                <input
                                    {...register('senha')}
                                    type="password"
                                    autoComplete="current-password"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                            {errors.senha && (
                                <p className="mt-2 text-sm text-red-600" id="password-error">
                                    {errors.senha.message}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm leading-6">
                                <Link
                                    href="/auth/signup"
                                    className="font-semibold text-indigo-600 hover:text-indigo-500"
                                >
                                    Não tem uma conta? Cadastre-se
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Entrar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
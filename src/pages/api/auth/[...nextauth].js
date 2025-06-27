import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/dbConnect";
import Usuario from "@/models/usuario.model";
import bcrypt from "bcrypt";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "seu@email.com" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();
        const usuario = await Usuario.findOne({ email: credentials.email });
        if (!usuario) return null;

        const senhaCorreta = await bcrypt.compare(credentials.senha, usuario.senha);
        if (!senhaCorreta) return null;

        return {
          id: usuario._id,
          nome: usuario.nome,
          email: usuario.email,
          isAdmin: usuario.isAdmin,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin;
        token.nome = user.nome;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.isAdmin = token.isAdmin;
        session.user.nome = token.nome;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});
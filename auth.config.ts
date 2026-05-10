import type { AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { dbQuery, getPostgresPool } from "@/lib/db/postgres";

type LoginUserRow = {
  id: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  avatar_url: string | null;
};

export const authConfig: AuthOptions = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        const identifier = String(credentials.identifier).trim().toLowerCase();
        const password = String(credentials.password);

        const result = await dbQuery<LoginUserRow>(
          `
            select
              au.id::text,
              au.email,
              au.password_hash,
              p.full_name,
              p.avatar_url
            from public.auth_users au
            join public.profiles p on p.id = au.id
            where lower(au.email) = $1
               or p.username = $1::citext
            limit 1
          `,
          [identifier],
        );

        const user = result.rows[0];
        if (!user?.password_hash) return null;

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.full_name,
          image: user.avatar_url,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;

      const email = profile?.email?.toLowerCase();
      if (!email) return false;
      const displayName = user.name || profile?.name || "مستخدم جديد";

      const client = await getPostgresPool().connect();

      try {
        await client.query("begin");

        const existing = await client.query<{ id: string }>(
          "select id::text from public.auth_users where lower(email) = lower($1) limit 1",
          [email],
        );

        let userId = existing.rows[0]?.id;

        if (!userId) {
          const authUser = await client.query<{ id: string }>(
            "insert into public.auth_users (email, password_hash) values (lower($1), '') returning id::text",
            [email],
          );
          userId = authUser.rows[0].id;

          const baseUsername = email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24) || "user";
          const usernameResult = await client.query<{ username: string }>(
            `
              with recursive candidate(n, username) as (
                select 0, $1::text
                union all
                select n + 1, ($1 || (n + 1)::text)
                from candidate
                where n < 100
              )
              select username
              from candidate
              where not exists (
                select 1 from public.profiles p where p.username = candidate.username::citext
              )
              limit 1
            `,
            [baseUsername],
          );

          await client.query(
            `
              insert into public.profiles (id, full_name, username, email, phone, avatar_url, role)
              values ($1, $2, $3::citext, lower($4)::citext, $5, $6, 'user')
            `,
            [
              userId,
              displayName,
              usernameResult.rows[0]?.username ?? `user_${userId.slice(0, 8)}`,
              email,
              `+google${userId.replace(/-/g, "").slice(0, 24)}`,
              user.image,
            ],
          );
        }

        user.id = userId;
        await client.query("commit");
        return true;
      } catch (error) {
        await client.query("rollback").catch(() => undefined);
        console.error("Google sign-in provisioning error:", error);
        return false;
      } finally {
        client.release();
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

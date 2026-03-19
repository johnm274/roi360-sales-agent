import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { db } from '@/lib/db/client';
import { partners } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const {
    handlers,
    signIn,
    signOut,
    auth,
} = NextAuth({
    trustHost: true,
    providers: [
        Credentials({
            name: 'Email & Password',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'email',
                },
                password: {
                    label: 'Password',
                    type: 'password',
                },
            },
            async authorize(credentials) {
                if (
                    !credentials?.email ||
                    !credentials?.password
                ) {
                    return null;
                }

                const email =
                    credentials.email as string;
                const password =
                    credentials.password as string;

                const rows = await db
                    .select()
                    .from(partners)
                    .where(
                        eq(partners.email, email),
                    );

                const partner = rows[0];

                if (!partner) {
                    return null;
                }

                const isValid = await compare(
                    password,
                    partner.passwordHash,
                );

                if (!isValid) {
                    return null;
                }

                return {
                    id: partner.id,
                    name: partner.name,
                    email: partner.email,
                    isAdmin: partner.isAdmin,
                    companyName:
                        partner.companyName,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.isAdmin = (
                    user as {
                        isAdmin?: boolean;
                    }
                ).isAdmin;
                token.companyName = (
                    user as {
                        companyName?: string;
                    }
                ).companyName;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id =
                    token.id as string;
                session.user.isAdmin =
                    token.isAdmin as boolean;
                session.user.companyName =
                    token.companyName as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
});

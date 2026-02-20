import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import FacebookProvider from "next-auth/providers/facebook";
import { graphqlClient, UNIFIED_AUTH_MUTATION } from "@/lib/graphql";
import { LOGIN_MUTATION } from "@/graphQL/accounts";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      if (account && account.provider) {
        const token = account.id_token || account.access_token;
        if (token) {
          try {
            const response = await graphqlClient.request(LOGIN_MUTATION, {
              idToken: token,
              provider: account.provider, // "google" | "github" | "facebook"
            });
            if (response && response.login && response.login.user) {
              console.log(`OAuth (${account.provider}) user:`, response.login);
            } else if (response && response.signup && response.signup.user) {
              console.log(`OAuth (${account.provider}) user:`, response.signup.user);
            }
          } catch (error) {
            console.error(`OAuth (${account.provider}) GraphQL error:`, error);
          }
        }
      }
      
      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.id_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        provider: token.provider,
      };
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

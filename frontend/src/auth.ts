import NextAuth, { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const config = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      async profile(profile) {
        try {
          const userData = await axios.post(
            `${process.env.BACKEND_URL}/api/googlesignup`,
            {
              email: profile.email,
              name: profile.name,
              image: profile.picture,
            }
          );

          return {
            id: userData.data.user?.id || profile.sub, // Ensure id is always set
            name: userData.data.user.full_name,
            email: userData.data.user.email,
            token: userData.data.token,
          };
        } catch (err: unknown) {
          if (axios.isAxiosError(err) && err.response?.data?.error) {
            console.log(err.response.data.error);
          } else {
            console.log("An unknown error occurred", err);
          }
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
          };
        }
      },
    }),
    CredentialsProvider({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }
        try {
          console.log("Hello");
          const res = await axios.post(
            `${process.env.BACKEND_URL}/api/login`,
            {
              email: credentials.email,
              password: credentials.password,
            }
          );

          if (res.data.error) throw new Error(res.data.error);
          console.log(res);
          return res.data.user;
        } catch (error: unknown) {
          if (axios.isAxiosError(error) && error.response?.data?.error) {
            console.log(error.response.data.error);
            throw new Error(error.response.data.error);
          } else {
            console.log("An unknown error occurred", error);
            throw new Error("Something went wrong");
          }
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user.email) {
        try {
          const res = await axios.post(
            `${process.env.BACKEND_URL}/api/userexistsbyemail`,
            {
              email: user.email,
            }
          );

          if (res.data.exists === false) {
            await axios.post(`${process.env.BACKEND_URL}/api/register`, {
              email: user.email,
            });
          }
        } catch (err: unknown) {
          if (axios.isAxiosError(err) && err.response?.data?.error) {
            console.error(
              "User existence check failed:",
              err.response.data.error
            );
          } else {
            console.error(
              "User existence check failed:",
              err instanceof Error ? err.message : err
            );
          }
        }
      }
      return true;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  events: {},
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);

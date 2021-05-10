import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { NextAuthOptions, User } from 'next-auth';
import Providers from 'next-auth/providers';

interface UserInfo extends User {
  accessToken: string
}


// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
const options: NextAuthOptions = {
  // https://next-auth.js.org/configuration/providers
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!
    }),
    Providers.Credentials({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        username: { label: "Username", type: "text" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add logic here to look up the user from the credentials supplied
        const user = { id: 1, name: 'J Smith', email: 'jsmith@example.com', password: "test" }
        console.log("authorize",credentials)
  
        if (user) {
          // Any object returned will be saved in `user` property of the JWT
          return user
        } else {
          // If you return null or false then the credentials will be rejected
          return null
          // You can also Reject this callback with an Error or with a URL:
          // throw new Error('error message') // Redirect to error page
          // throw '/path/to/redirect'        // Redirect to a URL
        }
      }
    })
  ],
  // Database optional. MySQL, Maria DB, Postgres and MongoDB are supported.
  // https://next-auth.js.org/configuration/database
  //
  // Notes:
  // * You must to install an appropriate node_module for your database
  // * The Email provider requires a database (OAuth providers do not)
  // database: process.env.DATABASE_URL,

  // The secret should be set to a reasonably long random string.
  // It is used to sign cookies and to sign and encrypt JSON Web Tokens, unless
  // a seperate secret is defined explicitly for encrypting the JWT.
  secret: process.env.SECRET,

  session: {
    // Use JSON Web Tokens for session instead of database sessions.
    // This option can be used with or without a database for users/accounts.
    // Note: `jwt` is automatically set to `true` if no database is specified.
    jwt: true, 
    
    // Seconds - How long until an idle session expires and is no longer valid.
    // maxAge: 30 * 24 * 60 * 60, // 30 days

    // Seconds - Throttle how frequently to write to database to extend a session.
    // Use it to limit write operations. Set to 0 to always update the database.
    // Note: This option is ignored if using JSON Web Tokens 
    // updateAge: 24 * 60 * 60, // 24 hours
  },

  // JSON Web tokens are only used for sessions if the `jwt: true` session
  // option is set - or by default if no database is specified.
  // https://next-auth.js.org/configuration/options#jwt
  jwt: {
    // A secret to use for key generation (you should set this explicitly)
    // secret: 'INp8IvdIyeMcoGAgFGoA61DdBglwwSqnXJZkgz8PSnw', 
    
    // Set to true to use encryption (default: false)
    // encryption: true,

    // You can define your own encode/decode functions for signing and encryption
    // if you want to override the default behaviour.
    // encode: async ({ secret, token, maxAge }) => {},
    // decode: async ({ secret, token, maxAge }) => {},
    encode: async (jwtEncodeParams) => {
      const token = jwtEncodeParams?.token
      const secret = jwtEncodeParams?.secret as string
      let encodedToken = ""
      if (token) {
        encodedToken = jwt.sign(token, secret, { algorithm: 'HS512' })
      }
      return encodedToken
    },
    decode: async (jwtDecodeParams) => {
      const token = jwtDecodeParams?.token
      const secret = jwtDecodeParams?.secret as string
      if (token) {
        const verify = jwt.verify(token, secret) as UserInfo
        return verify
      }
      return {} as UserInfo
    },
  },

  // You can define custom pages to override the built-in pages.
  // The routes shown here are the default URLs that will be used when a custom
  // pages is not specified for that route.
  // https://next-auth.js.org/configuration/pages
  pages: {
    // signIn: '/api/auth/signin',  // Displays signin buttons
    // signOut: '/api/auth/signout', // Displays form with sign out button
    // error: '/api/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/api/auth/verify-request', // Used for check email page
    // newUser: null // If set, new users will be directed here on first sign in
  },

  // Callbacks are asynchronous functions you can use to control what happens
  // when an action is performed.
  // https://next-auth.js.org/configuration/callbacks 
  callbacks: { 
    async signIn(user, profile) {
      const isAllowedToSignIn = user.email === "atreya2011@gmail.com" ? true : false;
      console.log("signin", user)
      console.log("signin", profile)
      if (isAllowedToSignIn) {
        return true
      } else {
        // Return false to display a default error message
        return false
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    },
    // redirect: async (url, baseUrl) => { return Promise.resolve(baseUrl) },
    async redirect(url, baseUrl) {
      console.log("baseURL", baseUrl);
      console.log("url", url);
      return url.startsWith(baseUrl) ? `${baseUrl}/api-example` : baseUrl;
    },
    // session: async (session, user) => { return Promise.resolve(session) },
    async session(session, token: UserInfo) {
      console.log("session", session)
      console.log(token)
      if(token?.accessToken) {
        // Add property to session, like an access_token from a provider
        session.accessToken = token.accessToken
      }
      return session
    },
    async jwt(token: UserInfo, user, account, profile, isNewUser) {
      // Add access_token to the token right after signin
      console.log("token", token)
      console.log("account", account)
      if (account?.accessToken) {
        token.accessToken = account.accessToken
      }
      return token
    }
    // jwt: async (token, user, account, profile, isNewUser) => { return Promise.resolve(token) }
  },

  // Events are useful for logging
  // https://next-auth.js.org/configuration/events
  events: { },

  // Enable debug messages in the console if you are having problems
  debug: false,
}

export default (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, options)

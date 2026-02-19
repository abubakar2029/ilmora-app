import { GraphQLClient, gql } from "graphql-request";

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:4000/graphql";

export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT);

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation Signup(
    $firstName: String!
    $lastName: String!
    $email: String!
    $password: String!
  ) {
    signup(
      firstName: $firstName
      lastName: $lastName
      email: $email
      password: $password
    ) {
      token
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

export const OAUTH_LOGIN_MUTATION = gql`
  mutation OAuthLogin($token: String!, $provider: String!) {
    oauthLogin(token: $token, provider: $provider) {
      token
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

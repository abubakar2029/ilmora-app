import { GraphQLClient, gql } from "graphql-request";

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:8000/graphql/";

export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT);

export function extractErrorMessage(error: unknown): string {
  if (!error) return "An error occurred";

  // Handle graphql-request errors
  if (typeof error === "object" && "response" in error) {
    const gqlError = error as any;
    if (gqlError.response?.errors?.[0]?.message) {
      return gqlError.response.errors[0].message;
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Fallback
  return String(error);
}

export const UNIFIED_AUTH_MUTATION = gql`
  mutation UnifiedAuth(
    $provider: String!
    $email: String
    $password: String
    $firstName: String
    $lastName: String
    $idToken: String
    $operationType: String
  ) {
    signup(
      provider: $provider
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
      idToken: $idToken
      operationType: $operationType
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


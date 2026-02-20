import { gql } from "graphql-request";


export const LOGIN_MUTATION = gql`
  mutation (
    $provider: String!
    $idToken: String
    $email: String
    $password: String
  ) {
    login(
      provider: $provider
      idToken: $idToken
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

export const SIGNUP_MUTATION = gql`
  mutation (
    $provider: String!
    $idToken: String
    $email: String
    $password: String
    $firstName: String
    $lastName: String
  ) {
    signup(
      provider: $provider
      idToken: $idToken
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
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


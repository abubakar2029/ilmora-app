import { gql } from "graphql-request";


export const LOGIN_MUTATION = gql`
  mutation (
    $provider: String!
    $token: String
    $email: String
    $password: String
  ) {
    login(
      provider: $provider
      token: $token
      email: $email
      password: $password
    ) {
      token
      user {
        id
        email
        firstName
        profilePicture
      }
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation (
    $provider: String!
    $email: String
    $password: String
    $firstName: String
    $lastName: String
  ) {
    signup(
      provider: $provider
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


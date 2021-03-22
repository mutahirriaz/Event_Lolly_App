/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const addLolly = /* GraphQL */ `
  mutation AddLolly(
    $flavourTop: String!
    $flavourMiddle: String!
    $flavourBottom: String!
    $message: String!
    $recipientName: String!
    $senderName: String!
    $lollyPath: String!
  ) {
    addLolly(
      flavourTop: $flavourTop
      flavourMiddle: $flavourMiddle
      flavourBottom: $flavourBottom
      message: $message
      recipientName: $recipientName
      senderName: $senderName
      lollyPath: $lollyPath
    ) {
      result
    }
  }
`;

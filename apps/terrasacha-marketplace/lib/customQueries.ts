export const getProduct = /* GraphQL */ `
  query GetProduct($id: ID!) {
    getProduct(id: $id) {
      id
      name
      description
      isActive
      order
      status
      timeOnVerification
      projectReadiness
      categoryID
      transactions {
        items {
          id
        }
      }
      userProducts {
        items {
          user {
            id
            role
            name
          }
        }
      }
      productFeatures {
        items {
          id
          value
          isToBlockChain
          order
          isOnMainCard
          isResult
          productID
          verifications {
            items {
              userVerifierID
              userVerifiedID
              verificationComments {
                items {
                  comment
                  createdAt
                  id
                  isCommentByVerifier
                }
              }
              userVerified {
                name
              }
              userVerifier {
                name
              }
              id
            }
          }
          documents {
            items {
              id
              url
              isApproved
              docHash
              data
              isUploadedToBlockChain
              productFeatureID
              signed
              signedHash
              status
              timeStamp
              userID
            }
          }
          feature {
            name
            isVerifable
          }
          featureID
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;

export const listProducts = /* GraphQL */ `
  query ListProducts(
    $filter: ModelProductFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProducts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        isActive
        order
        status
        timeOnVerification
        projectReadiness
        categoryID
        userProducts {
          items {
            user {
              id
              role
              name
            }
          }
        }
        productFeatures {
          items {
            id
            value
            isToBlockChain
            order
            isOnMainCard
            isResult
            productID
            verifications {
              items {
                userVerifierID
                userVerifiedID
                verificationComments {
                  items {
                    comment
                    createdAt
                    id
                    isCommentByVerifier
                  }
                }
                userVerified {
                  name
                }
                userVerifier {
                  name
                }
                id
              }
            }
            documents {
              items {
                id
                url
                isApproved
                docHash
                data
                isUploadedToBlockChain
                productFeatureID
                signed
                signedHash
                status
                timeStamp
                userID
              }
            }
            feature {
              name
              isVerifable
            }
            featureID
            createdAt
            updatedAt
          }
          nextToken
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      name
      dateOfBirth
      isProfileUpdated
      addresss
      cellphone
      role
      status
      email
      wallets {
        items {
          id
          name
          status
          isSelected
          userID
          createdAt
          updatedAt
        }
        nextToken
      }
    }
  }
`;


export const getUserProjects = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      userProducts {
        items {
          product {
            id
            categoryID
            createdAt
            description
            isActive
            name
            order
            projectReadiness
            status
            timeOnVerification
            updatedAt
          }
          isFavorite
        }
      }
    }
  }
`;

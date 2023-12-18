import { Amplify } from 'aws-amplify';
import awsconfig from '../src/aws-exports';
import { createUser } from "@marketplaces/data-access"
import { signUp, confirmSignUp, type ConfirmSignUpInput, signIn, type SignInInput, signOut, resetPassword, type ResetPasswordInput, confirmResetPassword, type ConfirmResetPasswordInput } from 'aws-amplify/auth';
/* import { integer } from "aws-sdk/clients/cloudfront"; */
import { getProduct } from "../lib/customQueries";
/* const AWS = require("aws-sdk");

AWS.config.update(awsconfig); */

Amplify.configure(awsconfig);

//Auth AWS

type SignUpParameters = {
  username: string;
  password: string;
  email: string;
  phoneNumber: string;
  role: string;
};

export async function signUpAuth({ username, password, email, role }: SignUpParameters) {
  try {
        const response = await signUp({ 
          username,
          password,
          options: {
            userAttributes: {
              email,
              'custom:role': role  
            }
          }
          })
          console.log(response)
        const userPayload = {
          username,
          role,
          email
        }
        const responseUser = await createUser(userPayload)
        return response
  } catch (error) {
    throw error
  }
}

export async function confirmSignUpAuth({ username, confirmationCode }: ConfirmSignUpInput) {
  try {
    let result = await confirmSignUp({username, confirmationCode});
    return result
  } catch (error) {
    throw error
  }
}


export async function signInAuth({ username, password }: SignInInput) {
  try {
    const user = await signIn({ username, password })
    return user
  } catch (error) {
    throw error
  }
}


export async function signOutAuth() {
  try {
    await signOut();
  } catch (error) {
    console.log('error signing out: ', error);
  }
}

export async function forgotPassword({username} : ResetPasswordInput) {
  try {
    const data = await resetPassword({username});
    console.log(data, 'forgotPassword')
    return data
  } catch(err) {
    throw err
  }
};

export async function forgotPasswordSubmit({
  username,
  confirmationCode,
  newPassword
}: ConfirmResetPasswordInput) {
  try {
    await confirmResetPassword({ username, confirmationCode, newPassword });
    return {code: "Success", message: "Password changed successfully"}
  } catch(err) {
    throw err
  }
};


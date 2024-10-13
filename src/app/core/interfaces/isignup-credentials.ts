export interface ISignupCredentials extends ISigninCredentials{
    displayName : string;
}


export interface ISigninCredentials{
    email : string;
    password : string;
    photoUrl : string
}
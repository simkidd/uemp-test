import { IUser } from './user.interface';

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ILoginResponseData {
  user: IUser;
  tokens: IAuthTokens;
}

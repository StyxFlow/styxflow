import { user } from "../db/schema.js";

export interface ICustomError {
  message: string;
  path: string;
}

// export interface IAuthUser {
//   email: string;
//   role: string;
// }

// export interface ICustomRequest extends Request {
//   user?:typeof user;
// }

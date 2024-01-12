export type Credentials = {
  city?: string;
  company?: string;
  CRN?: number;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  profession?: string;
  type: string;
};

export type UnregisteredCredentials = {
  city: string;
  company: string;
  CRN: number;
  firstName: string;
  lastName: string;
  profession: string;
};

export type UserInfo = {
  uid: string;
  firstName: string;
  lastName: string;
};

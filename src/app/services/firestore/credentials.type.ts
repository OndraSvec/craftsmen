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

export type Craftsman = {
  city: string;
  company: string;
  CRN: number;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  profession: string;
  reviews: Review[];
  type: string;
};

export type Review = {
  id: string;
  message: string;
  rating: number;
  reviewer: Reviewer;
};

type Reviewer = {
  firstName: string;
  lastName: string;
  uid: string;
};

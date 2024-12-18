import { Request } from "express";

export interface AuthRequest<T> extends Request {
  user: {
    id: number;
  };
  body: T;
}

import { competitions } from "@prisma/client";

export interface CreateCompetition
  extends Omit<competitions, "id" | "created_at" | "updated_at"> {
  invites: { username: string; authType: string }[];
  startDate: string;
  endDate: string;
  daysOfWeek: number[];
  repeatInterval: string;
  repeatEvery: number;
  repeat: boolean;
}

import { invites } from "@prisma/client";

export interface HandleInvite extends Omit<invites, "sent_at" | "invitee_id"> {}

export interface CreateSubmissions {
  content: string;
}

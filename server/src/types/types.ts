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
  inviteList: string[];
  startDate: string;
  endDate: string;
  daysOfWeek: number[];
  repeatInterval: string;
}

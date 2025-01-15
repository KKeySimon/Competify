import { Request } from "express";

export interface AuthRequest<T> extends Request {
  user: {
    id: number;
  };
  isBot: boolean;
  body: T;
  params: Record<string, any>;
  query: Record<string, any>;
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

import { Client, Collection } from "discord.js";

export class BotClient extends Client {
  commands: Collection<string, any>;

  constructor(options) {
    super(options);
    this.commands = new Collection();
  }
}

declare global {
  namespace Express {
    interface User {
      discordId?: string;
      message?: string;
      id: number;
    }
  }
}

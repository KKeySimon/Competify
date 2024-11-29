export interface LoginProps {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface Competition {
  userId: number;
  joinedAt: string;
  competitionId: number;
  name: string;
  createdBy: string;
}

export interface ICompetition {
  id: number;
  name: string;
  start_time: Date;
  end_time: Date | undefined;
  days_of_week: number | undefined;
  repeats_every: number;
  frequency: string | undefined;
  user_id: number;
  created_at: string;
  updated_at: string;
  is_numerical: boolean;
  invites: string[];
  users_in_competitions: {
    competition_id: number;
    joined_at: Date;
    user_id: number;
    user: {
      id: number;
      username: string;
      profile_picture_url: string;
    };
  }[];
  priority: string;
  policy: string;
}

export interface Invite {
  inviterId: number;
  inviterName: string;
  inviteeId: number;
  competitionId: number;
  competitionName: string;
  sentAt: string;
}

export interface PopupProps {
  trigger: boolean;
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>;
}
export interface Submission {
  id: number;
  event_id: number;
  user_id: number;
  created_at: string;
  belongs_to: {
    username: string;
  };
  content: string;
  content_number: number;
  vote_count: number;
}

export interface Vote {
  id: number;
  submission_id: number;
  created_at: string;
}

export enum Priority {
  HIGHEST = "HIGHEST",
  LOWEST = "LOWEST",
}

export enum Policy {
  FLAT = "FLAT",
  FLAT_CHANGE = "FLAT_CHANGE",
  PERCENTAGE_CHANGE = "PERCENTAGE_CHANGE",
}

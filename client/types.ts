export interface LoginProps {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface NavbarProps {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export interface Competition {
  userId: number;
  joinedAt: string;
  competitionId: number;
  name: string;
  createdBy: string;
  profilePictureUrl: string;
  createdAt: string;
  upcoming: string[];
  participantCount: number;
}

export interface ICompetition {
  id: number;
  name: string;
  description: string;
  start_time: Date;
  end_time: Date | undefined;
  days_of_week: number | undefined;
  repeats_every: number;
  frequency: string | undefined;
  user_id: number;
  created_at: string;
  updated_at: string;
  is_numerical: boolean;
  users_in_competitions: {
    competition_id: number;
    joined_at: Date;
    user_id: number;
    user: {
      id: number;
      username: string;
      profile_picture_url: string;
    };
    is_admin: boolean;
  }[];
  priority: string;
  policy: string;
  created_by: {
    id: number;
    username: string;
    profile_picture_url: string;
  };
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
    profile_picture_url: string;
  };
  submission_type: string;
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

export enum SubmissionType {
  TEXT = "TEXT",
  URL = "URL",
  IMAGE_URL = "IMAGE_URL",
}

export interface EventResponse {
  event: Event;
  submissions: Submission[];
}

export interface User {
  id: number;
  username: string;
  profile_picture_url: string;
}

export interface UserInCompetition {
  user_id: number;
  competition_id: number;
  joined_at: string;
  user: User;
}

export interface Event {
  date: string;
  is_numerical: boolean;
  priority: string;
  upcoming: boolean;
  winner: {
    username: string;
    profile_picture_url: string;
  };
  belongs_to: {
    name: true;
    id: true;
  };
}

export interface Invite {
  inviter_id: number;
  invitee_id: number;
  invitee: {
    username: string;
    profile_picture_url: string;
    id: number;
  };
}

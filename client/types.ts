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

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

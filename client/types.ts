export interface LoginProps {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface Room {
  userId: number;
  joinedAt: string;
  roomId: number;
  roomName: string;
  createdBy: string;
}

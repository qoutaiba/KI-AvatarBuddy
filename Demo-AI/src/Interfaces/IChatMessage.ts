export interface IChatMessage {
  id: string;             
  sender: 'user' | 'ai';  
  username?: string ;
  text: string;           
  timestamp: Date;       
}


export interface Match {
  id: string;
  teams: string;
  date: string;
  venue: string;
  stadium: string;
}

export interface Booking {
  id: string;
  matchId: string;
  category: 'VIP' | 'Premium' | 'General';
  tickets: number;
  totalPrice: number;
  status: 'Confirmed' | 'Cancelled';
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

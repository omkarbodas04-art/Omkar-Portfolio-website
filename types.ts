
export interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  images?: string[]; // Optional array for slideshows
  year: string;
  brief?: string[];
}

// Fix: Added missing ChatMessage interface required by AIChat.tsx and geminiService.ts
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

import { ConversationStep } from '../types';

export interface SavedConversation {
  id: string;
  name: string;
  description?: string;
  steps: ConversationStep[];
  createdAt: Date;
  updatedAt: Date;
  contact: {
    name: string;
    avatar: string;
  };
}

const STORAGE_KEY = 'whatsapp-saved-conversations';

export const conversationStorage = {
  getAll: (): SavedConversation[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      return JSON.parse(saved, (key, value) => {
        if (key === 'createdAt' || key === 'updatedAt') {
          return new Date(value);
        }
        return value;
      });
    } catch (error) {
      console.error('Error loading saved conversations:', error);
      return [];
    }
  },

  save: (conversation: Omit<SavedConversation, 'id' | 'createdAt' | 'updatedAt'>): SavedConversation => {
    const conversations = conversationStorage.getAll();
    
    const newConversation: SavedConversation = {
      ...conversation,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    conversations.push(newConversation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    
    return newConversation;
  },

  update: (id: string, updates: Partial<SavedConversation>): SavedConversation | null => {
    const conversations = conversationStorage.getAll();
    const index = conversations.findIndex(c => c.id === id);
    
    if (index === -1) return null;
    
    const updated: SavedConversation = {
      ...conversations[index],
      ...updates,
      updatedAt: new Date()
    };
    
    conversations[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    
    return updated;
  },

  delete: (id: string): boolean => {
    const conversations = conversationStorage.getAll();
    const filtered = conversations.filter(c => c.id !== id);
    
    if (filtered.length === conversations.length) return false;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  deleteAll: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
}
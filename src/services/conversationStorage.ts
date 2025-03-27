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

const validateConversation = (conversation: any): conversation is SavedConversation => {
  // Log the conversation being validated
  console.log('Validating conversation:', conversation);

  // Check each required field and log any missing/invalid fields
  const validations = {
    id: typeof conversation.id === 'string',
    name: typeof conversation.name === 'string',
    contact: typeof conversation.contact === 'object',
    contactName: conversation.contact?.name && typeof conversation.contact.name === 'string',
    contactAvatar: conversation.contact?.avatar && typeof conversation.contact.avatar === 'string',
    steps: Array.isArray(conversation.steps),
    createdAt: conversation.createdAt instanceof Date,
    updatedAt: conversation.updatedAt instanceof Date
  };

  // Log which validations failed
  const failedValidations = Object.entries(validations)
    .filter(([_, valid]) => !valid)
    .map(([field]) => field);
  
  if (failedValidations.length > 0) {
    console.warn('Validation failed for fields:', failedValidations);
  }

  return (
    validations.id &&
    validations.name &&
    validations.contact &&
    validations.contactName &&
    validations.contactAvatar &&
    validations.steps &&
    validations.createdAt &&
    validations.updatedAt
  );
};

export const conversationStorage = {
  getAll: (): SavedConversation[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      console.log('Raw saved conversations from localStorage:', saved); // Debug log
      if (!saved) return [];
      const parsed = JSON.parse(saved, (key, value) => {
        if (key === 'createdAt' || key === 'updatedAt') {
          return new Date(value);
        }
        return value;
      });
      console.log('Parsed saved conversations:', parsed); // Debug log

      // Validate each conversation
      const validConversations = parsed.filter(validateConversation);
      console.log('Valid conversations:', validConversations); // Debug log

      return validConversations;
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
  },

  exportConversations: (): string => {
    const conversations = conversationStorage.getAll();
    if (conversations.length === 0) {
      throw new Error('No conversations available to export.');
    }
    return JSON.stringify(conversations, null, 2);
  },

  importConversations: (jsonString: string): { success: boolean; error?: string } => {
    try {
      if (!jsonString.trim()) {
        throw new Error('The file is empty.');
      }

      console.log('Importing JSON string:', jsonString);

      let importedConversations;
      try {
        importedConversations = JSON.parse(jsonString);
        console.log('Parsed conversations:', importedConversations);
      } catch (parseError) {
        throw new Error(`Invalid JSON format: ${(parseError as Error).message}`);
      }

      if (!Array.isArray(importedConversations)) {
        console.error('Imported data is not an array:', importedConversations);
        throw new Error('Invalid format: Expected an array of conversations.');
      }

      // Convert date strings to Date objects
      const conversationsWithDates = importedConversations.map(conv => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt)
      }));

      console.log('Conversations with parsed dates:', conversationsWithDates);

      const validConversations = conversationsWithDates.filter((conv, index) => {
        const isValid = validateConversation(conv);
        if (!isValid) {
          console.warn(`Conversation at index ${index} is invalid:`, conv);
        }
        return isValid;
      });

      console.log('Valid conversations:', validConversations);

      if (validConversations.length === 0) {
        throw new Error('No valid conversations found in the file.');
      }

      const existingConversations = conversationStorage.getAll();
      console.log('Existing conversations:', existingConversations);

      const mergedConversations = [
        ...existingConversations,
        ...validConversations.filter(
          (newConv) => !existingConversations.some((existingConv) => existingConv.id === newConv.id)
        )
      ];

      console.log('Final merged conversations:', mergedConversations);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedConversations));
      
      // Verify that the data was actually saved
      const savedData = localStorage.getItem(STORAGE_KEY);
      const savedConversations = savedData ? JSON.parse(savedData) : [];
      console.log('Verified saved conversations:', savedConversations);

      if (savedConversations.length === 0) {
        throw new Error('Failed to save conversations to localStorage');
      }

      return { 
        success: true,
        error: validConversations.length < importedConversations.length 
          ? `Imported ${validConversations.length} of ${importedConversations.length} conversations` 
          : undefined
      };
    } catch (error) {
      console.error('Error importing conversations:', error);
      return { success: false, error: (error as Error).message };
    }
  }
};
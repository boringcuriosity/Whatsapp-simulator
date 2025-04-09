export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';
export type ContactStatus = 'online' | 'offline' | 'typing';
export type MessageType = 'text' | 'button' | 'interactive' | 'image';

export interface MessageButton {
  text: string;
  url?: string;
  openInWebView: boolean;
}

export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: Date;
  status: MessageStatus;
  type?: MessageType;
  buttonText?: string;
  isBusinessMessage?: boolean;
  delay?: number; // Delay in milliseconds before showing this message
  link?: string; // Add link property for button URLs
  openLinkInWebView?: boolean; // Made explicit that this is a boolean
  imageUrl?: string;
  caption?: string;
}

export interface Contact {
  name: string;
  avatar: string;
  status: ContactStatus;
  lastSeen: Date;
}

export interface ConversationStep {
  text: string;
  sender: 'me' | 'them';
  type?: MessageType;
  isBusinessMessage?: boolean;
  buttonText?: string;
  options?: string[];
  delay?: number; // Delay in milliseconds before showing this message
  highlightedText?: string;
  link?: string; // Add link property for button URLs
  openLinkInWebView?: boolean; // Option to control whether links open in web view or new tab
  imageUrl?: string;
  caption?: string;
  buttons?: MessageButton[]; // Array of buttons attached to this message
}

export interface SavedConversation {
  id: string;
  name: string;
  description?: string;
  contact: Contact;
  steps: ConversationStep[];
}
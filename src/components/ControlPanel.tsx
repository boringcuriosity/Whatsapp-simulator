import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { Copy, Trash2, ArrowUp, ArrowDown, PlusCircle, Image, MessageSquare, Clock, UserCircle, Edit3, FileJson, Bookmark, Info, MousePointer2, LayoutTemplate, ChevronDown, ChevronUp, X } from 'lucide-react'
import { Message, Contact, MessageStatus, ContactStatus, ConversationStep, MessageButton, MessageType } from '../types'
import PhonePreview from './PhonePreview'
import SavedConversations from './SavedConversations'
import { SavedConversation } from '../services/conversationStorage'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  position: relative;

  @media (max-width: 768px) {
    gap: 16px;
    padding-bottom: 60px;
  }
`

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 768px) {
    gap: 12px;
  }
`

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
  justify-content: space-between;

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 4px;
    padding-bottom: 4px;
  }
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
`

const Input = styled.input`
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: var(--whatsapp-green);
  }
`

const Select = styled.select`
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: var(--whatsapp-green);
  }
`

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--whatsapp-green);
  }
`

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' | 'link' }>`
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  background-color: ${props => {
    if (props.variant === 'primary') return 'var(--whatsapp-green)';
    if (props.variant === 'danger') return '#f44336';
    if (props.variant === 'link') return 'transparent';
    return '#f0f2f5';
  }};
  
  color: ${props => {
    if (props.variant === 'primary' || props.variant === 'danger') return 'white';
    if (props.variant === 'link') return 'var(--whatsapp-blue)';
    return 'var(--text-primary)';
  }};
  
  border: ${props => props.variant === 'link' ? 'none' : '1px solid transparent'};
  text-decoration: ${props => props.variant === 'link' ? 'underline' : 'none'};
  
  &:hover {
    opacity: 0.9;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
    
    button {
      width: 100%;
    }
  }
`

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
`

const MessageItem = styled.div<{ sender: 'me' | 'them' }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  background-color: ${props => props.sender === 'me' ? 'rgba(37, 211, 102, 0.1)' : 'rgba(52, 183, 241, 0.1)'};
`

const MessageContent = styled.div`
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const MessageActions = styled.div`
  display: flex;
  gap: 8px;
`

const Collapsible = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 8px;
  position: absolute;
  top: 42px;
  left: 0;
  width: 300px;
  z-index: 50;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  
  &.open {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    width: 90%;
    left: 5%;
  }
`

const CollapsibleHeader = styled.div`
  padding: 12px;
  background-color: #f0f2f5;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  border-radius: 8px 8px 0 0;
  z-index: 5;
  position: relative;
`

const CollapsibleContent = styled.div<{ isOpen: boolean }>`
  padding: ${props => props.isOpen ? '16px' : '0'};
  height: ${props => props.isOpen ? 'auto' : '0'};
  opacity: ${props => props.isOpen ? '1' : '0'};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  background-color: white;
  border-radius: 0 0 8px 8px;
  box-shadow: ${props => props.isOpen ? '0 4px 8px rgba(0, 0, 0, 0.1)' : 'none'};
  z-index: 4;
  position: ${props => props.isOpen ? 'absolute' : 'static'};
  width: 100%;
`

const ContactSettingsButton = styled.button`
  background: #f0f2f5;
  border: 1px solid var(--border-color);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  margin-right: 12px;
  
  &:hover {
    background: #e4e6eb;
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`

const ErrorMessage = styled.div`
  color: #f44336;
  font-size: 14px;
  margin-top: 8px;
  padding: 8px;
  background-color: rgba(244, 67, 54, 0.1);
  border-radius: 4px;
  border-left: 3px solid #f44336;
`

const ConversationStepForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 12px;
`

const StepHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;

    div:last-child {
      width: 100%;
      justify-content: space-between;
    }
  }
`

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
`

const StepForm = styled(ConversationStepForm)`
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
  margin: 0 0 16px 0;
  padding: 16px;
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  scroll-margin: 20px;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    padding: 12px;
    margin: 0 0 12px 0;
  }
`

const StepIndexBadge = styled.div`
  background-color: var(--whatsapp-teal);
  color: white;
  font-size: 13px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 12px;
  margin-right: 10px;
  min-width: 30px;
  text-align: center;
`

const QuickActionsBar = styled.div`
  margin-bottom: 24px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background-color: #f9f9f9;
  overflow: hidden;
`;

const QuickActionsHeader = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 12px 16px;
  background-color: rgba(18, 140, 126, 0.08);
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  
  h3 {
    font-size: 15px;
    font-weight: 500;
    margin: 0;
    color: var(--whatsapp-teal);
    display: flex;
    align-items: center;
    gap: 8px;
    margin-right: auto;
  }
`;

const QuickActionsContent = styled.div<{ isOpen: boolean }>`
  padding: ${props => props.isOpen ? '16px' : '0'};
  height: ${props => props.isOpen ? 'auto' : '0'};
  opacity: ${props => props.isOpen ? '1' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TemplateCard = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--whatsapp-teal);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;

const TemplateHeader = styled.div`
  padding: 12px;
  background-color: rgba(18, 140, 126, 0.06);
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: var(--whatsapp-teal);
  }
  
  h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
  }
`;

const TemplatePreview = styled.div`
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  p {
    margin: 0 0 12px 0;
    font-size: 13px;
    color: #666;
  }
`;

const PreviewBubble = styled.div<{ isUser?: boolean }>`
  background-color: ${props => props.isUser ? 'rgba(37, 211, 102, 0.1)' : '#fff'};
  border: 1px solid ${props => props.isUser ? 'rgba(37, 211, 102, 0.2)' : '#e0e0e0'};
  padding: 8px 12px;
  border-radius: 12px;
  border-top-${props => props.isUser ? 'right' : 'left'}-radius: 3px;
  font-size: 13px;
  margin-bottom: 4px;
  max-width: 80%;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
`;

const TemplatePreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px;
  background-color: rgba(0,0,0,0.02);
  border-radius: 8px;
  margin-bottom: 10px;
`;

const ButtonPreview = styled.div`
  background-color: #fff;
  border: 1px solid #e0e0e0;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  display: inline-block;
  margin-top: 4px;
  color: var(--whatsapp-teal);
  font-weight: 500;
`;

const AddTemplateButton = styled.button`
  padding: 8px 12px;
  background-color: var(--whatsapp-teal);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
  
  &:hover {
    background-color: #0e8c7e;
    transform: translateY(-2px);
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const EditorTabs = styled.div`
  display: inline-flex;
  position: relative;
  gap: 0;
  margin-left: auto;
  border-radius: 20px;
  background: #f0f2f5;
  padding: 3px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  max-width: fit-content;
  z-index: 5;
`

const EditorTab = styled.button<{ active: boolean }>`
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  background-color: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? 'var(--whatsapp-teal)' : 'var(--text-secondary)'};
  border: none;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: ${props => props.active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? 'white' : 'rgba(255,255,255,0.5)'};
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
  
  @media (max-width: 768px) {
    padding: 6px;
    
    span {
      display: none;
    }
    
    svg {
      margin: 0;
    }
  }
`

const ActionBar = styled.div`
  display: flex;
  position: sticky;
  bottom: 0;
  padding: 16px;
  background: white;
  border-top: 1px solid var(--border-color);
  gap: 8px;
  margin-top: 16px;
  z-index: 10;
  justify-content: space-between;

  @media (max-width: 768px) {
    padding: 12px;
    flex-direction: column;
    gap: 8px;

    button {
      width: 100%;
    }
  }
`

const ActionButton = styled(Button)`
  transition: all 0.2s ease;
  min-width: 120px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 2px dashed var(--border-color);
  margin: 20px 0;
  text-align: center;
`

const PreviewOverlay = styled.div<{ show: boolean }>`
  display: ${props => props.show ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;

  @media (max-width: 768px) {
    padding: 0;
  }
`

const PreviewContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;

  @media (max-width: 768px) {
    height: 100%;
    padding: 16px;
    border-radius: 0;
    overflow-y: auto;
  }
`

const ConversationFlowContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: #f9f9f9;
`

const ConversationTextArea = styled.textarea`
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  min-height: 200px;
  resize: vertical;
  font-family: monospace;
  
  &:focus {
    outline: none;
    border-color: var(--whatsapp-green);
  }
`

const IconButton = styled(Button)`
  width: 32px;
  height: 32px;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  &:hover {
    background: ${props => props.variant === 'danger' ? '#ffebee' : '#e3f2fd'};
    color: ${props => props.variant === 'danger' ? '#f44336' : '#2196f3'};
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`

const StepFormContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`

const MessageSenderToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 4px;
  background: #f5f5f5;
  border-radius: 20px;
  width: fit-content;
  
  svg {
    margin: 0 4px;
  }
`

const SenderOption = styled.button<{ active: boolean }>`
  padding: 6px 12px;
  border-radius: 16px;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? 'var(--whatsapp-teal)' : 'var(--text-primary)'};
  border: none;
  font-size: 13px;
  font-weight: ${props => props.active ? '500' : 'normal'};
  cursor: pointer;
  box-shadow: ${props => props.active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};
  
  &:hover {
    background: ${props => props.active ? 'white' : 'rgba(255,255,255,0.5)'};
  }
`

const AttachmentOptions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const AttachmentButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid ${props => props.active ? 'var(--whatsapp-teal)' : 'var(--border-color)'};
  background: ${props => props.active ? 'rgba(37, 211, 102, 0.1)' : '#f5f5f5'};
  color: ${props => props.active ? 'var(--whatsapp-teal)' : 'var(--text-primary)'};
  font-size: 13px;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.active ? 'rgba(37, 211, 102, 0.15)' : '#ebebeb'};
    transform: translateY(-1px);
  }
`

const ImageSection = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eee;
`

const ImagePreview = styled.div`
  position: relative;
  margin: 16px 0;
  
  img {
    width: 100%;
    max-width: 300px;
    border-radius: 8px;
    display: block;
  }
`

const ImageUploadButton = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f0f2f5;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-primary);
  border: 1px dashed var(--border-color);
  transition: all 0.2s;
  
  &:hover {
    background: #e8eaed;
  }
  
  input[type="file"] {
    display: none;
  }
`

const RemoveImageButton = styled(IconButton)`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  
  &:hover {
    background: rgba(244, 67, 54, 0.8);
    color: white;
  }
`

const ButtonSection = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eee;
`

const ButtonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
`

const ButtonItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  background: white;
  border-radius: 6px;
  border: 1px solid #eee;
`

const ButtonCount = styled.div`
  width: 24px;
  height: 24px;
  background: var(--whatsapp-teal);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
`

const DelaySelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 13px;
`

const DelayOption = styled.button<{ active: boolean }>`
  padding: 4px 8px;
  border-radius: 12px;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? 'var(--whatsapp-teal)' : 'var(--text-secondary)'};
  border: 1px solid ${props => props.active ? 'var(--whatsapp-teal)' : 'transparent'};
  font-size: 12px;
  font-weight: ${props => props.active ? '500' : 'normal'};
  cursor: pointer;
  
  &:hover {
    background: ${props => props.active ? 'white' : 'rgba(255,255,255,0.5)'};
  }
`

const ToggleButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: var(--whatsapp-teal);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`

const STEP_TEMPLATES = [
  {
    name: 'Question with Yes/No',
    description: 'Ask a question with two predefined options for quick response',
    icon: <MessageSquare size={18} />,
    template: {
      text: 'Do you want to proceed with this option?',
      sender: 'them' as const,
      delay: 1000,
      isBusinessMessage: true,
      type: 'text' as MessageType,
    },
    buttons: ['Yes', 'No']
  },
  {
    name: 'Information Message',
    description: 'Send an informational message to share important details',
    icon: <Info size={18} />,
    template: {
      text: 'Here is some important information you should know.',
      sender: 'them' as const,
      delay: 1500,
      type: 'text' as MessageType,
    }
  },
  {
    name: 'Action Button',
    description: 'Include a clickable button to direct users to take action',
    icon: <MousePointer2 size={18} />,
    template: {
      text: 'Click the button below to continue',
      sender: 'them' as const,
      delay: 1000,
      isBusinessMessage: true,
      type: 'text' as MessageType,
    },
    buttons: ['Click here']
  }
];

type EditorMode = 'visual' | 'json' | 'saved';

interface ControlPanelProps {
  contact: Contact;
  messages: Message[];
  onUpdateContact: (contact: Partial<Contact>) => void;
  onAddMessage: (message: Omit<Message, 'id' | 'timestamp' | 'status'>) => void;
  onUpdateMessage: (id: string, updates: Partial<Message>) => void;
  onDeleteMessage: (id: string) => void;
  onClearMessages: () => void;
  onStartConversation: (steps: ConversationStep[]) => void;
  contactSettingsOpen: boolean;
  setContactSettingsOpen: (open: boolean) => void;
  messageType: 'text' | 'business' | 'conversation';
  setMessageType: (type: 'text' | 'business' | 'conversation') => void;
  conversationFlow: string;
  setConversationFlow: (flow: string) => void;
  steps: ConversationStep[];
  setSteps: (steps: ConversationStep[]) => void;
  showJsonPreview: boolean;
  setShowJsonPreview: (show: boolean) => void;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  previewMessages: Message[];
  setPreviewMessages: (messages: Message[]) => void;
  conversationError: string;
  setConversationError: (error: string) => void;
  savedConversations: SavedConversation[];
  onLoadSavedConversation: (conversation: SavedConversation) => void;
  onDeleteSavedConversation: (id: string) => void;
  onSaveCurrentConversation: () => void;
  isControlPanelCollapsed?: boolean;
  setIsControlPanelCollapsed?: (collapsed: boolean) => void;
}

const ControlPanel = ({
  contact,
  messages,
  onUpdateContact,
  onUpdateMessage,
  onDeleteMessage,
  onClearMessages,
  onStartConversation,
  messageType,
  setMessageType,
  conversationFlow,
  setConversationFlow,
  steps,
  setSteps,
  showPreview,
  setShowPreview,
  previewMessages,
  setPreviewMessages,
  conversationError,
  setConversationError,
  savedConversations,
  onLoadSavedConversation,
  onDeleteSavedConversation,
  onSaveCurrentConversation,
  setIsControlPanelCollapsed
}: ControlPanelProps) => {
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [linkOpeningBehavior] = useState<'webview' | 'newtab'>('webview');
  const [editorMode, setEditorMode] = useState<EditorMode>('visual');
  const [showTemplates, setShowTemplates] = useState(false);
  const [contactSettingsVisible, setContactSettingsVisible] = useState(false);
  const contactSettingsRef = useRef<HTMLDivElement>(null);
  const contactButtonRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contactSettingsRef.current &&
          !contactSettingsRef.current.contains(event.target as Node) && 
          contactButtonRef.current && 
          !contactButtonRef.current.contains(event.target as Node)) {
        setContactSettingsVisible(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    if (messageType !== 'conversation') {
      setMessageType('conversation');
    }
  }, [messageType, setMessageType]);

  const updateStep = (index: number, updates: Partial<ConversationStep>) => {
    setSteps(steps.map((step, i) => 
      i === index ? { 
        ...step, 
        ...updates,
        ...(updates.link && typeof updates.openLinkInWebView === 'undefined' ? 
          { openLinkInWebView: linkOpeningBehavior === 'webview' } : {})
      } : step
    ));
  };

  const addButtonToMessage = (stepIndex: number, buttonText: string = '', url: string = '') => {
    const step = steps[stepIndex];
    if (!step) return;
    
    const buttons = step.buttons || [];
    
    if (buttons.length >= 5) {
      alert("Maximum 5 buttons allowed per message");
      return;
    }
    
    const updatedButtons = [
      ...buttons,
      { text: buttonText, url, openInWebView: true }
    ];
    
    updateStep(stepIndex, { buttons: updatedButtons });
  };
  
  const updateMessageButton = (
    stepIndex: number, 
    buttonIndex: number, 
    updates: Partial<MessageButton>
  ) => {
    const step = steps[stepIndex];
    if (!step || !step.buttons) return;
    
    const updatedButtons = step.buttons.map((btn, idx) => 
      idx === buttonIndex ? { ...btn, ...updates } : btn
    );
    
    updateStep(stepIndex, { buttons: updatedButtons });
  };
  
  const removeButtonFromMessage = (stepIndex: number, buttonIndex: number) => {
    const step = steps[stepIndex];
    if (!step || !step.buttons) return;
    
    const updatedButtons = step.buttons.filter((_, idx) => idx !== buttonIndex);
    
    updateStep(stepIndex, { buttons: updatedButtons.length > 0 ? updatedButtons : undefined });
  };
  
  const toggleImageOnMessage = (stepIndex: number) => {
    const step = steps[stepIndex];
    if (!step) return;
    
    if (step.imageUrl) {
      updateStep(stepIndex, { 
        imageUrl: undefined, 
        caption: undefined 
      });
      return;
    }
    
    updateStep(stepIndex, { 
      imageUrl: '', 
      caption: ''
    });
  };
  
  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const addStepBySender = (sender: 'me' | 'them') => {
    const newStepIndex = steps.length;
    const newSteps = [...steps, {
      text: '',
      sender,
      delay: 1000,
      type: 'text' as MessageType,
      isBusinessMessage: sender === 'them'
    }];
    setSteps(newSteps);
    setTimeout(() => {
      if (stepRefs.current[newStepIndex] && stepRefs.current[newStepIndex] !== null) {
        stepRefs.current[newStepIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
  };

  const handleFormSubmit = () => {
    if (steps.length === 0) {
      setConversationError('Please add at least one step to the conversation');
      return;
    }
    
    const processedSteps = processStepsForConversation(steps);
    onStartConversation(processedSteps);
    setConversationError('');
  };

  const processStepsForConversation = (stepsToProcess: ConversationStep[]): ConversationStep[] => {
    const processedSteps: ConversationStep[] = [];
    
    stepsToProcess.forEach(step => {
      const { buttons, ...mainStep } = step;
      
      const processedStep: ConversationStep = {
        ...mainStep,
        type: mainStep.imageUrl ? ('image' as MessageType) : (mainStep.type || ('text' as MessageType))
      };
      
      processedSteps.push(processedStep);
      
      if (buttons && buttons.length > 0) {
        buttons.forEach(button => {
          processedSteps.push({
            text: button.text,
            sender: step.sender,
            type: 'button' as MessageType,
            buttonText: button.text,
            isBusinessMessage: true,
            delay: 0,
            link: button.url,
            openLinkInWebView: button.openInWebView
          });
        });
      }
    });
    
    return processedSteps;
  };

  const handleTemplateAdd = (template: typeof STEP_TEMPLATES[number]) => {
    const mainMessage: ConversationStep = {
      ...template.template,
      text: template.template.text
    };
    
    if (template.buttons) {
      mainMessage.buttons = template.buttons.map(text => ({
        text,
        openInWebView: true
      }));
    }
    
    setSteps([...steps, mainMessage]);
  };

  const duplicateStep = (index: number) => {
    const newSteps = [...steps];
    const duplicatedStep = { ...newSteps[index] };
    newSteps.splice(index + 1, 0, duplicatedStep);
    setSteps(newSteps);
  };

  const handlePreview = () => {
    if (steps.length === 0) {
      setConversationError('Add some steps to preview the conversation');
      return;
    }
    
    const previewMsgs = processStepsForPreview(steps);
    setPreviewMessages(previewMsgs);
    setShowPreview(true);
  };
  
  const processStepsForPreview = (stepsToPreview: ConversationStep[]): Message[] => {
    const previewMsgs: Message[] = [];
    
    stepsToPreview.forEach((step, index) => {
      const mainMessage: Message = {
        id: `preview-${index}`,
        timestamp: new Date(),
        status: 'sent',
        text: step.text,
        sender: step.sender,
        type: step.imageUrl ? ('image' as MessageType) : (step.type || ('text' as MessageType)),
        isBusinessMessage: step.sender === 'them' && (step.isBusinessMessage !== false),
        imageUrl: step.imageUrl,
        caption: step.caption
      };
      
      previewMsgs.push(mainMessage);
      
      if (step.buttons && step.buttons.length > 0) {
        step.buttons.forEach((button, btnIndex) => {
          const buttonMessage: Message = {
            id: `preview-${index}-btn-${btnIndex}`,
            timestamp: new Date(),
            status: 'sent',
            text: button.text,
            buttonText: button.text,
            sender: step.sender,
            type: 'button' as MessageType,
            isBusinessMessage: true,
            link: button.url,
            openLinkInWebView: button.openInWebView
          };
          
          previewMsgs.push(buttonMessage);
        });
      }
    });
    
    return previewMsgs;
  };

  const handleSwitchToVisualView = () => {
    try {
      const parsed = JSON.parse(conversationFlow);
      setSteps(parsed);
      setConversationError('');
    } catch (error) {
      setConversationError('Invalid JSON format - please fix before switching views');
      return;
    }
  };

  const handleSwitchToJsonView = () => {
    setConversationFlow(JSON.stringify(steps, null, 2));
  };

  const moveStepUp = (index: number) => {
    if (index === 0) return;
    const newSteps = [...steps];
    [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
    setSteps(newSteps);
  };

  const moveStepDown = (index: number) => {
    if (index === steps.length - 1) return;
    const newSteps = [...steps];
    [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
    setSteps(newSteps);
  };

  return (
    <Container>
      <Section>
        <SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'relative', marginRight: '16px' }}>
              <ContactSettingsButton 
                ref={contactButtonRef}
                onClick={() => setContactSettingsVisible(!contactSettingsVisible)}
                title="Contact Settings"
              >
                <img src="/edit_profile.svg" alt="Contact Settings" width="22" height="22" />
              </ContactSettingsButton>
              
              <Collapsible ref={contactSettingsRef} className={contactSettingsVisible ? 'open' : ''}>
                <CollapsibleHeader>
                  Contact Settings
                  <IconButton onClick={() => setContactSettingsVisible(false)}>
                    <X size={16} />
                  </IconButton>
                </CollapsibleHeader>
                <CollapsibleContent isOpen={true}>
                  <FormGroup>
                    <Label htmlFor="contactName">Name</Label>
                    <Input
                      id="contactName"
                      value={contact.name}
                      onChange={(e) => onUpdateContact({ name: e.target.value })}
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label htmlFor="contactAvatar">Avatar URL</Label>
                    <Input
                      id="contactAvatar"
                      value={contact.avatar}
                      onChange={(e) => onUpdateContact({ avatar: e.target.value })}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label htmlFor="contactStatus">Status</Label>
                    <Select
                      id="contactStatus"
                      value={contact.status}
                      onChange={(e) => onUpdateContact({ status: e.target.value as ContactStatus })}
                    >
                      <option value="online">Online</option>
                      <option value="typing">Typing...</option>
                      <option value="offline">Offline</option>
                    </Select>
                  </FormGroup>
                </CollapsibleContent>
              </Collapsible>
            </div>
            WhatsApp chat simulator
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <EditorTabs>
              <EditorTab 
                active={editorMode === 'visual'} 
                onClick={() => {
                  if (editorMode === 'json') {
                    handleSwitchToVisualView();
                  }
                  setEditorMode('visual');
                }}
                title="Visual Editor"
              >
                <Edit3 size={14} />
                <span>Visual</span>
              </EditorTab>
              <EditorTab 
                active={editorMode === 'json'} 
                onClick={() => {
                  handleSwitchToJsonView();
                  setEditorMode('json');
                }}
                title="JSON Editor"
              >
                <FileJson size={14} />
                <span>JSON</span>
              </EditorTab>
              <EditorTab
                active={editorMode === 'saved'}
                onClick={() => setEditorMode('saved')}
                title="Saved Conversations"
              >
                <Bookmark size={14} />
                <span>Saved</span>
              </EditorTab>
            </EditorTabs>
            
            {setIsControlPanelCollapsed && (
              <ToggleButton 
                onClick={() => setIsControlPanelCollapsed(true)}
                title="Hide panel"
                style={{ marginLeft: '8px' }}
              >
                <img 
                  src="/sidebar_icon.svg" 
                  alt="Hide panel" 
                  width="18" 
                  height="18"
                />
              </ToggleButton>
            )}
          </div>
        </SectionTitle>
        
        {editorMode === 'visual' && (
          <QuickActionsBar>
            <QuickActionsHeader onClick={() => setShowTemplates(!showTemplates)}>
              <h3>
                <LayoutTemplate size={16} />
                Message Templates
              </h3>
              {showTemplates ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </QuickActionsHeader>
            <QuickActionsContent isOpen={showTemplates}>
              <TemplateGrid>
                {STEP_TEMPLATES.map((template, index) => (
                  <TemplateCard key={index}>
                    <TemplateHeader>
                      {template.icon}
                      <h4>{template.name}</h4>
                    </TemplateHeader>
                    <TemplatePreview>
                      <p>{template.description}</p>
                      <TemplatePreviewContainer>
                        <PreviewBubble>
                          {template.template.text}
                        </PreviewBubble>
                        {template.buttons && template.buttons.map((btn, i) => (
                          <ButtonPreview key={i}>{btn}</ButtonPreview>
                        ))}
                      </TemplatePreviewContainer>
                      <AddTemplateButton onClick={() => handleTemplateAdd(template)}>
                        <PlusCircle size={14} />
                        Add to Conversation
                      </AddTemplateButton>
                    </TemplatePreview>
                  </TemplateCard>
                ))}
              </TemplateGrid>
            </QuickActionsContent>
          </QuickActionsBar>
        )}
        
        <ConversationFlowContainer>
          {editorMode === 'saved' ? (
            <SavedConversations
              conversations={savedConversations}
              onSelect={onLoadSavedConversation}
              onDelete={onDeleteSavedConversation}
              onSaveCurrent={onSaveCurrentConversation}
            />
          ) : editorMode === 'json' ? (
            <FormGroup>
              <Label>JSON Editor</Label>
              <ConversationTextArea
                value={conversationFlow}
                onChange={(e) => {
                  setConversationFlow(e.target.value);
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setSteps(parsed);
                    setConversationError('');
                  } catch (error) {
                    setConversationError('Invalid JSON format');
                  }
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                {conversationError && <ErrorMessage>{conversationError}</ErrorMessage>}
                <ActionButton 
                  variant="primary" 
                  onClick={handleFormSubmit}
                  style={{ marginLeft: 'auto' }}
                  disabled={!!conversationError}
                >
                  Start Conversation
                </ActionButton>
              </div>
            </FormGroup>
          ) : (
            <>
              {steps.length === 0 ? (
                <EmptyState>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                  <h3>Create your WhatsApp conversation</h3>
                  <p style={{ margin: '8px 0 24px 0', color: 'var(--text-secondary)' }}>
                    Start by adding your first message:
                  </p>
                  <ButtonGroup>
                    <ActionButton variant="secondary" onClick={() => addStepBySender('them')}>
                      Add Message from {contact.name}
                    </ActionButton>
                    <ActionButton variant="secondary" onClick={() => addStepBySender('me')}>
                      Add My Message
                    </ActionButton>
                  </ButtonGroup>
                </EmptyState>
              ) : (
                <StepsContainer className="steps-container">
                  {steps.map((step, index) => (
                    <StepForm 
                      key={index}
                      ref={(el: HTMLDivElement | null) => {
                        stepRefs.current[index] = el;
                      }}
                    >
                      <StepHeader>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <StepIndexBadge>{index + 1}</StepIndexBadge>
                          {step.type === 'button' ? 'Button' : 'Message'}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <IconButton 
                            onClick={() => moveStepUp(index)}
                            title="Move Up"
                            disabled={index === 0}
                          >
                            <ArrowUp />
                          </IconButton>
                          <IconButton 
                            onClick={() => moveStepDown(index)}
                            title="Move Down"
                            disabled={index === steps.length - 1}
                          >
                            <ArrowDown />
                          </IconButton>
                          <IconButton 
                            onClick={() => duplicateStep(index)}
                            title="Duplicate"
                          >
                            <Copy />
                          </IconButton>
                          <IconButton 
                            variant="danger" 
                            onClick={() => removeStep(index)}
                            title="Delete"
                          >
                            <Trash2 />
                          </IconButton>
                        </div>
                      </StepHeader>
                      
                      <StepFormContent>
                        <MessageSenderToggle>
                          <UserCircle size={14} />
                          <SenderOption 
                            active={step.sender === 'me'}
                            onClick={() => updateStep(index, { sender: 'me' })}
                          >
                            Me
                          </SenderOption>
                          <SenderOption 
                            active={step.sender === 'them'} 
                            onClick={() => updateStep(index, { sender: 'them' })}
                          >
                            {contact.name}
                          </SenderOption>
                        </MessageSenderToggle>
                        
                        <FormGroup>
                          <Label>Message</Label>
                          <TextArea
                            value={step.text}
                            onChange={(e) => updateStep(index, { text: e.target.value })}
                            placeholder="Enter your message text here..."
                            style={{ minHeight: '100px' }}
                          />
                        </FormGroup>

                        <AttachmentOptions>
                          <AttachmentButton 
                            onClick={() => toggleImageOnMessage(index)}
                            active={!!step.imageUrl}
                          >
                            <Image size={16} /> 
                            {step.imageUrl ? 'Remove Image' : 'Add Image'}
                          </AttachmentButton>
                          
                          <AttachmentButton
                            onClick={() => addButtonToMessage(index)}
                            active={step.buttons && step.buttons.length > 0}
                          >
                            <PlusCircle size={16} /> 
                            Add Button {step.buttons ? `(${step.buttons.length}/5)` : '(0/5)'}
                          </AttachmentButton>
                        </AttachmentOptions>
                        
                        {step.imageUrl !== undefined && (
                          <ImageSection>
                            <Label>Image</Label>
                            <ImageUploadButton>
                              <span>{step.imageUrl ? 'Change Image' : 'Upload Image'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      updateStep(index, { 
                                        imageUrl: event.target?.result as string,
                                        caption: step.text
                                      });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </ImageUploadButton>
                            
                            {step.imageUrl && (
                              <ImagePreview>
                                <img src={step.imageUrl} alt="Preview" />
                                <RemoveImageButton
                                  variant="danger"
                                  onClick={() => updateStep(index, { imageUrl: undefined })}
                                  title="Remove Image"
                                >
                                  ✕
                                </RemoveImageButton>
                              </ImagePreview>
                            )}
                            
                            <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                              <i>The message text above will be used as the image caption</i>
                            </div>
                          </ImageSection>
                        )}
                        
                        {step.buttons && step.buttons.length > 0 && (
                          <ButtonSection>
                            <Label>Buttons</Label>
                            <ButtonList>
                              {step.buttons.map((button, btnIndex) => (
                                <ButtonItem key={btnIndex}>
                                  <ButtonCount>{btnIndex + 1}</ButtonCount>
                                  <div style={{ flex: 1 }}>
                                    <Input
                                      placeholder="Button text"
                                      value={button.text}
                                      onChange={(e) => updateMessageButton(
                                        index,
                                        btnIndex,
                                        { text: e.target.value }
                                      )}
                                      style={{ marginBottom: '8px' }}
                                    />
                                    <Input
                                      placeholder="URL (optional)"
                                      value={button.url || ''}
                                      onChange={(e) => updateMessageButton(
                                        index,
                                        btnIndex,
                                        { url: e.target.value }
                                      )}
                                    />
                                    
                                    {button.url && (
                                      <div style={{ 
                                        marginTop: '8px', 
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        gap: '6px',
                                        fontSize: '13px',
                                        padding: '8px 0'
                                      }}>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>Link opens in:</div>
                                        <div style={{ 
                                          display: 'flex', 
                                          width: '100%',
                                          gap: '8px'
                                        }}>
                                          <label style={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            flex: 1,
                                            padding: '5px 8px',
                                            borderRadius: '4px',
                                            backgroundColor: button.openInWebView === true ? 'rgba(18, 140, 126, 0.08)' : 'transparent',
                                            border: button.openInWebView === true ? '1px solid var(--whatsapp-teal)' : '1px solid #e0e0e0',
                                            transition: 'all 0.2s ease'
                                          }}>
                                            <input
                                              type="radio"
                                              checked={button.openInWebView === true}
                                              onChange={() => updateMessageButton(
                                                index,
                                                btnIndex,
                                                { openInWebView: true }
                                              )}
                                              style={{ 
                                                marginRight: '6px', 
                                                cursor: 'pointer',
                                                width: '14px',
                                                height: '14px'
                                              }}
                                            />
                                            <span style={{ 
                                              color: button.openInWebView === true ? 'var(--whatsapp-teal)' : 'inherit',
                                              fontWeight: button.openInWebView === true ? '500' : 'normal',
                                              fontSize: '12px'
                                            }}>WhatsApp</span>
                                          </label>
                                          <label style={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            flex: 1,
                                            padding: '5px 8px',
                                            borderRadius: '4px',
                                            backgroundColor: button.openInWebView === false ? 'rgba(18, 140, 126, 0.08)' : 'transparent',
                                            border: button.openInWebView === false ? '1px solid var(--whatsapp-teal)' : '1px solid #e0e0e0',
                                            transition: 'all 0.2s ease'
                                          }}>
                                            <input
                                              type="radio"
                                              checked={button.openInWebView === false}
                                              onChange={() => updateMessageButton(
                                                index,
                                                btnIndex,
                                                { openInWebView: false }
                                              )}
                                              style={{ 
                                                marginRight: '6px', 
                                                cursor: 'pointer',
                                                width: '14px',
                                                height: '14px'
                                              }}
                                            />
                                            <span style={{ 
                                              color: button.openInWebView === false ? 'var(--whatsapp-teal)' : 'inherit',
                                              fontWeight: button.openInWebView === false ? '500' : 'normal',
                                              fontSize: '12px'
                                            }}>New Tab</span>
                                          </label>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <IconButton
                                    variant="danger"
                                    onClick={() => removeButtonFromMessage(index, btnIndex)}
                                  >
                                    <Trash2 size={16} />
                                  </IconButton>
                                </ButtonItem>
                              ))}
                            </ButtonList>
                            
                            {step.buttons.length < 5 && (
                              <div style={{ marginTop: '12px', textAlign: 'right' }}>
                                <Button 
                                  onClick={() => addButtonToMessage(index)}
                                  variant="secondary"
                                >
                                  Add Another Button
                                </Button>
                              </div>
                            )}
                          </ButtonSection>
                        )}
                        
                        <DelaySelector>
                          <Clock size={14} style={{ marginRight: '4px' }} />
                          <span>Delay:</span>
                          <DelayOption 
                            active={step.delay === 0}
                            onClick={() => updateStep(index, { delay: 0 })}
                          >
                            0ms
                          </DelayOption>
                          <DelayOption 
                            active={step.delay === 1000}
                            onClick={() => updateStep(index, { delay: 1000 })}
                          >
                            1s (default)
                          </DelayOption>
                          <DelayOption 
                            active={step.delay === 2000}
                            onClick={() => updateStep(index, { delay: 2000 })}
                          >
                            2s
                          </DelayOption>
                          <span>or</span>
                          <Input
                            type="number"
                            value={step.delay ?? 0}
                            onChange={(e) => updateStep(index, { delay: Math.max(0, Number(e.target.value)) })}
                            min="0"
                            step="100"
                            style={{ width: '70px', padding: '4px', fontSize: '13px' }}
                          />
                          <span>ms</span>
                        </DelaySelector>
                      </StepFormContent>
                    </StepForm>
                  ))}
                </StepsContainer>
              )}
              
              <ActionBar>
                <ButtonGroup>
                  <ActionButton variant="secondary" onClick={() => addStepBySender('them')}>
                    + Message from {contact.name}
                  </ActionButton>
                  <ActionButton variant="secondary" onClick={() => addStepBySender('me')}>
                    + My Message
                  </ActionButton>
                </ButtonGroup>
                <ButtonGroup>
                  <ActionButton 
                    variant="secondary" 
                    onClick={handlePreview}
                  >
                    Preview Flow
                  </ActionButton>
                  <ActionButton variant="primary" onClick={handleFormSubmit}>
                    Start Conversation
                  </ActionButton>
                </ButtonGroup>
              </ActionBar>
              
              <PreviewOverlay show={showPreview}>
                <PreviewContainer>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2>Conversation Preview</h2>
                    <Button variant="secondary" onClick={() => setShowPreview(false)}>
                      Close Preview
                    </Button>
                  </div>
                  <PhonePreview
                    contact={contact}
                    messages={previewMessages}
                    onUpdateMessage={onUpdateMessage}
                  />
                </PreviewContainer>
              </PreviewOverlay>
            </>
          )}
        </ConversationFlowContainer>
      </Section>
      
      <Section>
        <SectionTitle>Message History</SectionTitle>
        {messages.length > 0 ? (
          <div>
            <MessageList>
              {messages.map((message) => (
                <MessageItem key={message.id} sender={message.sender}>
                  <MessageContent>
                    {message.text} {message.type === 'button' ? '(Button)' : ''}
                  </MessageContent>
                  <MessageActions>
                    {message.sender === 'me' && (
                      <Select
                        value={message.status}
                        onChange={(e) => onUpdateMessage(message.id, { status: e.target.value as MessageStatus })}
                        style={{ padding: '4px', fontSize: '12px' }}
                      >
                        <option value="sending">Sending</option>
                        <option value="sent">Sent</option>
                        <option value="delivered">Delivered</option>
                        <option value="read">Read</option>
                      </Select>
                    )}
                    <Button 
                      variant="danger" 
                      onClick={() => onDeleteMessage(message.id)}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      Delete
                    </Button>
                  </MessageActions>
                </MessageItem>
              ))}
            </MessageList>
            <Button variant="danger" onClick={onClearMessages}>
              Clear All Messages
            </Button>
          </div>
        ) : (
          <p>No messages yet. Add some messages above.</p>
        )}
      </Section>
    </Container>
  );
};

export default ControlPanel;
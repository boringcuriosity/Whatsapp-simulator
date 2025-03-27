import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Clock, Save, Search, Trash2, Download, Upload, ArrowRight } from 'lucide-react';
import { SavedConversation, conversationStorage } from '../services/conversationStorage';
import { format } from 'date-fns';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  padding: 12px 16px;
  border-radius: 50px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
  
  &:focus-within {
    border-color: var(--whatsapp-teal);
    box-shadow: 0 0 0 2px rgba(37, 211, 102, 0.1);
  }
  
  svg {
    color: #666;
    width: 18px;
    height: 18px;
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  font-size: 15px;
  
  &::placeholder {
    color: #999;
  }
`;

const ConversationList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 4px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }
`;

const ConversationCard = styled.div`
  background: white;
  padding: 18px;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 5px;
    height: 100%;
    background: var(--whatsapp-teal);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    
    &:before {
      opacity: 1;
    }
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #f0f0f0;
`;

const ContactAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--whatsapp-teal);
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ContactName = styled.div`
  font-size: 15px;
  color: #555;
  font-weight: 500;
`;

const CardTitle = styled.div`
  font-weight: 600;
  color: #1a1a1a;
  font-size: 16px;
  margin-bottom: 4px;
`;

const TimeStamp = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #777;
  font-size: 13px;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const Description = styled.div`
  font-size: 14px;
  color: #555;
  margin: 10px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StepCount = styled.div`
  font-size: 13px;
  color: var(--whatsapp-teal);
  font-weight: 500;
  margin-top: auto;
  padding: 6px 0;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 18px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  background-color: ${props => {
    if (props.variant === 'primary') return 'var(--whatsapp-teal)';
    if (props.variant === 'danger') return '#ffebee';
    return '#f5f5f5';
  }};
  
  color: ${props => {
    if (props.variant === 'primary') return 'white';
    if (props.variant === 'danger') return '#f44336';
    return '#444';
  }};
  
  box-shadow: ${props => props.variant === 'primary' ? '0 4px 8px rgba(37, 211, 102, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.05)'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.variant === 'primary' ? '0 6px 12px rgba(37, 211, 102, 0.3)' : '0 4px 8px rgba(0, 0, 0, 0.1)'};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const CardButton = styled(Button)`
  padding: 8px 14px;
  font-size: 13px;
`;

const IconButton = styled(Button)`
  padding: 8px;
  border-radius: 50%;
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    margin: 0;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
  grid-column: 1 / -1;
  
  h3 {
    font-size: 18px;
    margin: 16px 0 8px;
    color: #444;
  }
  
  p {
    color: #777;
    margin: 0;
  }
  
  svg {
    width: 56px;
    height: 56px;
    color: #ccc;
    opacity: 0.8;
  }
`;

interface Props {
  conversations: SavedConversation[];
  onSelect: (conversation: SavedConversation) => void;
  onDelete: (id: string) => void;
  onSaveCurrent: () => void;
}

export default function SavedConversations({ 
  conversations, 
  onSelect, 
  onDelete,
  onSaveCurrent
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Validate conversations data
    try {
      conversations.forEach(conv => {
        if (!conv.id || !conv.name || !conv.contact || !conv.updatedAt) {
          throw new Error('Invalid conversation data');
        }
      });
      setError(null);
    } catch (err) {
      console.error('Error validating conversations:', err);
      setError('Failed to load saved conversations. Please try again.');
    }
  }, [conversations]);

  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    try {
      const json = conversationStorage.exportConversations();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'conversations.json';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(`Export failed: ${(error as Error).message}`);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const result = conversationStorage.importConversations(content);
        if (result.success) {
          // Clear the file input for future imports
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          // Force a refresh of the conversations list
          window.location.reload();
        } else {
          alert(`Failed to import conversations: ${result.error}`);
        }
      };
      reader.onerror = () => {
        alert('Failed to read the file. Please try again.');
      };
      reader.readAsText(file);
    }
  };

  if (error) {
    return (
      <Container>
        <EmptyState>
          <h3>Error</h3>
          <p>{error}</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Saved Conversations</Title>
      </Header>
      
      <SearchBox>
        <Search />
        <SearchInput
          placeholder="Search by name, description or contact..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SearchBox>
      
      <ButtonsContainer>
        <Button variant="primary" onClick={onSaveCurrent}>
          <Save size={16} />
          Save Current
        </Button>
        
        <Button variant="secondary" onClick={handleExport}>
          <Download size={16} />
          Export
        </Button>
        
        <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={16} />
          Import
        </Button>
        
        <input
          type="file"
          accept="application/json"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImport}
        />
      </ButtonsContainer>
      
      <ConversationList>
        {filteredConversations.length === 0 ? (
          <EmptyState>
            <Clock />
            <h3>No saved conversations</h3>
            <p>Your saved conversations will appear here</p>
          </EmptyState>
        ) : (
          filteredConversations.map(conv => (
            <ConversationCard key={conv.id}>
              <CardHeader>
                <div style={{ flex: 1 }}>
                  <CardTitle>{conv.name}</CardTitle>
                  <TimeStamp>
                    <Clock />
                    {format(conv.updatedAt, 'MMM d, yyyy')}
                  </TimeStamp>
                </div>
              </CardHeader>
              
              <ContactInfo>
                <ContactAvatar>
                  <Avatar src={conv.contact.avatar} alt={conv.contact.name} />
                </ContactAvatar>
                <ContactName>{conv.contact.name}</ContactName>
              </ContactInfo>
              
              {conv.description && (
                <Description>{conv.description}</Description>
              )}
              
              <StepCount>
                {conv.steps.length} step{conv.steps.length !== 1 ? 's' : ''} in this conversation
              </StepCount>
              
              <ActionBar>
                <CardButton onClick={() => onSelect(conv)}>
                  Load Conversation
                  <ArrowRight size={14} />
                </CardButton>
                
                <IconButton
                  variant="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                >
                  <Trash2 size={16} />
                </IconButton>
              </ActionBar>
            </ConversationCard>
          ))
        )}
      </ConversationList>
    </Container>
  );
}
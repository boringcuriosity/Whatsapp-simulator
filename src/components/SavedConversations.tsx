import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Clock, Save, Search, Trash2 } from 'lucide-react';
import { SavedConversation } from '../services/conversationStorage';
import { format } from 'date-fns';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #f9f9f9;
  border: 1px solid var(--border-color);
  border-radius: 8px;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  
  svg {
    color: var(--text-secondary);
    width: 18px;
    height: 18px;
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  font-size: 14px;
  
  &::placeholder {
    color: var(--text-secondary);
  }
`;

const ConversationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
`;

const ConversationCard = styled.div`
  background: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const ContactAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const ContactName = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
`;

const Title = styled.div`
  font-weight: 500;
  color: var(--text-primary);
`;

const TimeStamp = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  font-size: 12px;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const Description = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
`;

const StepCount = styled.div`
  font-size: 12px;
  color: var(--whatsapp-teal);
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  
  background-color: ${props => {
    if (props.variant === 'primary') return 'var(--whatsapp-teal)';
    if (props.variant === 'danger') return '#ffebee';
    return '#f0f2f5';
  }};
  
  color: ${props => {
    if (props.variant === 'primary') return 'white';
    if (props.variant === 'danger') return '#f44336';
    return 'var(--text-primary)';
  }};
  
  &:hover {
    opacity: 0.9;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px;
  color: var(--text-secondary);
  
  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
    color: var(--text-secondary);
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
      <SearchBox>
        <Search />
        <SearchInput
          placeholder="Search saved conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SearchBox>

      <Button variant="primary" onClick={onSaveCurrent}>
        <Save size={16} />
        Save Current Conversation
      </Button>

      <ConversationList>
        {filteredConversations.length === 0 ? (
          <EmptyState>
            <Clock />
            <h3>No saved conversations</h3>
            <p>Your saved conversations will appear here</p>
          </EmptyState>
        ) : (
          filteredConversations.map(conv => (
            <ConversationCard key={conv.id} onClick={() => onSelect(conv)}>
              <CardHeader>
                <div style={{ flex: 1 }}>
                  <Title>{conv.name}</Title>
                  <TimeStamp>
                    <Clock />
                    {format(conv.updatedAt, 'MMM d, yyyy')}
                  </TimeStamp>
                </div>
              </CardHeader>

              <ContactInfo>
                <ContactAvatar src={conv.contact.avatar} alt={conv.contact.name} />
                <ContactName>with {conv.contact.name}</ContactName>
              </ContactInfo>

              {conv.description && (
                <Description>{conv.description}</Description>
              )}
              
              <StepCount>
                {conv.steps.length} step{conv.steps.length !== 1 ? 's' : ''}
              </StepCount>

              <ActionBar>
                <Button onClick={() => onSelect(conv)}>
                  Load
                </Button>
                <Button
                  variant="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </ActionBar>
            </ConversationCard>
          ))
        )}
      </ConversationList>
    </Container>
  );
}
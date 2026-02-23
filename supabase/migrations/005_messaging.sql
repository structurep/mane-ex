-- Migration 005: Conversations & Messages
-- Two-participant messaging with optional listing context. Supabase Realtime compatible.

create table conversations (
  id uuid primary key default gen_random_uuid(),
  participant_1_id uuid not null references profiles(id) on delete cascade,
  participant_2_id uuid not null references profiles(id) on delete cascade,
  listing_id uuid references horse_listings(id) on delete set null,
  last_message_at timestamptz,
  last_message_preview text, -- first 100 chars of last message for inbox display
  is_archived_by_1 boolean default false,
  is_archived_by_2 boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(participant_1_id, participant_2_id, listing_id)
);

create trigger conversations_updated_at
  before update on conversations
  for each row execute function update_updated_at();

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid references profiles(id) on delete set null, -- null for system messages
  body text not null,
  is_system boolean default false, -- system messages like "Offer made for $85,000"
  read_at timestamptz, -- null means unread
  created_at timestamptz not null default now()
);

-- RLS
alter table conversations enable row level security;
alter table messages enable row level security;

-- Conversations: participants can view their own conversations
create policy "Participants can view their conversations"
  on conversations for select
  using (
    auth.uid() = participant_1_id or auth.uid() = participant_2_id
  );

-- Conversations: authenticated users can start a conversation they are part of
create policy "Authenticated users can start conversations"
  on conversations for insert
  with check (
    auth.uid() = participant_1_id or auth.uid() = participant_2_id
  );

-- Conversations: participants can update their own (archiving)
create policy "Participants can update their conversations"
  on conversations for update
  using (
    auth.uid() = participant_1_id or auth.uid() = participant_2_id
  )
  with check (
    auth.uid() = participant_1_id or auth.uid() = participant_2_id
  );

-- Messages: conversation participants can read messages
create policy "Conversation participants can read messages"
  on messages for select
  using (
    conversation_id in (
      select id from conversations
      where participant_1_id = auth.uid() or participant_2_id = auth.uid()
    )
  );

-- Messages: conversation participants can send messages
create policy "Conversation participants can send messages"
  on messages for insert
  with check (
    conversation_id in (
      select id from conversations
      where participant_1_id = auth.uid() or participant_2_id = auth.uid()
    )
    and (sender_id = auth.uid() or is_system = true)
  );

-- Messages: sender can update own messages (for read_at)
create policy "Conversation participants can update messages"
  on messages for update
  using (
    conversation_id in (
      select id from conversations
      where participant_1_id = auth.uid() or participant_2_id = auth.uid()
    )
  );

-- Indexes: conversations
create index conversations_participant_1_idx on conversations(participant_1_id);
create index conversations_participant_2_idx on conversations(participant_2_id);
create index conversations_listing_idx on conversations(listing_id) where listing_id is not null;
create index conversations_last_message_idx on conversations(last_message_at desc);

-- Indexes: messages
create index messages_conversation_idx on messages(conversation_id);
create index messages_sender_idx on messages(sender_id) where sender_id is not null;
create index messages_created_idx on messages(created_at desc);
create index messages_unread_idx on messages(conversation_id) where read_at is null;

-- Function to update conversation on new message
create or replace function update_conversation_on_message()
returns trigger as $$
begin
  update conversations
  set
    last_message_at = new.created_at,
    last_message_preview = left(new.body, 100)
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger conversation_last_message_update
  after insert on messages
  for each row execute function update_conversation_on_message();

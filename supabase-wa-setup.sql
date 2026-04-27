-- Tabela principal de prospects WhatsApp
create table if not exists wa_prospects (
  id text primary key,                        -- place_id do Google
  nome text not null,
  categoria text,
  telefone text,
  wa_num text not null,                       -- ex: 5519999999999
  maps_url text,
  foto text,
  preview_id text,                            -- id do preview gerado
  preview_url text,                           -- link do preview
  status text not null default 'pending',     -- pending | sent1 | replied | sent2 | done | ignored
  sent1_at timestamptz,                       -- quando enviou 1º WA
  replied_at timestamptz,                     -- quando cliente respondeu
  reply_delay_ms int,                         -- delay da resposta em ms
  sent2_at timestamptz,                       -- quando enviou 2º WA
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices
create index if not exists wa_prospects_status on wa_prospects(status);
create index if not exists wa_prospects_wa_num on wa_prospects(wa_num);

-- Tabela de log de mensagens recebidas
create table if not exists wa_messages (
  id bigserial primary key,
  wa_num text not null,
  message text,
  received_at timestamptz default now()
);

create index if not exists wa_messages_wa_num on wa_messages(wa_num);
create index if not exists wa_messages_received_at on wa_messages(received_at);

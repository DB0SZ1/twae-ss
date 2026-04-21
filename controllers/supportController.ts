/**
 * supportController — Help & Support API layer
 */
import { apiClient } from '../utils/apiClient';

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  view_count: number;
}

export interface TicketMessage {
  id: string;
  sender: 'user' | 'agent';
  body: string;
  attachmentUrl?: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  category: string;
  subject: string;
  description: string;
  status: 'open' | 'resolved' | 'closed';
  transactionId?: string;
  createdAt: string;
  messages: TicketMessage[];
}

export async function fetchFAQs() {
  return await apiClient<any>('/support/faq');
}

export async function searchFAQs(q: string) {
  return await apiClient<any>(`/support/faq/search?q=${encodeURIComponent(q)}`);
}

export async function fetchTickets(status?: string) {
  const query = status ? `?status=${status}` : '';
  return await apiClient<any>(`/support/tickets${query}`);
}

export async function createTicket(payload: {
  category: string;
  subject: string;
  description: string;
  transactionId?: string;
  attachmentUrl?: string;
}) {
  return await apiClient<any>('/support/tickets', {
    method: 'POST',
    body: JSON.stringify({
      category: payload.category,
      subject: payload.subject,
      description: payload.description,
      transaction_id: payload.transactionId,
      attachment_url: payload.attachmentUrl
    })
  });
}

export async function fetchTicketDetails(ticketId: string) {
  return await apiClient<any>(`/support/tickets/${ticketId}`);
}

export async function replyToTicket(ticketId: string, payload: { body: string; attachmentUrl?: string }) {
  return await apiClient<any>(`/support/tickets/${ticketId}/reply`, {
    method: 'POST',
    body: JSON.stringify({
      body: payload.body,
      attachment_url: payload.attachmentUrl
    })
  });
}

export async function rateTicket(ticketId: string, stars: number, comment?: string) {
  return await apiClient<any>(`/support/tickets/${ticketId}/rate`, {
    method: 'PATCH',
    body: JSON.stringify({ stars, comment })
  });
}

export async function getLiveChatToken() {
  return await apiClient<any>('/support/live-chat/token');
}

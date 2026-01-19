export type Sender = 'user' | 'ai';

export class ChatMessage {
  readonly id: string;
  readonly sender: Sender;
  readonly text: string;
  readonly timestamp: Date;
  readonly mediaId?: string;

  constructor(
    id: string,
    sender: Sender,
    text: string,
    mediaId?: string,
    timestamp: Date = new Date()
  ) {
    this.id = id;
    this.sender = sender;
    this.text = text;
    this.mediaId = mediaId;
    this.timestamp = timestamp;
  }

  isFromUser(): boolean {
    return this.sender === 'user';
  }

  isFromAI(): boolean {
    return this.sender === 'ai';
  }

  hasMedia(): boolean {
    return !!this.mediaId;
  }

  getFormattedTime(): string {
    return this.timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

export enum Messages {
  // Success messages
  CONVERSATION_CREATED = 'Conversation created successfully! 💬',
  CONVERSATION_DELETED = 'Conversation deleted successfully',
  CONVERSATION_TITLE_UPDATED = 'Title updated successfully!',
  MESSAGE_SENT = 'Message sent successfully',

  // Error messages
  CONVERSATION_CREATE_FAILED = 'Failed to create conversation',
  CONVERSATION_DELETE_FAILED = 'Failed to delete conversation',
  CONVERSATION_UPDATE_FAILED = 'Failed to update title',
  MESSAGE_SEND_FAILED = 'Failed to send message',
  NO_CONVERSATION_SELECTED = 'No conversation selected',

  // Validation messages
  TITLE_REQUIRED = 'Title is required',
  MESSAGE_REQUIRED = 'Message is required',

  // Placeholders
  TYPE_MESSAGE_PLACEHOLDER = 'Type your message... (Shift+Enter for new line)',
  CONVERSATION_TITLE_PLACEHOLDER = 'Enter conversation title...',
  SEARCH_PLACEHOLDER = 'Search conversations...',
}

export const enum Timing {
  ASSISTANT_RESPONSE_DELAY = 1000,
  VALIDATION_DEBOUNCE = 300,
  NOTIFICATION_DURATION = 5000,
}

export const enum Limits {
  MAX_TITLE_LENGTH = 128,
  MAX_MESSAGE_LENGTH = 4096,
  VIRTUAL_SCROLL_ITEM_SIZE = 80,
  MESSAGES_THRESHOLD = 100,
}

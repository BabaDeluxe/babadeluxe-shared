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

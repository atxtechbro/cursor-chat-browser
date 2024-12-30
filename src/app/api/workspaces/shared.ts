// Helper to extract message content
export const getMessageContent = (msg: any): string => {
    // Try all possible content locations
    const possibleContent = [
        msg.context?.content,
        msg.context?.message,
        msg.message,
        msg.content,
        msg.text
    ];

    for (const content of possibleContent) {
        if (typeof content === 'string' && content.trim()) {
            return content.trim();
        }
    }

    return '';
};

// Helper to get chat title
export const getChatTitle = (msg: any): string => {
    // Try to get an explicit title first
    if (typeof msg.context?.title === 'string' && msg.context.title.trim()) {
        return msg.context.title.trim();
    }

    // Otherwise use the first message content as title
    const content = getMessageContent(msg);
    if (content) {
        // Take first line, limit length
        const title = content.split('\n')[0].slice(0, 50);
        return title + (content.length > 50 ? '...' : '');
    }

    return 'Untitled Chat';
};

// Helper to determine if a conversation is from the chat panel
export const isChatPanelConversation = (conversation: any) => {
    if (!conversation?.[0]) return false;

    const firstMessage = conversation[0];
    const title = getChatTitle(firstMessage);

    console.log('\nAnalyzing conversation:', {
        title,
        source: firstMessage.source,
        contextType: firstMessage.context?.type,
        messageType: firstMessage.type,
        hasFileSelections: firstMessage.context?.fileSelections?.length > 0,
        hasFolderSelections: firstMessage.context?.folderSelections?.length > 0,
        hasCommitSelections: firstMessage.context?.selectedCommits?.length > 0,
        hasDocSelections: firstMessage.context?.selectedDocs?.length > 0,
        firstContent: getMessageContent(firstMessage).slice(0, 100) // First 100 chars
    });

    // Current hardcoded patterns - TODO: Learn from logs to create better rules
    if (title.startsWith('testing opening new log') ||
        title.includes('does this look "legit"') ||
        !title.startsWith('#')) {
        console.log('Categorized as CHAT based on title pattern match');
        return true;
    }

    if (title.startsWith('#')) {
        console.log('Categorized as COMPOSER based on # prefix');
        return false;
    }

    // Fallback to source/type checks
    if (firstMessage.source === 'chat' || firstMessage.context?.type === 'chat') {
        console.log('Categorized as CHAT based on source/type');
        return true;
    }

    if (firstMessage.source === 'editor' || firstMessage.context?.type === 'editor') {
        console.log('Categorized as COMPOSER based on source/type');
        return false;
    }

    console.log('No clear indicators - defaulting to CHAT');
    return true;
}; 
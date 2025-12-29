// Centralized notes storage service using localStorage

export interface Note {
    id: number;
    content: string;
    subject: string;
    date: string;
    priority?: 'high' | 'medium' | 'low';
    source?: 'ai-tutor' | 'challenges' | 'assignments';
}

const NOTES_STORAGE_KEY = 'student-revision-notes';

/**
 * Get all notes from localStorage
 */
export const getNotes = (): Note[] => {
    try {
        const stored = localStorage.getItem(NOTES_STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
    } catch (error) {
        console.error('Error loading notes:', error);
        return [];
    }
};

/**
 * Save a note to localStorage
 */
export const saveNote = (note: Omit<Note, 'id'>): Note => {
    try {
        const notes = getNotes();
        const newNote: Note = {
            ...note,
            id: Date.now(), // Use timestamp as unique ID
            priority: note.priority || calculatePriority(note),
        };
        const updatedNotes = [newNote, ...notes];
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
        return newNote;
    } catch (error) {
        console.error('Error saving note:', error);
        throw error;
    }
};

/**
 * Delete a note from localStorage
 */
export const deleteNote = (id: number): void => {
    try {
        const notes = getNotes();
        const filteredNotes = notes.filter(note => note.id !== id);
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(filteredNotes));
    } catch (error) {
        console.error('Error deleting note:', error);
        throw error;
    }
};

/**
 * Calculate priority based on recency and subject
 */
const calculatePriority = (note: Omit<Note, 'id'>): 'high' | 'medium' | 'low' => {
    const noteDate = new Date(note.date);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - noteDate.getTime()) / (1000 * 60 * 60 * 24));

    // High priority subjects
    const highPrioritySubjects = ['Math', 'Mathematics', 'Science', 'English'];
    const isHighPrioritySubject = highPrioritySubjects.some(s =>
        note.subject.toLowerCase().includes(s.toLowerCase())
    );

    // Recent notes (within 3 days) from high priority subjects
    if (daysDiff <= 3 && isHighPrioritySubject) {
        return 'high';
    }

    // Recent notes (within 7 days) or high priority subjects
    if (daysDiff <= 7 || isHighPrioritySubject) {
        return 'medium';
    }

    return 'low';
};

/**
 * Get notes sorted by priority
 */
export const getNotesByPriority = (): Note[] => {
    const notes = getNotes();
    const priorityOrder = { high: 0, medium: 1, low: 2 };

    return notes.sort((a, b) => {
        const aPriority = a.priority || 'low';
        const bPriority = b.priority || 'low';
        return priorityOrder[aPriority] - priorityOrder[bPriority];
    });
};

/**
 * Clear all notes (for testing purposes)
 */
export const clearAllNotes = (): void => {
    try {
        localStorage.removeItem(NOTES_STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing notes:', error);
        throw error;
    }
};

import jsPDF from 'jspdf';
import { Lesson } from '@/types';

export const exportToPDF = (lesson: Lesson) => {
    try {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text(lesson.title, 20, 20);

        // Metadata
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Subject: ${lesson.subject} | Grade: ${lesson.grade}`, 20, 30);
        doc.text(`Topic: ${lesson.topic}`, 20, 38);

        // Content
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);

        const splitText = doc.splitTextToSize(lesson.content, 170);
        doc.text(splitText, 20, 50);

        doc.save(`${lesson.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
        return true;
    } catch (error) {
        console.error('PDF Export Error:', error);
        return false;
    }
};

export const createGoogleDoc = async (lesson: Lesson, apiKey?: string, token?: string) => {
    // This is a stub implementation as we cannot generate valid Google API credentials here.
    // In a real app, this would use the Google Drive API.

    return new Promise<{ success: boolean; url?: string; message: string }>((resolve) => {
        setTimeout(() => {
            if (!apiKey) {
                resolve({
                    success: false,
                    message: 'Google API Key not configured. Please add your credentials in Settings.'
                });
                return;
            }

            // Mock success
            const mockDocId = `1${crypto.randomUUID()}`;
            const mockUrl = `https://docs.google.com/document/d/${mockDocId}/edit`;
            resolve({
                success: true,
                url: mockUrl,
                message: 'Draft created in Google Docs (Mock)'
            });
        }, 1500);
    });
};

export const shareLesson = async (lesson: Lesson, emails: string[]) => {
    // Mock email sharing
    return new Promise<{ success: boolean }>((resolve) => {
        setTimeout(() => {
            console.log(`Sharing lesson ${lesson.id} with ${emails.join(', ')}`);
            resolve({ success: true });
        }, 1000);
    });
};

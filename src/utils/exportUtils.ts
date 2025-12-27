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

        // Content - Strip HTML tags for basic PDF text
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);

        // Simple HTML strip
        const plainText = lesson.content.replace(/<[^>]+>/g, '\n').replace(/&nbsp;/g, ' ').replace(/\n\s*\n/g, '\n').trim();

        const splitText = doc.splitTextToSize(plainText, 170);
        doc.text(splitText, 20, 50);

        doc.save(`${lesson.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
        return true;
    } catch (error) {
        console.error('PDF Export Error:', error);
        return false;
    }
};

export const createGoogleDoc = async (lesson: Lesson) => {
    try {
        const response = await fetch('/api/export/google-doc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: lesson.title,
                content: lesson.content
            })
        });

        if (response.status === 401) {
            return {
                success: false,
                authUrl: '/api/auth/google', // Backend redirect URL
                message: 'Please connect your Google Account'
            };
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create doc');
        }

        return {
            success: true,
            url: data.url,
            message: 'Google Doc created successfully'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Error creating Google Doc'
        };
    }
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

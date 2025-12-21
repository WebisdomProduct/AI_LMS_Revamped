import React, { useState } from 'react';
import { dbService } from '@/services/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const DevSeed: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const { toast } = useToast();
    const { user } = useAuth(); // We need a teacher ID

    const log = (msg: string) => setLogs(p => [...p, msg]);

    const seedData = async () => {
        if (!user) {
            toast({ title: "Error", description: "You must be logged in as a teacher.", variant: "destructive" });
            return;
        }

        setLoading(true);
        setProgress(0);
        setLogs([]);

        try {
            log(`Reseeding local database...`);
            await dbService.reseed(user.id);
            setProgress(100);
            log("Seeding complete!");
            toast({ title: "Success", description: "Local database re-seeded successfully." });
        } catch (e: any) {
            console.error(e);
            log(`Error: ${e.message}`);
            toast({ title: "Error", description: e.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Database Seeder (Dev Only)</CardTitle>
                    <CardDescription>Populate the database with dummy data for testing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-muted p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Instructions:</h3>
                        <ul className="list-disc list-inside text-sm space-y-1">
                            <li>Ensure you are logged in.</li>
                            <li>This will create dummy students, enrollments, lessons, assessments, and grades linked to YOU.</li>
                        </ul>
                    </div>

                    <Button onClick={seedData} disabled={loading || !user} className="w-full">
                        {loading ? "Seeding..." : "Seed Database"}
                    </Button>

                    {loading && <Progress value={progress} className="w-full" />}

                    <div className="bg-black/90 text-green-400 p-4 rounded-md font-mono text-xs h-64 overflow-y-auto">
                        {logs.map((l, i) => <div key={i}>{l}</div>)}
                        {logs.length === 0 && <span className="text-gray-500">// Logs will appear here</span>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DevSeed;

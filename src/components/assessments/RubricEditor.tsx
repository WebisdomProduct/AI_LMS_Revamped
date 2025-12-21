import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

interface RubricProps {
    rubric: any; // Using any for flexibility with AI response structure
    onChange: (rubric: any) => void;
}

const RubricEditor: React.FC<RubricProps> = ({ rubric, onChange }) => {
    // Transform AI string rubric to structured object if needed
    const [criteria, setCriteria] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (typeof rubric === 'string') {
            // If rubric is just text, create a default structure
            setCriteria([{
                criterion: "General Quality",
                description: rubric,
                points: 10
            }]);
        } else if (Array.isArray(rubric)) {
            setCriteria(rubric);
        } else if (typeof rubric === 'object' && rubric.criteria) {
            setCriteria(rubric.criteria);
        } else {
            // Default fallback
            setCriteria([]);
        }
    }, [rubric]);

    const handleUpdate = () => {
        onChange({ ...rubric, criteria });
        setIsEditing(false);
    };

    const addCriterion = () => {
        setCriteria([...criteria, { criterion: "New Criterion", description: "Description", points: 5 }]);
    };

    const updateCriterion = (index: number, field: string, value: any) => {
        const newCriteria = [...criteria];
        newCriteria[index] = { ...newCriteria[index], [field]: value };
        setCriteria(newCriteria);
    };

    const removeCriterion = (index: number) => {
        setCriteria(criteria.filter((_, i) => i !== index));
    };

    return (
        <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">Grading Rubric</CardTitle>
                <Button variant="outline" size="sm" onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}>
                    {isEditing ? <Check className="h-4 w-4 mr-2" /> : <Edit2 className="h-4 w-4 mr-2" />}
                    {isEditing ? 'Done' : 'Edit Rubric'}
                </Button>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <div className="space-y-4">
                        {criteria.map((c, i) => (
                            <div key={i} className="flex gap-4 items-start p-3 bg-muted/30 rounded-lg border">
                                <div className="flex-1 space-y-2">
                                    <Input
                                        value={c.criterion}
                                        onChange={(e) => updateCriterion(i, 'criterion', e.target.value)}
                                        placeholder="Criterion Name"
                                        className="font-medium"
                                    />
                                    <Textarea
                                        value={c.description}
                                        onChange={(e) => updateCriterion(i, 'description', e.target.value)}
                                        placeholder="Description of criteria"
                                        className="text-sm min-h-[60px]"
                                    />
                                </div>
                                <div className="w-20 pt-1">
                                    <Input
                                        type="number"
                                        value={c.points}
                                        onChange={(e) => updateCriterion(i, 'points', parseInt(e.target.value))}
                                        className="text-center"
                                    />
                                </div>
                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeCriterion(i)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full dashed-border" onClick={addCriterion}>
                            <Plus className="h-4 w-4 mr-2" /> Add Criterion
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {criteria.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Criterion</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Points</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {criteria.map((c, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{c.criterion}</TableCell>
                                            <TableCell className="text-muted-foreground">{c.description}</TableCell>
                                            <TableCell className="text-right">{c.points}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-muted-foreground text-center py-4 italic">No specific rubric defined.</p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default RubricEditor;

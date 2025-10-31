import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Edit, 
  Save, 
  X, 
  StickyNote,
  Clock,
  User,
  Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SiteStudyService } from '@/services/siteStudyService';
import { toast } from 'sonner';
import { Loader } from './ui/loader';
import { formatDateTime } from '@/lib/dateUtils';

interface SiteNote {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  type: 'general' | 'technical' | 'operational' | 'other';
}

interface GlobalSiteNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId: string;
  siteName: string;
}

export function GlobalSiteNotesModal({ 
  isOpen, 
  onClose, 
  siteId, 
  siteName 
}: GlobalSiteNotesModalProps) {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<SiteNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'general' | 'technical' | 'operational' | 'other'>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const siteStudy = await SiteStudyService.getSiteStudyBySiteId(siteId);
      if (siteStudy?.site_notes) {
        // Parse existing notes or create default structure
        try {
          const parsedNotes = JSON.parse(siteStudy.site_notes);
          if (Array.isArray(parsedNotes)) {
            setNotes(parsedNotes);
          } else {
            // Convert old format to new format
            setNotes([{
              id: '1',
              content: siteStudy.site_notes,
              author: 'System',
              timestamp: siteStudy.updated_at || siteStudy.created_at,
              type: 'general'
            }]);
          }
        } catch {
          // If parsing fails, treat as single note
          setNotes([{
            id: '1',
            content: siteStudy.site_notes,
            author: 'System',
            timestamp: siteStudy.updated_at || siteStudy.created_at,
            type: 'general'
          }]);
        }
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      toast.error('Failed to load site notes');
    } finally {
      setIsLoading(false);
    }
  }, [siteId]);

  // Load existing notes when modal opens
  useEffect(() => {
    if (isOpen && siteId) {
      loadNotes();
    }
  }, [isOpen, siteId, loadNotes]);

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note before saving');
      return;
    }

    if (!profile?.full_name) {
      toast.error('User profile not found');
      return;
    }

    setIsSaving(true);
    try {
      const newNoteObj: SiteNote = {
        id: Date.now().toString(),
        content: newNote.trim(),
        author: profile.full_name,
        timestamp: new Date().toISOString(),
        type: noteType
      };

      const updatedNotes = [...notes, newNoteObj];
      const notesJson = JSON.stringify(updatedNotes);

      // Save to site_studies table
      const success = await SiteStudyService.updateSiteNotes(siteId, notesJson, '');
      
      if (success) {
        setNotes(updatedNotes);
        setNewNote('');
        setNoteType('general');
        toast.success('Note added successfully');
      } else {
        toast.error('Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    setIsSaving(true);
    try {
      const updatedNotes = notes.filter(note => note.id !== noteId);
      const notesJson = JSON.stringify(updatedNotes);

      const success = await SiteStudyService.updateSiteNotes(siteId, notesJson, '');
      
      if (success) {
        setNotes(updatedNotes);
        toast.success('Note deleted successfully');
      } else {
        toast.error('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    } finally {
      setIsSaving(false);
    }
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'operational': return 'bg-green-100 text-green-800';
      case 'other': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNoteTypeLabel = (type: string) => {
    switch (type) {
      case 'technical': return 'Technical';
      case 'operational': return 'Operational';
      case 'other': return 'Other';
      default: return 'General';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            Site Notes - {siteName}
          </DialogTitle>
          <DialogDescription>
            Add and manage notes for this site. Notes are stored chronologically and visible to all team members.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Note */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="noteType">Note Type</Label>
                  <select
                    id="noteType"
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value as 'general' | 'technical' | 'operational' | 'other')}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="technical">Technical</option>
                    <option value="operational">Operational</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleAddNote}
                    disabled={isSaving || !newNote.trim()}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isSaving ? 'Adding...' : 'Add Note'}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="newNote">Note Content</Label>
                <Textarea
                  id="newNote"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter your note here..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Existing Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Site Notes ({notes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">
                  <Loader size="md" />
                  <p className="text-sm text-gray-600 mt-2">Loading notes...</p>
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <StickyNote className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No notes added yet</p>
                  <p className="text-sm text-gray-400 mt-1">Add your first note above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className={getNoteTypeColor(note.type)}>
                            {getNoteTypeLabel(note.type)}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <User className="h-3 w-3" />
                            {note.author}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-3 w-3" />
                            {formatDateTime(note.timestamp)}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-gray-900 whitespace-pre-wrap">
                        {note.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

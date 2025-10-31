import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Edit, 
  Save, 
  X, 
  Info,
  CheckCircle
} from 'lucide-react';

interface SiteNotesManagerProps {
  siteId: string;
  notes: string;
  additionalDetails: string;
  onNotesChange: (notes: string, additionalDetails: string) => void;
  disabled?: boolean;
}

export function SiteNotesManager({ 
  siteId, 
  notes, 
  additionalDetails, 
  onNotesChange, 
  disabled = false 
}: SiteNotesManagerProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editNotes, setEditNotes] = useState(notes);
  const [editAdditionalDetails, setEditAdditionalDetails] = useState(additionalDetails);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onNotesChange(editNotes, editAdditionalDetails);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditNotes(notes);
    setEditAdditionalDetails(additionalDetails);
    setIsEditMode(false);
  };

  const hasContent = notes.trim() || additionalDetails.trim();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Site Notes & Details
        </CardTitle>
        {!isEditMode && (
          <Button
            onClick={() => setIsEditMode(true)}
            disabled={disabled}
            size="sm"
            variant="outline"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Notes
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!isEditMode ? (
          // View Mode
          <div className="space-y-4">
            {!hasContent ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No notes or additional details added yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Click "Edit Notes" to add site study notes and additional information
                </p>
              </div>
            ) : (
              <>
                {/* Site Notes */}
                {notes.trim() && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-gray-700">Site Notes</Label>
                      <Badge variant="secondary" className="text-xs">
                        {notes.split('\n').length} line{notes.split('\n').length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900 whitespace-pre-wrap text-sm">
                        {notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Additional Site Details */}
                {additionalDetails.trim() && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-gray-700">Additional Site Details</Label>
                      <Badge variant="secondary" className="text-xs">
                        {additionalDetails.split('\n').length} line{additionalDetails.split('\n').length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900 whitespace-pre-wrap text-sm">
                        {additionalDetails}
                      </p>
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="flex items-center gap-2 pt-2 border-t text-xs text-gray-500">
                  <Info className="h-3 w-3" />
                  <span>
                    {notes.trim() && additionalDetails.trim() 
                      ? 'Both notes and additional details are available'
                      : notes.trim() 
                        ? 'Only site notes are available'
                        : 'Only additional details are available'
                    }
                  </span>
                </div>
              </>
            )}
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-4">
            {/* Site Notes */}
            <div className="space-y-2">
              <Label htmlFor="siteNotes">
                Site Notes
              </Label>
              <Textarea
                id="siteNotes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Enter site study notes, observations, and key findings..."
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Add detailed notes about the site study, including observations, requirements, and any special considerations.
              </p>
            </div>

            {/* Additional Site Details */}
            <div className="space-y-2">
              <Label htmlFor="additionalDetails">
                Additional Site Details
              </Label>
              <Textarea
                id="additionalDetails"
                value={editAdditionalDetails}
                onChange={(e) => setEditAdditionalDetails(e.target.value)}
                placeholder="Enter additional site details, special requirements, or supplementary information..."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Include any additional information that doesn't fit in the main notes, such as special requirements or supplementary details.
              </p>
            </div>

            {/* Character Counts */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
              <div className="flex items-center gap-4">
                <span>
                  Notes: {editNotes.length} characters
                  {editNotes.length > 1000 && (
                    <span className="text-orange-600 ml-1">(Long notes may affect performance)</span>
                  )}
                </span>
                <span>
                  Details: {editAdditionalDetails.length} characters
                </span>
              </div>
              <div className="flex items-center gap-2">
                {hasContent && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>Content available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Notes'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

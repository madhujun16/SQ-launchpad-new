import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  Briefcase,
  AlertTriangle,
  CheckCircle,
  Users,
  X
} from 'lucide-react';
import { Stakeholder } from '@/types/siteStudy';
import { SiteStudyService } from '@/services/siteStudyService';

interface StakeholderManagerProps {
  siteId: string;
  siteName: string;
  stakeholders?: Stakeholder[];
  onStakeholdersChange?: (stakeholders: Stakeholder[]) => void;
  disabled?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function StakeholderManager({ 
  siteId, 
  siteName,
  stakeholders = [], 
  onStakeholdersChange = () => {}, 
  disabled = false,
  isOpen = false,
  onClose
}: StakeholderManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [formData, setFormData] = useState<Stakeholder>({
    name: '',
    role: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      email: '',
      phone: ''
    });
    setErrors([]);
    setEditingIndex(-1);
  };

  const handleAddStakeholder = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEditStakeholder = (index: number) => {
    const stakeholder = stakeholders[index];
    setFormData({ ...stakeholder });
    setEditingIndex(index);
    setIsEditDialogOpen(true);
  };

  const handleRemoveStakeholder = async (index: number) => {
    if (disabled) return;
    
    try {
      const success = await SiteStudyService.removeStakeholder(siteId, index);
      if (success) {
        const updatedStakeholders = stakeholders.filter((_, i) => i !== index);
        onStakeholdersChange(updatedStakeholders);
      }
    } catch (error) {
      console.error('Error removing stakeholder:', error);
    }
  };

  const validateForm = (): boolean => {
    const validation = SiteStudyService.validateStakeholder(formData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let success = false;
      
      if (editingIndex >= 0) {
        // Update existing stakeholder
        success = await SiteStudyService.updateStakeholder(siteId, editingIndex, formData);
        if (success) {
          const updatedStakeholders = [...stakeholders];
          updatedStakeholders[editingIndex] = formData;
          onStakeholdersChange(updatedStakeholders);
        }
      } else {
        // Add new stakeholder
        success = await SiteStudyService.addStakeholder(siteId, formData);
        if (success) {
          const updatedStakeholders = [...stakeholders, formData];
          onStakeholdersChange(updatedStakeholders);
        }
      }

      if (success) {
        setIsAddDialogOpen(false);
        setIsEditDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving stakeholder:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof Stakeholder, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const renderDialog = (isOpen: boolean, onOpenChange: (open: boolean) => void) => (
    isOpen ? (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingIndex >= 0 ? (
                <>
                  <Edit className="h-5 w-5" />
                  Edit Stakeholder
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Add Stakeholder
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {editingIndex >= 0 
                ? 'Update the stakeholder information below.'
                : 'Add a new stakeholder to the site study.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter stakeholder name"
                className="mt-1"
              />
            </div>

            {/* Role Field */}
            <div>
              <Label htmlFor="role">
                Role <span className="text-red-500">*</span>
              </Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                placeholder="e.g., Operations Manager, IT Coordinator"
                className="mt-1"
              />
            </div>

            {/* Email Field */}
            <div>
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="stakeholder@company.com"
                className="mt-1"
              />
            </div>

            {/* Phone Field */}
            <div>
              <Label htmlFor="phone">
                Phone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+44 7700 900123"
                className="mt-1"
              />
            </div>

            {/* Error Display */}
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  resetForm();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  'Saving...'
                ) : editingIndex >= 0 ? (
                  'Update Stakeholder'
                ) : (
                  'Add Stakeholder'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    ) : null
  );

  // If not open as modal, render nothing
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Manage Stakeholders - {siteName}</span>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            Add, edit, and manage stakeholders for this site
          </DialogDescription>
        </DialogHeader>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Site Stakeholders</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Manage key stakeholders and contacts for {siteName}
                </p>
              </div>
              <Button
                onClick={handleAddStakeholder}
                disabled={disabled}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Stakeholder
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stakeholders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No stakeholders added yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Add stakeholders who are involved in the site study
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Total Stakeholders: {stakeholders.length}</span>
                  <Badge variant="outline" className="text-xs">
                    {stakeholders.length === 1 ? '1 Person' : `${stakeholders.length} People`}
                  </Badge>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stakeholders.map((stakeholder, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{stakeholder.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-gray-400" />
                            <span>{stakeholder.role}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">{stakeholder.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">{stakeholder.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStakeholder(index)}
                              disabled={disabled}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveStakeholder(index)}
                              disabled={disabled}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          {/* Add Stakeholder Dialog */}
          {renderDialog(isAddDialogOpen, setIsAddDialogOpen)}

          {/* Edit Stakeholder Dialog */}
          {renderDialog(isEditDialogOpen, setIsEditDialogOpen)}
        </Card>
      </DialogContent>
    </Dialog>
  );
}

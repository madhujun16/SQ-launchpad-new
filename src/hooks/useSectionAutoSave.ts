import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export interface SectionSaveStatus {
  [sectionName: string]: SaveStatus;
}

export interface UseSectionAutoSaveOptions {
  onSave: (sectionName: string, data: any) => Promise<void>;
  debounceMs?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export const useSectionAutoSave = ({
  onSave,
  debounceMs = 500,
  retryAttempts = 3,
  retryDelay = 1000
}: UseSectionAutoSaveOptions) => {
  const [activeSection, setActiveSection] = useState<string>('');
  const [sectionStatus, setSectionStatus] = useState<SectionSaveStatus>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const saveQueue = useRef<Map<string, any>>(new Map());
  const retryCount = useRef<Map<string, number>>(new Map());

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (sectionName: string, data: any) => {
      if (!sectionName || !data) return;

      try {
        setIsSaving(true);
        setSectionStatus(prev => ({ ...prev, [sectionName]: 'saving' }));
        
        await onSave(sectionName, data);
        
        setSectionStatus(prev => ({ ...prev, [sectionName]: 'saved' }));
        setLastSaved(new Date());
        retryCount.current.set(sectionName, 0);
        
      } catch (error) {
        console.error(`Failed to save section ${sectionName}:`, error);
        
        const currentRetries = retryCount.current.get(sectionName) || 0;
        
        if (currentRetries < retryAttempts) {
          // Retry after delay
          retryCount.current.set(sectionName, currentRetries + 1);
          setTimeout(() => {
            debouncedSave(sectionName, data);
          }, retryDelay);
        } else {
          // Mark as error after max retries
          setSectionStatus(prev => ({ ...prev, [sectionName]: 'error' }));
        }
      } finally {
        setIsSaving(false);
      }
    }, debounceMs),
    [onSave, debounceMs, retryAttempts, retryDelay]
  );

  // Track section changes
  const handleSectionChange = useCallback((newSection: string) => {
    if (activeSection && activeSection !== newSection) {
      // Save the previous section if it has unsaved changes
      const previousData = saveQueue.current.get(activeSection);
      if (previousData) {
        debouncedSave(activeSection, previousData);
        saveQueue.current.delete(activeSection);
      }
    }
    setActiveSection(newSection);
  }, [activeSection, debouncedSave]);

  // Update section data
  const updateSectionData = useCallback((sectionName: string, data: any) => {
    saveQueue.current.set(sectionName, data);
    
    // Mark section as unsaved if it's not currently being saved
    if (sectionStatus[sectionName] !== 'saving') {
      setSectionStatus(prev => ({ ...prev, [sectionName]: 'unsaved' }));
    }
  }, [sectionStatus]);

  // Force save a specific section
  const forceSaveSection = useCallback(async (sectionName: string) => {
    const data = saveQueue.current.get(sectionName);
    if (data) {
      await debouncedSave(sectionName, data);
      saveQueue.current.delete(sectionName);
    }
  }, [debouncedSave]);

  // Force save all sections
  const forceSaveAll = useCallback(async () => {
    const promises = Array.from(saveQueue.current.entries()).map(([sectionName, data]) =>
      debouncedSave(sectionName, data)
    );
    await Promise.all(promises);
    saveQueue.current.clear();
  }, [debouncedSave]);

  // Get unsaved sections count
  const getUnsavedCount = useCallback(() => {
    return Object.values(sectionStatus).filter(status => status === 'unsaved').length;
  }, [sectionStatus]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    return saveQueue.current.size > 0 || getUnsavedCount() > 0;
  }, [getUnsavedCount]);

  // Reset section status
  const resetSectionStatus = useCallback((sectionName: string) => {
    setSectionStatus(prev => ({ ...prev, [sectionName]: 'saved' }));
    saveQueue.current.delete(sectionName);
    retryCount.current.delete(sectionName);
  }, []);

  // Clear all status
  const clearAllStatus = useCallback(() => {
    setSectionStatus({});
    saveQueue.current.clear();
    retryCount.current.clear();
    setActiveSection('');
    setLastSaved(null);
  }, []);

  return {
    activeSection,
    sectionStatus,
    isSaving,
    lastSaved,
    handleSectionChange,
    updateSectionData,
    forceSaveSection,
    forceSaveAll,
    getUnsavedCount,
    hasUnsavedChanges,
    resetSectionStatus,
    clearAllStatus
  };
};

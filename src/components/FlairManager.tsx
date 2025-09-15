// Copyright © 2025 Vishnu Vivek Valeti. All rights reserved.
// Licensed under ComiTe Proprietary License 1.0. See LICENSE.txt.

import { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';

interface FlairManagerProps {
  userId: string;
  onFlairsUpdated: () => void;
}

const FlairManager = ({ userId, onFlairsUpdated }: FlairManagerProps) => {
  const [eligibleGenres, setEligibleGenres] = useState<string[]>([]);
  const [selectedFlairs, setSelectedFlairs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [genres, savedFlairs] = await Promise.all([
        dataService.getEligibleGenres(userId),
        dataService.getUserFlairPreferences(userId)
      ]);
      
      setEligibleGenres(genres);
      setSelectedFlairs(savedFlairs);
    } catch (err) {
      setError('Failed to load flair data');
      console.error('Error loading flair data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFlair = (genre: string) => {
    if (selectedFlairs.includes(genre)) {
      setSelectedFlairs(prev => prev.filter(g => g !== genre));
    } else if (selectedFlairs.length < 3) {
      setSelectedFlairs(prev => [...prev, genre]);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      const success = await dataService.saveUserFlairPreferences(userId, selectedFlairs);
      
      if (success) {
        onFlairsUpdated();
        // Show success feedback (could be a toast in a real app)
        console.log('Flair preferences saved successfully');
      } else {
        setError('Failed to save preferences. Please try again.');
      }
    } catch (err) {
      setError('Failed to save preferences. Please try again.');
      console.error('Error saving flair preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToAuto = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      const success = await dataService.saveUserFlairPreferences(userId, []);
      
      if (success) {
        setSelectedFlairs([]);
        onFlairsUpdated();
        console.log('Reset to auto flairs');
      } else {
        setError('Failed to reset preferences. Please try again.');
      }
    } catch (err) {
      setError('Failed to reset preferences. Please try again.');
      console.error('Error resetting flair preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-manga-surface rounded-lg">
        <h3 className="text-manga-text font-semibold mb-3">Manage Flairs</h3>
        <p className="text-manga-muted text-sm">Loading...</p>
      </div>
    );
  }

  if (eligibleGenres.length === 0) {
    return (
      <div className="p-4 bg-manga-surface rounded-lg">
        <h3 className="text-manga-text font-semibold mb-3">Manage Flairs</h3>
        <p className="text-manga-muted text-sm">
          Read some chapters to unlock genre flairs!
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-manga-surface rounded-lg">
      <h3 className="text-manga-text font-semibold mb-3">Manage Flairs</h3>
      
      {error && (
        <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <p className="text-manga-muted text-sm mb-3">
          Select up to 3 genre flairs to display on your profile:
        </p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {eligibleGenres.map((genre) => (
            <button
              key={genre}
              onClick={() => toggleFlair(genre)}
              disabled={!selectedFlairs.includes(genre) && selectedFlairs.length >= 3}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedFlairs.includes(genre)
                  ? 'bg-manga-accent text-white'
                  : selectedFlairs.length >= 3
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-pressed={selectedFlairs.includes(genre)}
              aria-label={`${selectedFlairs.includes(genre) ? 'Remove' : 'Add'} ${genre} flair`}
            >
              {genre}
            </button>
          ))}
        </div>

        <p className="text-manga-muted text-xs">
          {selectedFlairs.length} of 3 selected
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-manga-accent text-white rounded-lg text-sm font-medium hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Save flair selection"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        
        <button
          onClick={handleResetToAuto}
          disabled={isSaving}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Reset to automatic flair selection"
        >
          Reset to Auto
        </button>
      </div>
    </div>
  );
};

export default FlairManager;

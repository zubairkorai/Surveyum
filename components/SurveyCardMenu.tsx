'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Trash2, Globe, EyeOff, Link as LinkIcon, Loader2 } from 'lucide-react';
import { deleteSurvey, toggleSurveyPublish } from '@/app/(dashboard)/surveys/actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SurveyCardMenuProps {
  surveyId: string;
  isPublished: boolean;
}

export function SurveyCardMenu({ surveyId, isPublished }: SurveyCardMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.ref.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fix: menuRef.current.contains instead of ref.current.contains
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this survey? This action cannot be undone.')) return;
    
    try {
      setIsLoading(true);
      await deleteSurvey(surveyId);
      toast.success('Survey deleted successfully');
    } catch (error) {
      toast.error('Failed to delete survey');
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleTogglePublish = async () => {
    try {
      setIsLoading(true);
      await toggleSurveyPublish(surveyId, isPublished);
      toast.success(isPublished ? 'Survey unpublished' : 'Survey published');
    } catch (error) {
      toast.error('Failed to update survey status');
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/s/${surveyId}`;
    navigator.clipboard.writeText(url);
    toast.success('Survey link copied to clipboard!');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MoreVertical className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50 z-50 py-2 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
          <button 
            onClick={copyLink}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LinkIcon className="w-4 h-4 text-blue-500" />
            Copy Link
          </button>
          
          <button 
            onClick={handleTogglePublish}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {isPublished ? (
              <>
                <EyeOff className="w-4 h-4 text-amber-500" />
                Unpublish
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 text-green-500" />
                Publish
              </>
            )}
          </button>

          <div className="h-px bg-gray-100 my-1 mx-2" />

          <button 
            onClick={handleDelete}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Survey
          </button>
        </div>
      )}
    </div>
  );
}

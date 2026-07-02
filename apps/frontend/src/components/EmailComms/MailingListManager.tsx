import React, { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '../../api/apiClient';
import type { TabId } from './types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Trash2, Info } from 'lucide-react';

interface MailingListManagerProps {
  activeTab: TabId;
}

export default function MailingListManager({
  activeTab,
}: MailingListManagerProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'mass') {
        const res = await apiClient.getEmailSubscribers();
        setEmails(res.emails);
      } else if (activeTab === 'relapsed') {
        const res = await apiClient.getLapsedDonors(6);
        setEmails(res.emails);
      }
    } catch (err) {
      console.error('Failed to fetch list:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'mass' || activeTab === 'relapsed') {
      fetchEmails();
      setIsEditing(false);
      setSearch('');
    }
  }, [activeTab, fetchEmails]);

  const filteredEmails = useMemo(() => {
    if (!search) return emails;
    const lowerSearch = search.toLowerCase();
    return emails.filter((e) => e.toLowerCase().includes(lowerSearch));
  }, [emails, search]);

  if (activeTab === 'donation') {
    return null;
  }

  const handleRemove = async (email: string) => {
    try {
      await apiClient.deleteEmailSubscriber(email);
      setEmails((prev) => prev.filter((e) => e !== email));
    } catch (err) {
      console.error('Failed to remove subscriber:', err);
    }
  };

  const handleSaveList = async () => {
    setSaving(true);
    try {
      const emailArray = editValue
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e);
      await apiClient.syncEmailSubscribers(emailArray);
      await fetchEmails();
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to sync subscribers:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = () => {
    setEditValue(emails.join(', '));
    setIsEditing(true);
  };

  return (
    <div className="flex flex-col gap-3 bg-white border border-slate-100 rounded-md p-5 shadow-sm mt-5">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold">
            {activeTab === 'mass'
              ? 'Mailing List Subscribers'
              : 'Relapsed Donors (6 Months)'}{' '}
            ({emails.length})
          </Label>
          {activeTab === 'relapsed' && (
            <div title="Donors who have not made a successful donation in the last 6 months. This list is generated automatically.">
              <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help transition-colors" />
            </div>
          )}
        </div>

        {activeTab === 'mass' && !isEditing && (
          <Button variant="outline" size="sm" onClick={handleEditClick}>
            Edit List
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading list...</p>
      ) : isEditing ? (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-slate-500">
            Paste comma-separated email addresses below. Note: Saving this will
            exactly match the database to this textbox (adding new and removing
            missing ones).
          </p>
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full h-48 p-3 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-600 outline-none transition"
            placeholder="alice@example.com, bob@example.com..."
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 text-white"
              onClick={handleSaveList}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save List'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emails..."
            className="w-full bg-slate-50"
          />
          <div className="max-h-64 overflow-y-auto border border-slate-100 rounded-md flex flex-col">
            {filteredEmails.length === 0 ? (
              <p className="text-sm text-slate-500 p-3 text-center">
                No emails found.
              </p>
            ) : (
              filteredEmails.map((email) => (
                <div
                  key={email}
                  className="flex justify-between items-center p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm text-slate-700 truncate">
                    {email}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleRemove(email)}
                    title={
                      activeTab === 'mass'
                        ? 'Remove from list'
                        : 'Cancel receiving relapsed email'
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useParams } from 'react-router';
import { Plus, FileText, Trash2, Edit2, Save, X } from 'lucide-react';

export function TripNotes() {
  const { tripId } = useParams();
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'Hotel Check-in Info',
      content: 'Hotel Ritz Paris\nCheck-in: 3:00 PM\nConfirmation: #ABC123\nContact: +33 1 43 16 30 30',
      date: '2026-05-08',
      stopName: 'Paris',
    },
    {
      id: 2,
      title: 'Restaurant Recommendations',
      content: 'Must try:\n- Le Cinq (Michelin 3-star)\n- L\'Ambroisie (reservations required)\n- Bistrot Paul Bert (casual)',
      date: '2026-05-09',
      stopName: 'Paris',
    },
    {
      id: 3,
      title: 'Emergency Contacts',
      content: 'Embassy: +33 1 43 12 22 22\nTravel Insurance: +1-800-123-4567\nLocal Guide: Pierre +33 6 12 34 56 78',
      date: '2026-05-09',
      stopName: null,
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  const saveNote = () => {
    if (newNote.title && newNote.content) {
      setNotes([...notes, {
        id: Date.now(),
        ...newNote,
        date: new Date().toISOString().split('T')[0],
        stopName: null,
      }]);
      setNewNote({ title: '', content: '' });
      setIsAdding(false);
    }
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Trip Notes & Journal</h1>
          <p className="text-gray-600">Keep track of important information and memories</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white px-6 py-3 rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          New Note
        </button>
      </div>

      {/* Add Note Form */}
      {isAdding && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-[#2563EB]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#0F172A]">New Note</h3>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewNote({ title: '', content: '' });
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Note title..."
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all font-medium"
            />
            <textarea
              placeholder="Write your note here..."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={saveNote}
                className="flex-1 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white py-3 rounded-lg font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Note
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewNote({ title: '', content: '' });
                }}
                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <div
            key={note.id}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:scale-[1.02]"
          >
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#0F172A] mb-1">{note.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{new Date(note.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    {note.stopName && (
                      <>
                        <span>•</span>
                        <span>{note.stopName}</span>
                      </>
                    )}
                  </div>
                </div>
                <FileText className="w-8 h-8 text-[#2563EB] opacity-20" />
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-6 mb-4">
                {note.content}
              </p>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setEditingId(note.id)}
                  className="flex-1 px-4 py-2 bg-blue-50 text-[#2563EB] rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notes.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No notes yet</h3>
          <p className="text-gray-600 mb-6">Start documenting your trip details and memories</p>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white px-6 py-3 rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create First Note
          </button>
        </div>
      )}
    </div>
  );
}

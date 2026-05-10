import { useState } from 'react';
import { useParams } from 'react-router';
import { Plus, Package, Trash2, Check } from 'lucide-react';

export function PackingChecklist() {
  const { tripId } = useParams();
  const [newItem, setNewItem] = useState('');
  const [items, setItems] = useState([
    { id: 1, name: 'Passport', category: 'Documents', isPacked: true },
    { id: 2, name: 'Travel Insurance', category: 'Documents', isPacked: true },
    { id: 3, name: 'Flight Tickets', category: 'Documents', isPacked: false },
    { id: 4, name: 'T-shirts (5)', category: 'Clothing', isPacked: true },
    { id: 5, name: 'Jeans (2)', category: 'Clothing', isPacked: false },
    { id: 6, name: 'Jacket', category: 'Clothing', isPacked: false },
    { id: 7, name: 'Laptop', category: 'Electronics', isPacked: true },
    { id: 8, name: 'Phone Charger', category: 'Electronics', isPacked: false },
    { id: 9, name: 'Camera', category: 'Electronics', isPacked: false },
    { id: 10, name: 'Toothbrush', category: 'Toiletries', isPacked: true },
    { id: 11, name: 'Sunscreen', category: 'Toiletries', isPacked: false },
  ]);

  const categories = ['All', 'Documents', 'Clothing', 'Electronics', 'Toiletries'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const togglePacked = (id: number) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, isPacked: !item.isPacked } : item
    ));
  };

  const deleteItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, {
        id: Date.now(),
        name: newItem,
        category: selectedCategory === 'All' ? 'General' : selectedCategory,
        isPacked: false,
      }]);
      setNewItem('');
    }
  };

  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter(item => item.category === selectedCategory);

  const packedCount = items.filter(item => item.isPacked).length;
  const totalCount = items.length;
  const progress = (packedCount / totalCount) * 100;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Packing Checklist</h1>
        <p className="text-gray-600">Stay organized and don't forget anything important</p>
      </div>

      {/* Progress Card */}
      <div className="bg-gradient-to-br from-[#2563EB] to-[#06B6D4] rounded-2xl p-8 shadow-2xl shadow-blue-500/20 mb-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{packedCount} / {totalCount} Items Packed</h2>
            <p className="text-white/80">You're {progress.toFixed(0)}% ready!</p>
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Add Item */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Add new item..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
          />
          <button
            onClick={addItem}
            className="px-6 py-3 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white rounded-lg font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-105 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white shadow-lg shadow-blue-500/30'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`group flex items-center gap-4 p-4 rounded-xl transition-all ${
              item.isPacked
                ? 'bg-green-50 border-2 border-green-200'
                : 'bg-white border-2 border-gray-100 hover:border-gray-200'
            }`}
          >
            <button
              onClick={() => togglePacked(item.id)}
              className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                item.isPacked
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300 hover:border-[#2563EB]'
              }`}
            >
              {item.isPacked && <Check className="w-4 h-4 text-white" />}
            </button>

            <div className="flex-1">
              <h4 className={`font-medium ${item.isPacked ? 'text-green-900 line-through' : 'text-gray-900'}`}>
                {item.name}
              </h4>
              <p className="text-xs text-gray-500">{item.category}</p>
            </div>

            <button
              onClick={() => deleteItem(item.id)}
              className="flex-shrink-0 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No items in this category</h3>
          <p className="text-gray-600">Add your first item to get started</p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Card } from '@/components/ui';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  name: string;
  items: FAQItem[];
}

interface FAQEditorProps {
  content: string;
  onChange: (html: string) => void;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function parseHTMLToFAQ(html: string): FAQCategory[] {
  if (typeof window === 'undefined') return [];

  const categories: FAQCategory[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const elements = Array.from(doc.body.children);

  let currentCategory: FAQCategory = { id: generateId(), name: 'General', items: [] };
  let currentQuestion = '';
  let currentAnswer = '';

  elements.forEach((el) => {
    const tagName = el.tagName.toLowerCase();

    // H3 without question mark = category
    if (tagName === 'h3' && !el.textContent?.includes('?')) {
      // Save previous Q&A if exists
      if (currentQuestion && currentAnswer) {
        currentCategory.items.push({
          id: generateId(),
          question: currentQuestion,
          answer: currentAnswer,
        });
      }
      // Save previous category if it has items
      if (currentCategory.items.length > 0 || currentCategory.name !== 'General') {
        if (currentCategory.items.length > 0) {
          categories.push(currentCategory);
        }
      }
      currentCategory = { id: generateId(), name: el.textContent?.trim() || 'General', items: [] };
      currentQuestion = '';
      currentAnswer = '';
    }
    // H4 = question
    else if (tagName === 'h4') {
      // Save previous Q&A if exists
      if (currentQuestion && currentAnswer) {
        currentCategory.items.push({
          id: generateId(),
          question: currentQuestion,
          answer: currentAnswer,
        });
      }
      currentQuestion = el.textContent?.trim() || '';
      currentAnswer = '';
    }
    // P = answer content
    else if (currentQuestion && tagName === 'p') {
      currentAnswer += el.textContent?.trim() + '\n\n';
    }
  });

  // Don't forget the last Q&A and category
  if (currentQuestion && currentAnswer) {
    currentCategory.items.push({
      id: generateId(),
      question: currentQuestion,
      answer: currentAnswer.trim(),
    });
  }
  if (currentCategory.items.length > 0) {
    categories.push(currentCategory);
  }

  // If no categories were found, create a default one
  if (categories.length === 0) {
    categories.push({ id: generateId(), name: 'General', items: [] });
  }

  return categories;
}

function convertFAQToHTML(categories: FAQCategory[]): string {
  let html = '';

  categories.forEach((category) => {
    if (category.items.length === 0) return;

    html += `<h3>${category.name}</h3>\n`;

    category.items.forEach((item) => {
      html += `<h4>${item.question}</h4>\n`;
      // Split answer into paragraphs
      const paragraphs = item.answer.split('\n\n').filter(p => p.trim());
      paragraphs.forEach((p) => {
        html += `<p>${p.trim()}</p>\n`;
      });
      html += '\n';
    });
  });

  return html.trim();
}

function FAQItemEditor({
  item,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: {
  item: FAQItem;
  onUpdate: (item: FAQItem) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <div
        className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="flex-1 font-medium text-gray-900 text-sm">{item.question || 'New Question'}</span>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            title="Move up"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            title="Move down"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-400 hover:text-red-600"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-3 pt-0 space-y-3 border-t border-gray-100">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Question</label>
            <Input
              value={item.question}
              onChange={(e) => onUpdate({ ...item, question: e.target.value })}
              placeholder="Enter the question..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Answer</label>
            <textarea
              value={item.answer}
              onChange={(e) => onUpdate({ ...item, answer: e.target.value })}
              placeholder="Enter the answer..."
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-400 mt-1">Use blank lines to separate paragraphs</p>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryEditor({
  category,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  category: FAQCategory;
  onUpdate: (category: FAQCategory) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const addItem = () => {
    onUpdate({
      ...category,
      items: [...category.items, { id: generateId(), question: '', answer: '' }],
    });
  };

  const updateItem = (index: number, item: FAQItem) => {
    const newItems = [...category.items];
    newItems[index] = item;
    onUpdate({ ...category, items: newItems });
  };

  const deleteItem = (index: number) => {
    onUpdate({
      ...category,
      items: category.items.filter((_, i) => i !== index),
    });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...category.items];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    onUpdate({ ...category, items: newItems });
  };

  return (
    <div className="border border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
      <div className="flex items-center gap-2 p-4 bg-white border-b border-gray-200">
        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400">
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <Input
          value={category.name}
          onChange={(e) => onUpdate({ ...category, name: e.target.value })}
          placeholder="Category name..."
          className="flex-1 font-semibold"
        />
        <span className="text-sm text-gray-500">{category.items.length} questions</span>
        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-400 hover:text-red-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-2">
          {category.items.map((item, index) => (
            <FAQItemEditor
              key={item.id}
              item={item}
              onUpdate={(updated) => updateItem(index, updated)}
              onDelete={() => deleteItem(index)}
              onMoveUp={() => moveItem(index, 'up')}
              onMoveDown={() => moveItem(index, 'down')}
              isFirst={index === 0}
              isLast={index === category.items.length - 1}
            />
          ))}

          <button
            onClick={addItem}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
          >
            + Add Question
          </button>
        </div>
      )}
    </div>
  );
}

export function FAQEditor({ content, onChange }: FAQEditorProps) {
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !initialized) {
      setCategories(parseHTMLToFAQ(content));
      setInitialized(true);
    }
  }, [content, initialized, mounted]);

  useEffect(() => {
    if (initialized) {
      onChange(convertFAQToHTML(categories));
    }
  }, [categories, initialized, onChange]);

  const addCategory = () => {
    setCategories([...categories, { id: generateId(), name: 'New Category', items: [] }]);
  };

  const updateCategory = (index: number, category: FAQCategory) => {
    const newCategories = [...categories];
    newCategories[index] = category;
    setCategories(newCategories);
  };

  const deleteCategory = (index: number) => {
    if (categories.length === 1) {
      alert('You must have at least one category');
      return;
    }
    setCategories(categories.filter((_, i) => i !== index));
  };

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const newCategories = [...categories];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newCategories[index], newCategories[newIndex]] = [newCategories[newIndex], newCategories[index]];
    setCategories(newCategories);
  };

  if (!mounted) {
    return (
      <div className="border border-gray-300 rounded-lg p-8 bg-gray-50">
        <div className="text-center text-gray-500">Loading FAQ editor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Organize your FAQ into categories and questions. Changes are saved when you click "Save Changes".
        </p>
        <Button variant="outline" size="sm" onClick={addCategory}>
          + Add Category
        </Button>
      </div>

      <div className="space-y-4">
        {categories.map((category, index) => (
          <CategoryEditor
            key={category.id}
            category={category}
            onUpdate={(updated) => updateCategory(index, updated)}
            onDelete={() => deleteCategory(index)}
            onMoveUp={() => moveCategory(index, 'up')}
            onMoveDown={() => moveCategory(index, 'down')}
            isFirst={index === 0}
            isLast={index === categories.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

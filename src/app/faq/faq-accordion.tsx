'use client';

import { useState, useMemo } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface FAQAccordionProps {
  content: string;
}

function parseHTMLToFAQ(html: string): { categories: Map<string, FAQItem[]> } {
  const categories = new Map<string, FAQItem[]>();

  // Create a temporary div to parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const elements = Array.from(doc.body.children);

  let currentCategory = 'General';
  let currentQuestion = '';
  let currentAnswer = '';

  elements.forEach((el) => {
    const tagName = el.tagName.toLowerCase();

    // H2 or H3 without a question mark = category
    if ((tagName === 'h2' || tagName === 'h3') && !el.textContent?.includes('?')) {
      // Save previous Q&A if exists
      if (currentQuestion && currentAnswer) {
        if (!categories.has(currentCategory)) {
          categories.set(currentCategory, []);
        }
        categories.get(currentCategory)!.push({
          question: currentQuestion,
          answer: currentAnswer,
          category: currentCategory,
        });
      }
      currentCategory = el.textContent?.trim() || 'General';
      currentQuestion = '';
      currentAnswer = '';
    }
    // H3 or H4 with question mark = question
    else if ((tagName === 'h3' || tagName === 'h4') && el.textContent?.includes('?')) {
      // Save previous Q&A if exists
      if (currentQuestion && currentAnswer) {
        if (!categories.has(currentCategory)) {
          categories.set(currentCategory, []);
        }
        categories.get(currentCategory)!.push({
          question: currentQuestion,
          answer: currentAnswer,
          category: currentCategory,
        });
      }
      currentQuestion = el.textContent?.trim() || '';
      currentAnswer = '';
    }
    // Everything else is part of the answer
    else if (currentQuestion) {
      currentAnswer += el.outerHTML;
    }
  });

  // Don't forget the last Q&A
  if (currentQuestion && currentAnswer) {
    if (!categories.has(currentCategory)) {
      categories.set(currentCategory, []);
    }
    categories.get(currentCategory)!.push({
      question: currentQuestion,
      answer: currentAnswer,
      category: currentCategory,
    });
  }

  return { categories };
}

function AccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full py-4 px-4 flex items-center justify-between text-left bg-primary-600 hover:bg-primary-700 transition-colors"
      >
        <span className="font-medium text-white pr-4">{item.question}</span>
        <span className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div
          className="py-5 px-6 pl-8 prose prose-sm prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: item.answer }}
        />
      </div>
    </div>
  );
}

export function FAQAccordion({ content }: FAQAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const { categories } = useMemo(() => {
    if (typeof window === 'undefined') {
      return { categories: new Map() };
    }
    return parseHTMLToFAQ(content);
  }, [content]);

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allKeys = new Set<string>();
    categories.forEach((items, category) => {
      items.forEach((_item: FAQItem, index: number) => {
        allKeys.add(`${category}-${index}`);
      });
    });
    setOpenItems(allKeys);
  };

  const collapseAll = () => {
    setOpenItems(new Set());
  };

  if (categories.size === 0) {
    return (
      <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
    );
  }

  return (
    <div>
      <div className="flex justify-end gap-4 mb-6">
        <button
          onClick={expandAll}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Expand all
        </button>
        <button
          onClick={collapseAll}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Collapse all
        </button>
      </div>

      <div className="space-y-8">
        {Array.from(categories.entries()).map(([category, items]) => (
          <div key={category}>
            {categories.size > 1 && (
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-primary-500">
                {category}
              </h2>
            )}
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200 overflow-hidden">
              {items.map((item: FAQItem, index: number) => (
                <AccordionItem
                  key={`${category}-${index}`}
                  item={item}
                  isOpen={openItems.has(`${category}-${index}`)}
                  onToggle={() => toggleItem(`${category}-${index}`)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

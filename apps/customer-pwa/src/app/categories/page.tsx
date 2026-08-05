import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
}

export default async function CategoriesPage() {
  let categories: Category[] = [];
  try {
    categories = await apiFetch<Category[]>('/categories');
  } catch (error) {
    console.error('Failed to load categories', error);
  }

  // Group top level vs other
  const topLevelSlugs = ['men', 'women', 'kids'];
  const topCategories = categories.filter(c => topLevelSlugs.includes(c.slug));
  const otherCategories = categories.filter(c => !topLevelSlugs.includes(c.slug));

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto min-h-screen bg-neutral-50/50">
      <h1 className="text-2xl font-bold mb-6 tracking-tight text-neutral-900 px-1">Shop by Category</h1>

      {/* Hero Categories Grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {topCategories.map((category, index) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className={`relative rounded-2xl overflow-hidden block group shadow-sm transition-transform active:scale-[0.98] ${
              index === 2 ? 'col-span-2 aspect-[2.5/1]' : 'aspect-[4/5]'
            }`}
          >
            {category.imageUrl ? (
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="absolute inset-0 bg-neutral-200" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <h2 className="text-white font-bold text-xl tracking-tight">{category.name}</h2>
            </div>
          </Link>
        ))}
      </div>

      {/* Other Categories List */}
      <h2 className="text-lg font-bold mb-4 tracking-tight text-neutral-900 px-1">More to explore</h2>
      <div className="flex flex-col gap-3">
        {otherCategories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="flex items-center justify-between p-5 rounded-2xl bg-white border border-neutral-100 shadow-sm active:bg-neutral-50 transition-colors"
          >
            <span className="font-semibold text-neutral-800 text-lg tracking-tight">{category.name}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-300">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}

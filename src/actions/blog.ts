'use server';

import { db } from '@/lib/firebase-admin';
import type { BlogPost } from '@/types';


function parseFirestoreDate(val: any): string {
  if (!val) return new Date().toISOString();
  if (typeof val.toDate === 'function') return val.toDate().toISOString();
  if (val && typeof val._seconds === 'number') return new Date(val._seconds * 1000).toISOString();
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const snap = await db.collection('web_blog').get();

    if (!snap || snap.empty) {
      return [];
    }

    const posts = snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        slug: data.slug || doc.id,
        title: data.title || '',
        titleEn: data.titleEn || '',
        excerpt: data.excerpt || '',
        excerptEn: data.excerptEn || '',
        content: data.contentHtml || data.content || '',
        contentEn: data.contentEn || '',
        coverImage: data.coverImage || 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=1600',
        authorName: data.author || data.authorName || 'فريق مساري',
        authorAvatar: data.authorAvatar || '',
        category: data.category || data.categoryId || 'عام',
        categoryEn: data.categoryEn || 'General',
        tags: data.tags || [],
        readTimeMinutes: data.readTime || data.readTimeMinutes || 5,
        publishedAt: parseFirestoreDate(data.publishedAt || data.createdAt || data.updatedAt),
        isPublished: data.status ? data.status === 'published' : (data.isPublished !== undefined ? data.isPublished : true),
      };
    }).filter(p => p.isPublished);

    posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return posts;
  } catch (error) {
    console.error('Error in getBlogPosts:', error);
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const cleanSlug = slug.trim().toLowerCase();
    // 1. Direct Document ID lookup
    const directDoc = await db.collection('web_blog').doc(cleanSlug).get();
    let doc = directDoc.exists ? directDoc : null;

    // 2. Query fallback by slug field
    if (!doc) {
      const snap = await db.collection('web_blog').where('slug', '==', cleanSlug).limit(1).get();
      if (!snap.empty) {
        doc = snap.docs[0];
      }
    }

    if (!doc || !doc.exists) {
      return null;
    }

    const data = doc.data() || {};
    const isPublished = data.status ? data.status === 'published' : (data.isPublished !== undefined ? data.isPublished : true);
    if (!isPublished) {
      return null;
    }

    return {
      id: doc.id,
      slug: data.slug || doc.id,
      title: data.title || '',
      titleEn: data.titleEn || '',
      excerpt: data.excerpt || '',
      excerptEn: data.excerptEn || '',
      content: data.contentHtml || data.content || '',
      contentEn: data.contentEn || '',
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=1600',
      authorName: data.author || data.authorName || 'فريق مساري',
      authorAvatar: data.authorAvatar || '',
      category: data.category || data.categoryId || 'عام',
      categoryEn: data.categoryEn || 'General',
      tags: data.tags || [],
      readTimeMinutes: data.readTime || data.readTimeMinutes || 5,
      publishedAt: parseFirestoreDate(data.publishedAt || data.createdAt || data.updatedAt),
      isPublished: true,
    };
  } catch (error) {
    console.error('Error fetching blog post by slug:', error);
    return null;
  }
}

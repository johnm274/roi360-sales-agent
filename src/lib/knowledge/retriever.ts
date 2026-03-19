import { db } from '@/lib/db/client';
import { knowledgeFiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
    KNOWLEDGE_CATEGORIES,
    type KnowledgeCategory,
} from './constants';

export function selectCategories(
    userMessage: string,
): KnowledgeCategory[] {
    const lower = userMessage.toLowerCase();
    const scores: Record<string, number> = {};

    for (const [
        category,
        config,
    ] of Object.entries(KNOWLEDGE_CATEGORIES)) {
        let score = 0;
        for (const keyword of config.keywords) {
            if (lower.includes(keyword)) {
                score += 1;
            }
        }
        if (score > 0) {
            scores[category] = score;
        }
    }

    // Sort by score descending, take top 3
    const sorted = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([cat]) => cat as KnowledgeCategory);

    // If no keywords matched, return general categories
    if (sorted.length === 0) {
        return [
            'product-knowledge',
            'sales-process',
        ];
    }

    return sorted;
}

export async function loadCategoryContent(
    category: KnowledgeCategory,
): Promise<string | null> {
    const config = KNOWLEDGE_CATEGORIES[category];
    if (!config) return null;

    try {
        const rows = await db
            .select({
                content: knowledgeFiles.content,
            })
            .from(knowledgeFiles)
            .where(
                eq(
                    knowledgeFiles.filename,
                    config.file,
                ),
            );

        return rows[0]?.content || null;
    } catch {
        return null;
    }
}

export async function loadAllKnowledge(): Promise<string> {
    try {
        const rows = await db
            .select({
                content: knowledgeFiles.content,
            })
            .from(knowledgeFiles);

        return rows
            .map((r) => r.content)
            .filter(Boolean)
            .join('\n\n---\n\n');
    } catch {
        return '';
    }
}

export async function getContextForMessage(
    userMessage: string,
): Promise<string> {
    const categories =
        selectCategories(userMessage);

    const contents = await Promise.all(
        categories.map(async (cat) => {
            const content =
                await loadCategoryContent(cat);
            if (!content) return '';
            const label =
                KNOWLEDGE_CATEGORIES[cat].label;
            return `## ${label}\n\n${content}`;
        }),
    );

    return contents.filter(Boolean).join('\n\n---\n\n');
}

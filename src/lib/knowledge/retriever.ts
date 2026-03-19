import fs from 'fs';
import path from 'path';
import {
    KNOWLEDGE_CATEGORIES,
    type KnowledgeCategory,
} from './constants';

function getKnowledgeDir(): string {
    return (
        process.env.KNOWLEDGE_SOURCE_DIR ||
        path.join(process.cwd(), 'knowledge', 'source')
    );
}

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

export function loadCategoryContent(
    category: KnowledgeCategory,
): string | null {
    const config = KNOWLEDGE_CATEGORIES[category];
    if (!config) return null;

    const filePath = path.join(
        getKnowledgeDir(),
        config.file,
    );

    try {
        return fs.readFileSync(filePath, 'utf-8');
    } catch {
        return null;
    }
}

export function loadAllKnowledge(): string {
    const dir = getKnowledgeDir();
    const files = fs.readdirSync(dir).filter(
        (f) => f.endsWith('.md'),
    );

    return files
        .map((f) => {
            try {
                return fs.readFileSync(
                    path.join(dir, f),
                    'utf-8',
                );
            } catch {
                return '';
            }
        })
        .filter(Boolean)
        .join('\n\n---\n\n');
}

export function getContextForMessage(
    userMessage: string,
): string {
    const categories =
        selectCategories(userMessage);

    const contents = categories
        .map((cat) => {
            const content =
                loadCategoryContent(cat);
            if (!content) return '';
            const label =
                KNOWLEDGE_CATEGORIES[cat].label;
            return `## ${label}\n\n${content}`;
        })
        .filter(Boolean);

    return contents.join('\n\n---\n\n');
}

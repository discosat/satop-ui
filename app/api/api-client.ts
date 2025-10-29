import { revalidateTag } from 'next/cache';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || 'http://localhost:5111/api/v1';

// Helper to extract resource tags from a path
function getTagsFromPath(path: string): string[] {
    const tags: string[] = [];
    
    // Extract resource type from path (e.g., /flight-plans -> flight-plans)
    const pathParts = path.split('/').filter(Boolean);
    if (pathParts.length > 0) {
        tags.push(pathParts[0]); // e.g., 'flight-plans'
        
        // If it's a specific resource (e.g., /flight-plans/123), add that ID tag
        if (pathParts.length >= 2 && !isNaN(Number(pathParts[1]))) {
            tags.push(`${pathParts[0]}:${pathParts[1]}`); // e.g., 'flight-plans:123'
        }
    }
    
    return tags;
}

async function apiFetch(path: string, options: RequestInit = {}) {
    const { currentSession } = await import('@/lib/session');
    const session = await currentSession();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (session?.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`;
    }

    // Build tags for caching
    const tags = getTagsFromPath(path);
    const method = options.method || 'GET';
    
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            ...headers,
            ...options.headers,
        },
        next: { revalidate: 60, tags, ...options.next },
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: response.statusText }));
        const errorMessage = errorBody.detail || errorBody.title || errorBody.message || `API Error: ${response.status}`;
        console.error(`API Fetch Error on path ${path}:`, errorMessage);
        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return null;
    }

    const data = await response.json();
    
    // Revalidate tags on mutation methods
    if (method !== 'GET' && method !== 'HEAD') {
        tags.forEach(tag => revalidateTag(tag));
    }
    
    return data;
}

export const apiClient = {
    get: <TResponse>(path: string): Promise<TResponse> => apiFetch(path, { method: 'GET' }),
    
    post: <TBody, TResponse>(path: string, body: TBody): Promise<TResponse> => 
        apiFetch(path, { method: 'POST', body: JSON.stringify(body) }),

    patch: <TBody, TResponse>(path: string, body: TBody): Promise<TResponse> => 
        apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }),

    put: <TBody, TResponse>(path: string, body: TBody): Promise<TResponse> => 
        apiFetch(path, { method: 'PUT', body: JSON.stringify(body) }),
        
    delete: <TResponse>(path: string): Promise<TResponse | null> => 
        apiFetch(path, { method: 'DELETE' }),
};